/**
 * Cliente HTTP de la API de KNET (knet-backend).
 *
 * - URL base: VITE_API_URL (por defecto http://localhost:4000). Si se define vacía, la API
 *   queda desactivada y el frontend funciona solo con datos locales (útil en un deploy estático).
 * - Sesión: tras login/registro/LinkedIn se guardan access y refresh token en localStorage
 *   ("knet-auth") y cada petición lleva Authorization: Bearer. Ante un 401 se refresca el token una
 *   sola vez (una única petición de refresh aunque haya varias en vuelo) y se repite la petición; si el
 *   refresh falla, se borra la sesión y se avisa con el evento "session-expired".
 * - Solo en desarrollo (import.meta.env.DEV) y sin sesión: header X-User-Id tomado de
 *   localStorage ("knet-api-user") o de VITE_DEMO_USER_ID; sin ninguno, el backend usa su usuario demo.
 * - Errores: ApiOffline si la API no responde (red, timeout, 503) para que el motor haga fallback a
 *   lo local; ApiError(status, body) si el servidor respondió con un error HTTP. Un 409
 *   legal_outdated además emite el evento "legal-outdated".
 */

const RAW_URL = import.meta.env.VITE_API_URL;
// Sin VITE_API_URL: en desarrollo, el backend local; en un build de producción, modo local (nunca localhost,
// que además bloquearía la CSP). Para usar la API en producción hay que definir VITE_API_URL al construir.
const DEFAULT_URL = import.meta.env.DEV ? "http://localhost:4000" : "";
export const API_URL = (RAW_URL === undefined ? DEFAULT_URL : String(RAW_URL)).trim().replace(/\/+$/, "");
export const apiEnabled = API_URL !== "";

const USER_KEY = "knet-api-user";
const AUTH_KEY = "knet-auth";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMEOUT_MS = 4000;
export const AI_TIMEOUT_MS = 30000; // las respuestas del LLM tardan más que el resto de la API
const DEV = !!import.meta.env.DEV;

export class ApiOffline extends Error {
  constructor(message) { super(message); this.name = "ApiOffline"; }
}

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body && body.error;
    this.body = body;
  }
}

export const isOffline = (e) => e instanceof ApiOffline;

/* ---------- Eventos para el motor: session-expired, legal-outdated, session-changed ---------- */
const listeners = {};
export function onApiEvent(type, fn) { (listeners[type] ||= new Set()).add(fn); return () => listeners[type].delete(fn); }
function emit(type, detail) { (listeners[type] || []).forEach((fn) => { try { fn(detail); } catch { /* el listener no rompe la petición */ } }); }

