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
export const API_URL = (RAW_URL === undefined ? "http://localhost:4000" : String(RAW_URL)).trim().replace(/\/+$/, "");
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

  // Dossiers
  listDossiers: () => request("GET", "/api/me/dossiers"),
  getDossier: (eventId) => request("GET", `/api/me/dossiers/${enc(eventId)}`),
  saveDossier: (eventId, body) => request("POST", `/api/me/dossiers/${enc(eventId)}`, body),
};
