/**
 * Cliente HTTP de la API de KNET (backend/).
 *
 * - URL base: VITE_API_URL (por defecto http://localhost:4000). Si se define vacía, la API
 *   queda desactivada y el frontend funciona solo con datos locales (útil en un deploy estático).
 * - Usuario: header X-User-Id tomado de localStorage ("knet-api-user") o de VITE_DEMO_USER_ID.
 *   Sin ninguno de los dos no se envía el header y el backend usa su usuario demo.
 * - Errores: ApiOffline si la API no responde (red, timeout, BD caída) para que el motor haga
 *   fallback a lo local; ApiError(status, body) si el servidor respondió con un error HTTP.
 */

const RAW_URL = import.meta.env.VITE_API_URL;
export const API_URL = (RAW_URL === undefined ? "http://localhost:4000" : String(RAW_URL)).trim().replace(/\/+$/, "");
export const apiEnabled = API_URL !== "";

const USER_KEY = "knet-api-user";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMEOUT_MS = 4000;

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

export function getUserId() {
  let id = null;
  try { id = localStorage.getItem(USER_KEY); } catch { /* almacenamiento bloqueado */ }
  id = id || import.meta.env.VITE_DEMO_USER_ID || null;
  return id && UUID.test(id) ? id : null;
}

export function setUserId(id) {
  try {
    if (id && UUID.test(id)) localStorage.setItem(USER_KEY, id);
    else localStorage.removeItem(USER_KEY);
  } catch { /* almacenamiento bloqueado */ }
}

async function request(method, path, body) {
  if (!apiEnabled) throw new ApiOffline("API desactivada (VITE_API_URL vacía)");
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const uid = getUserId();
  if (uid) headers["X-User-Id"] = uid;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
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
  // 503 = la API está arriba pero sin base de datos: para el frontend es lo mismo que estar apagada
  if (res.status === 503) throw new ApiOffline((data && data.message) || "API no disponible");
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const enc = encodeURIComponent;

export const api = {
  health: () => request("GET", "/health"),

  // Perfil
  getMe: () => request("GET", "/api/me"),
  updateMe: (patch) => request("PATCH", "/api/me", patch),

  // Consentimientos (cadena SHA-256 de solo inserción en PostgreSQL)
  listConsents: () => request("GET", "/api/me/consents"),
  addConsent: (body) => request("POST", "/api/me/consents", body),

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
