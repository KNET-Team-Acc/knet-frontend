/**
 * API de KNET simulada con page.route para las pruebas E2E (sin backend).
 * - state.offline = true → la petición falla como sin red (el frontend lanza ApiOffline).
 * - state.log: [{ method, path, auth }] en el orden en que llegaron (para comprobar la cola outbox).
 * - state.deleteMode: "ok" | "demo" (403 demo_account) para «Revocar y borrar mis datos».
 * El build de las pruebas apunta VITE_API_URL a MOCK_API (ver playwright.config.js).
 */
export const MOCK_API = "http://api.knet.test";
export const USER_ID = "11111111-2222-4333-8444-555555555555";

const MISSION_XP = { default: 50 };

export function seedUser(over = {}) {
  return {
    id: USER_ID, email: "e2e@knet.test", name: "Paola Prueba", initials: "PP", role: "Gerente de Producto", company: "Acme",
    industry: "tech", seniority: "Gerencia", location: "Bogotá", interests: ["Datos"], avatar: null, fieldSources: {},
    linkedinConnected: false, photoUrl: null, emailVerified: false, hasPassword: true, legalVersion: "1.2", isDemo: false,
    xp: 0, level: 1, levelName: "Explorador", scopes: { profile: true, industry: true, interests: true, network: true }, ...over,
  };
}