/* ---------- Sesión ---------- */
let session = null;
try { session = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { session = null; }
if (session && !(session.accessToken && session.refreshToken && UUID.test(session.userId || ""))) session = null;

function writeSession(s) {
  session = s;
  try { if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(AUTH_KEY); } catch { /* almacenamiento bloqueado */ }
  emit("session-changed", s ? { userId: s.userId } : null);
}

/** Guarda la respuesta de /register, /login o /exchange (incluye user) */
function adoptSession(r) {
  writeSession({ accessToken: r.accessToken, refreshToken: r.refreshToken, refreshExpiresAt: r.refreshExpiresAt, userId: r.user.id, email: r.user.email });
  return r;
}

export const hasSession = () => !!session;
export const sessionUserId = () => (session ? session.userId : null);
export const sessionEmail = () => (session ? session.email : null);
export function clearSession() { writeSession(null); }

/** Id de la cuenta de la API: la de la sesión o, solo en desarrollo, el UUID de knet-api-user / VITE_DEMO_USER_ID */
export function getUserId() {
  if (session) return session.userId;
  if (!DEV) return null;
  let id = null;
  try { id = localStorage.getItem(USER_KEY); } catch { /* almacenamiento bloqueado */ }
  id = id || import.meta.env.VITE_DEMO_USER_ID || null;
  return id && UUID.test(id) ? id : null;
}

/** Solo desarrollo: fija el UUID de knet-api-user (null lo borra) */
export function setUserId(id) {
  try {
    if (id && UUID.test(id)) localStorage.setItem(USER_KEY, id);
    else localStorage.removeItem(USER_KEY);
  } catch { /* almacenamiento bloqueado */ }
}

/** ¿Hay una cuenta con la que hablar con /api/me? (sesión real o, en desarrollo, X-User-Id / demo) */
export const accountAvailable = () => apiEnabled && (hasSession() || DEV);

/* ---------- Transporte ---------- */
async function send(method, path, body, headers, timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(API_URL + path, {
      method, headers, signal: ctrl.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiOffline(e && e.name === "AbortError" ? "La API no respondió a tiempo" : "No hay conexión con la API");
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  return { res, data };
}

let refreshing = null;
/** Refresca el access token una sola vez aunque lo pidan varias peticiones a la vez. true = hay token nuevo */
function refreshSession() {
  if (!session) return Promise.resolve(false);
  if (refreshing) return refreshing;
  const current = session;
  refreshing = (async () => {
    try {
      const { res, data } = await send("POST", "/api/auth/refresh", { refreshToken: current.refreshToken },
        { Accept: "application/json", "Content-Type": "application/json" }, TIMEOUT_MS);
      if (res.status === 503) throw new ApiOffline("API no disponible");
      if (!res.ok) {
        if (session === current) { writeSession(null); emit("session-expired", { reason: (data && data.error) || res.status }); }
        return false;
      }
      if (session === current) writeSession({ ...current, accessToken: data.accessToken, refreshToken: data.refreshToken, refreshExpiresAt: data.refreshExpiresAt });
      return true;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * opts.userId: envía la petición como esa cuenta (consentimientos pendientes, borrado diferido).
 *   Si es la de la sesión va con Bearer; si es otra, solo en desarrollo con X-User-Id.
 * opts.auth = false: petición pública (sin Bearer ni X-User-Id). opts.timeout: ms (4 s por defecto).
 */
async function request(method, path, body, { userId, auth = true, timeout = TIMEOUT_MS } = {}, retried = false) {
  if (!apiEnabled) throw new ApiOffline("API desactivada (VITE_API_URL vacía)");
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let usedBearer = false;
  if (auth) {
    const forOther = userId && UUID.test(userId) && (!session || session.userId !== userId);
    if (!forOther && session) { headers.Authorization = `Bearer ${session.accessToken}`; usedBearer = true; }
    else if (DEV) { const uid = forOther ? userId : getUserId(); if (uid) headers["X-User-Id"] = uid; }
  }

  const { res, data } = await send(method, path, body, headers, timeout);
  // 503 = la API está arriba pero sin base de datos (o sin IA): para el frontend es lo mismo que estar apagada
  if (res.status === 503) throw new ApiOffline((data && data.message) || "API no disponible");
  if (res.status === 401 && usedBearer && !retried) {
    if (await refreshSession()) return request(method, path, body, { userId, auth, timeout }, true);
  }
  if (res.status === 409 && data && data.error === "legal_outdated") emit("legal-outdated", { required: data.required });
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const enc = encodeURIComponent;

export const api = {
  health: () => request("GET", "/health", undefined, { auth: false }),

  // Autenticación
  providers: () => request("GET", "/api/auth/providers", undefined, { auth: false }),
  signUp: (body) => request("POST", "/api/auth/register", body, { auth: false }).then(adoptSession),
  login: (email, password) => request("POST", "/api/auth/login", { email, password }, { auth: false }).then(adoptSession),
  exchange: (code) => request("POST", "/api/auth/exchange", { code }, { auth: false }).then(adoptSession),
  /** Revoca el refresh token en el servidor (si responde) y borra la sesión local siempre */
  logout: async () => {
    const s = session;
    writeSession(null);
    if (s) { try { await request("POST", "/api/auth/logout", { refreshToken: s.refreshToken }, { auth: false }); } catch { /* sin conexión: el token caduca solo */ } }
  },
  /** URL a la que navegar para el OAuth de LinkedIn (scopes = campos marcados en la pantalla de permiso) */
  linkedinUrl: ({ scopes = [], legalVersion, returnTo }) =>
    `${API_URL}/api/auth/linkedin?${new URLSearchParams({ scopes: scopes.join(","), legalVersion, returnTo })}`,

  // Perfil
  getMe: () => request("GET", "/api/me"),
  updateMe: (patch) => request("PATCH", "/api/me", patch),
  // Supresión: borra perfil y progreso; los consentimientos se conservan. 403 demo_account en cuentas demo.
  deleteMe: (userId) => request("DELETE", "/api/me", undefined, { userId }),

  // Consentimientos (cadena SHA-256 de solo inserción en PostgreSQL)
  listConsents: () => request("GET", "/api/me/consents"),
  addConsent: (body, userId) => request("POST", "/api/me/consents", body, { userId }),

  // Eventos e inscripciones
  listEvents: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
    return request("GET", `/api/events${q ? `?${q}` : ""}`);
  },
  getEvent: (id) => request("GET", `/api/events/${enc(id)}`),
  register: (eventId) => request("POST", `/api/me/registrations/${enc(eventId)}`),
  unregister: (eventId) => request("DELETE", `/api/me/registrations/${enc(eventId)}`),

  // Misiones y XP
  listMissions: () => request("GET", "/api/me/missions"),
  completeMission: (code) => request("POST", `/api/me/missions/${enc(code)}/complete`),

  // Sesiones y check-ins. listSessions aún no pinta la agenda: el frontend conserva sus títulos personalizados.
  listSessions: (eventId, day = 0) => request("GET", `/api/events/${enc(eventId)}/sessions?day=${Number(day) || 0}`),
  listCheckins: (eventId) => request("GET", `/api/me/checkins${eventId ? `?eventId=${enc(eventId)}` : ""}`),
  checkin: (sessionCode, method = "qr") => request("POST", "/api/me/checkins", { sessionCode, method }),

  // Red de contactos
  listContacts: (industry) => request("GET", `/api/contacts${industry ? `?industry=${enc(industry)}` : ""}`),
  listConnections: (status) => request("GET", `/api/me/connections${status ? `?status=${enc(status)}` : ""}`),
  createConnection: (body) => request("POST", "/api/me/connections", body),
  acceptConnection: (id) => request("PATCH", `/api/me/connections/${enc(id)}`, { status: "accepted" }),
  deleteConnection: (id) => request("DELETE", `/api/me/connections/${enc(id)}`),
  // Asistentes inscritos al evento que comparten su red (tarjeta pública + estado de la conexión)
  listAttendees: (eventId, { limit = 50, offset = 0 } = {}) => request("GET", `/api/me/attendees?eventId=${enc(eventId)}&limit=${enc(limit)}&offset=${enc(offset)}`),
  leaderboard: (eventId, { scope = "event", limit = 50 } = {}) => request("GET", `/api/me/leaderboard?eventId=${enc(eventId)}&scope=${enc(scope)}&limit=${enc(limit)}`),

  // IA (Claude en el servidor). Timeout largo; 503 ai_unavailable llega como ApiOffline → el motor usa su respuesta local.
  aiChat: (body) => request("POST", "/api/ai/chat", body, { timeout: AI_TIMEOUT_MS }),
  aiSimulate: (body) => request("POST", "/api/ai/simulate", body, { timeout: AI_TIMEOUT_MS }),
  aiDossier: (body) => request("POST", "/api/ai/dossier", body, { timeout: AI_TIMEOUT_MS }),

  // Dossiers
  listDossiers: () => request("GET", "/api/me/dossiers"),
  getDossier: (eventId) => request("GET", `/api/me/dossiers/${enc(eventId)}`),
  saveDossier: (eventId, body) => request("POST", `/api/me/dossiers/${enc(eventId)}`, body),

  // Cafés 1:1 (solo con conexiones aceptadas: 403 not_connected; 409 coffee_active si ya hay uno activo)
  listCoffees: (status) => request("GET", `/api/me/coffees${status ? `?status=${enc(status)}` : ""}`),
  proposeCoffeeApi: (body) => request("POST", "/api/me/coffees", body),
  // status: accepted | declined | done | cancelled. Aceptar suma +50 XP una sola vez (ref coffee:<id>)
  updateCoffee: (id, status) => request("PATCH", `/api/me/coffees/${enc(id)}`, { status }),

  // Mensajes directos sobre una conexión aceptada. Página del más antiguo al más reciente; nextCursor = before
  listMessages: (connId, { before, limit } = {}) => {
    const q = new URLSearchParams(Object.entries({ before, limit }).filter(([, v]) => v != null)).toString();
    return request("GET", `/api/me/messages/${enc(connId)}${q ? `?${q}` : ""}`);
  },
  sendMessage: (connId, body) => request("POST", `/api/me/messages/${enc(connId)}`, { body }),

  // QR dinámico: token firmado de corta vida (pedir otro cada refreshIn s) y escaneo del de otro asistente.
  // scan: 400 invalid_qr / qr_expired / own_qr, 409 qr_used, 403 peer_network_off, 429 rate_limited
  qrToken: () => request("GET", "/api/me/qr-token"),
  scanQr: (token, context) => request("POST", "/api/me/connections/scan", { token, ...(context ? { context } : {}) }),

  // Panel de creador de eventos (solo accountRole organizer/admin; si no, 403 forbidden_role). Un organizador
  // solo edita sus eventos (403 not_owner). Los eventos nacen como borrador y salen en /api/events al publicarlos.
  admin: {
    // all: solo admin → eventos de todos los organizadores y los del catálogo (catalog: true, solo lectura)
    listEvents: ({ all = false } = {}) => request("GET", `/api/admin/events${all ? "?all=1" : ""}`),
    createEvent: (body) => request("POST", "/api/admin/events", body),
    getEvent: (id) => request("GET", `/api/admin/events/${enc(id)}`),
    updateEvent: (id, patch) => request("PATCH", `/api/admin/events/${enc(id)}`, patch),
    deleteEvent: (id) => request("DELETE", `/api/admin/events/${enc(id)}`),
    setDays: (id, days) => request("PUT", `/api/admin/events/${enc(id)}/days`, { days }),
    setInfo: (id, info) => request("PUT", `/api/admin/events/${enc(id)}/info`, { info }),
    setVenue: (id, venue) => request("PUT", `/api/admin/events/${enc(id)}/venue`, { venue }),
    // 400 incomplete_event con `missing` (lo que falta para publicar)
    publish: (id) => request("POST", `/api/admin/events/${enc(id)}/publish`),
    unpublish: (id) => request("POST", `/api/admin/events/${enc(id)}/unpublish`),
    addSpeaker: (id, body) => request("POST", `/api/admin/events/${enc(id)}/speakers`, body),
    updateSpeaker: (id, sid, patch) => request("PATCH", `/api/admin/events/${enc(id)}/speakers/${enc(sid)}`, patch),
    deleteSpeaker: (id, sid) => request("DELETE", `/api/admin/events/${enc(id)}/speakers/${enc(sid)}`),
    addSession: (id, body) => request("POST", `/api/admin/events/${enc(id)}/sessions`, body),
    updateSession: (id, sid, patch) => request("PATCH", `/api/admin/events/${enc(id)}/sessions/${enc(sid)}`, patch),
    deleteSession: (id, sid) => request("DELETE", `/api/admin/events/${enc(id)}/sessions/${enc(sid)}`),
    addMission: (id, body) => request("POST", `/api/admin/events/${enc(id)}/missions`, body),
    updateMission: (id, code, patch) => request("PATCH", `/api/admin/events/${enc(id)}/missions/${enc(code)}`, patch),
    deleteMission: (id, code) => request("DELETE", `/api/admin/events/${enc(id)}/missions/${enc(code)}`),
  },
};

/**
 * URL de GET /api/me/stream (Server-Sent Events). EventSource no admite headers propios: el access token
 * va en ?access_token= y, solo en desarrollo sin sesión, el UUID en ?userId=. null = sin API.
 */
export function streamUrl() {
  if (!apiEnabled) return null;
  const q = new URLSearchParams();
  if (session) q.set("access_token", session.accessToken);
  else if (DEV) { const uid = getUserId(); if (uid) q.set("userId", uid); }
  else return null;
  const s = q.toString();
  return `${API_URL}/api/me/stream${s ? `?${s}` : ""}`;
}

/** Fecha de caducidad (ms) del token QR knet1.<payload>.<firma>, o null si no se puede leer */
export function qrTokenExpiry(token) {
  try {
    const [pre, payload] = String(token).split(".");
    if (pre !== "knet1" || !payload) return null;
    const p = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Number.isInteger(p.x) ? p.x * 1000 : null;
  } catch { return null; }
}