export async function installMockApi(page, opts = {}) {
  const state = {
    offline: false,
    log: [],
    deleteMode: "ok",
    missionXp: null,          // XP que suma el servidor por misión (null = 50)
    user: seedUser(opts.user),
    missions: new Map(),     // code → xp
    checkins: new Set(),
    registrations: new Set(opts.registrations || ["bog"]),
    connections: opts.connections || [],
    coffees: [],
    coffeeXp: 0,             // veces que el servidor sumó los +50 XP de un café
    messages: [],
    msgSeq: 0,
    qrTokens: 0,
    qrMissing: false,        // true = backend sin /api/me/qr-token (404)
    consents: [],
    deleted: false,
    tokens: 0,
  };
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };
  const session = () => {
    state.tokens++;
    return { accessToken: `acc-${state.tokens}`, refreshToken: `ref-${state.tokens}-${"x".repeat(30)}`, tokenType: "Bearer", expiresIn: 900, refreshExpiresAt: new Date(Date.now() + 864e5).toISOString() };
  };

  await page.route(`${MOCK_API}/**`, async (route) => {
    const req = route.request();
    const method = req.method();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    if (state.offline) return route.abort("internetdisconnected");
    const url = new URL(req.url());
    const path = url.pathname;
    // EventSource (/api/me/stream) no admite headers: el token va en ?access_token=, como en el backend
    const auth = req.headers().authorization || (url.searchParams.get("access_token") ? `Bearer ${url.searchParams.get("access_token")}` : "");
    let body = null;
    try { body = req.postData() ? JSON.parse(req.postData()) : null; } catch { body = null; }
    state.log.push({ method, path, auth });
    const json = (status, data) => route.fulfill({ status, headers: { ...cors, "Content-Type": "application/json" }, body: data === undefined ? "" : JSON.stringify(data) });
    const me = () => ({ user: state.user, stats: {}, registrations: [...state.registrations] });

    // Autenticación
    if (path === "/api/auth/providers") return json(200, { password: true, linkedin: false, legalVersion: "1.2" });
    if (path === "/api/auth/register" && method === "POST") {
      state.user = seedUser({ email: body.email, name: body.name, role: "", seniority: "", interests: [], company: "", location: "" });
      const c = { id: state.consents.length + 1, type: "aceptacion", hash: `h${state.consents.length + 1}` };
      state.consents.push(c);
      return json(201, { user: state.user, consent: c, ...session() });
    }
    if (path === "/api/auth/login" && method === "POST") return json(200, { user: state.user, ...session() });
    if (path === "/api/auth/refresh" && method === "POST") return json(200, session());
    if (path === "/api/auth/logout") return json(204);

    if (path === "/api/events") return json(200, { events: [] });
    if (state.deleted && path.startsWith("/api/me")) return json(401, { error: "invalid_token", message: "La cuenta ya no existe" });

    // Perfil
    if (path === "/api/me" && method === "GET") return json(200, me());
    if (path === "/api/me" && method === "PATCH") {
      for (const k of ["name", "role", "company", "industry", "seniority", "location", "interests"]) if (body[k] !== undefined) state.user[k] = body[k];
      return json(200, { user: state.user });
    }
    if (path === "/api/me" && method === "DELETE") {
      if (state.deleteMode === "demo") return json(403, { error: "demo_account", message: "Las cuentas demo son compartidas" });
      state.deleted = true;
      return json(200, { deleted: { profile: 1 }, consentsRetained: state.consents.length });
    }

    // Consentimientos
    if (path === "/api/me/consents" && method === "POST") {
      const c = { id: state.consents.length + 1, type: body.type, hash: `h${state.consents.length + 1}`, payload: { documents: body.documents, details: body.details } };
      state.consents.push(c);
      return json(201, { consent: c, legalVersion: "1.2", legalRequired: "1.2" });
    }
    if (path === "/api/me/consents") return json(200, { consents: [], chain: { valid: true, brokenAt: null } });

    // Inscripciones, misiones, check-ins
    let m;
    if ((m = /^\/api\/me\/registrations\/(.+)$/.exec(path))) {
      if (method === "POST") { state.registrations.add(m[1]); return json(201, { eventId: m[1], registered: true }); }
      state.registrations.delete(m[1]); return json(204);
    }
    if (path === "/api/me/missions") return json(200, { missions: [...state.missions].map(([code, xp]) => ({ code, xp, completed: true })), xp: state.user.xp });
    if ((m = /^\/api\/me\/missions\/(.+)\/complete$/.exec(path))) {
      const code = decodeURIComponent(m[1]);
      if (state.missions.has(code)) return json(409, { error: "conflict", message: "Ya completaste la misión" });
      const xp = state.missionXp ?? MISSION_XP.default;
      state.missions.set(code, xp); state.user.xp += xp;
      return json(201, { mission: { code, completed: true }, xpAwarded: xp, xp: state.user.xp });
    }
    if (path === "/api/me/checkins" && method === "GET") return json(200, { checkins: [...state.checkins].map((c) => ({ sessionCode: c })) });
    if (path === "/api/me/checkins" && method === "POST") {
      if (state.checkins.has(body.sessionCode)) return json(409, { error: "conflict" });
      state.checkins.add(body.sessionCode); state.user.xp += 40; state.lastCheckinMethod = body.method;
      return json(201, { checkin: { sessionCode: body.sessionCode }, xpAwarded: 40, xp: state.user.xp });
    }
    if (path === "/api/me/connections" && method === "GET") return json(200, { connections: state.connections });

    // Cafés 1:1 (simplificado: sin comprobar transiciones de quien responde)
    if (path === "/api/me/coffees" && method === "GET") return json(200, { coffees: state.coffees });
    if (path === "/api/me/coffees" && method === "POST") {
      const cn = state.connections.find((c) => c.id === body.connectionId);
      if (!cn || cn.status !== "accepted") return json(403, { error: "not_connected" });
      if (state.coffees.some((c) => c.connectionId === cn.id && ["proposed", "accepted"].includes(c.status))) return json(409, { error: "coffee_active" });
      const coffee = { id: state.coffees.length + 1, connectionId: cn.id, role: "proposer", with: { name: cn.contact.name, userId: cn.contact.userId || null }, slot: body.slot, place: body.place, status: "proposed", createdAt: new Date().toISOString() };
      state.coffees.push(coffee);
      return json(201, { coffee });
    }
    if ((m = /^\/api\/me\/coffees\/(\d+)$/.exec(path)) && method === "PATCH") {
      const coffee = state.coffees.find((c) => c.id === Number(m[1]));
      if (!coffee) return json(404, { error: "not_found" });
      if (body.status === "accepted" && coffee.status !== "accepted") { state.user.xp += 50; state.coffeeXp++; }
      coffee.status = body.status;
      return json(200, { coffee, xp: state.user.xp });
    }

    // Mensajes directos
    if ((m = /^\/api\/me\/messages\/(\d+)$/.exec(path))) {
      const connId = Number(m[1]);
      if (!state.connections.some((c) => c.id === connId && c.status === "accepted")) return json(403, { error: "not_connected" });
      if (method === "POST") {
        const message = { id: ++state.msgSeq, connectionId: connId, fromMe: true, body: body.body, createdAt: new Date().toISOString() };
        state.messages.push(message);
        return json(201, { message });
      }
      return json(200, { connectionId: connId, messages: state.messages.filter((x) => x.connectionId === connId), nextCursor: null });
    }

    // QR dinámico
    if (path === "/api/me/qr-token") {
      if (state.qrMissing) return json(404, { error: "not_found" });
      state.qrTokens++;
      const payload = Buffer.from(JSON.stringify({ u: USER_ID, e: null, n: `n${state.qrTokens}`, x: Math.floor(Date.now() / 1000) + 45 })).toString("base64url");
      return json(200, { token: `knet1.${payload}.firma${state.qrTokens}`, expiresAt: new Date(Date.now() + 45000).toISOString(), ttl: 45, refreshIn: 30 });
    }
    if (path === "/api/me/connections/scan" && method === "POST") {
      const codes = { "knet1.own": [400, "own_qr"], "knet1.expired": [400, "qr_expired"], "knet1.used": [409, "qr_used"] };
      if (codes[body.token]) return json(codes[body.token][0], { error: codes[body.token][1], message: codes[body.token][1] });
      const connection = peerConnection(100 + state.connections.length, body.token.split(".")[1] || "Asistente Real");
      state.connections.push(connection); state.user.xp += 100;
      return json(201, { connection, created: true, xpAwarded: 100, xp: state.user.xp });
    }
    if (path === "/api/me/stream") return json(404, { error: "not_found" });
    if (path === "/api/me/dossiers" && method === "GET") return json(200, { dossiers: [] });
    if (path.startsWith("/api/me/dossiers/") && method === "POST") return json(201, { dossier: { content: body } });
    if (path.startsWith("/api/ai/")) return json(503, { error: "ai_unavailable", message: "Sin IA en las pruebas" });

    return json(404, { error: "not_found", message: `Mock sin ${method} ${path}` });
  });
  return state;
}

/** Sesión y perfil ya creados en este navegador (evita el onboarding en las pruebas que no lo prueban) */
export async function seedSession(page, { xp = 100, xpLocal = 100, extra = {} } = {}) {
  await page.addInitScript(({ uid, xp, xpLocal, extra }) => {
    if (sessionStorage.getItem("e2e-seeded")) return; // solo en la primera carga: las recargas conservan el estado real
    sessionStorage.setItem("e2e-seeded", "1");
    localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false, fecha: new Date().toISOString(), version: "1.2" }));
    localStorage.setItem("knet-auth", JSON.stringify({ accessToken: "acc-seed", refreshToken: "ref-seed-" + "x".repeat(30), userId: uid, email: "e2e@knet.test" }));
    localStorage.setItem("knet-demo-v1", JSON.stringify({
      connected: true, ind: "tech", mv1: true, tourSeen: true, events: ["bog"], xp, xpLocal, xpSynced: [], outbox: [],
      accountId: uid, accountEmail: "e2e@knet.test", apiLinked: true,
      profile: { name: "Paola Prueba", role: "Gerente de Producto", company: "Acme", seniority: "Gerencia", interests: ["Datos"], location: "Bogotá",
        src: { name: "manual", role: "manual", company: "manual", ind: "manual", seniority: "manual", interests: "manual", location: "manual" } },
      ...extra,
    }));
  }, { uid: USER_ID, xp, xpLocal, extra });
}

/** Conexión aceptada con otro usuario real (como la crea POST /api/me/connections/scan) */
export function peerConnection(id, name, userId = `99999999-0000-4000-8000-${String(id).padStart(12, "0")}`) {
  return { id, status: "accepted", source: "qr", context: "", eventId: null, createdAt: new Date(Date.now() - 864e5).toISOString(), acceptedAt: new Date(Date.now() - 864e5).toISOString(),
    contact: { id: null, userId, name, initials: name.slice(0, 2).toUpperCase(), headline: "CTO · Logística", industry: "tech", affinity: null, matchReason: "", interests: [], likes: [], goal: "" } };
}

export const engineState =(page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1") || "null"));
export const goOnline = (page, state) => { state.offline = false; return page.evaluate(() => window.dispatchEvent(new Event("online"))); };
