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
    xp: 0, level: 1, levelName: "Explorador", scopes: { profile: true, industry: true, interests: true, network: true }, graphRole: null, ...over,
  };
}

/** Evento del panel de creador tal como lo publica GET /api/events (hosted: creado en KNET) */
function publicEvent(e) {
  return { id: e.id, name: e.name, kind: "real", city: e.city, venueName: e.venueName, dateLabel: e.dateLabel, days: e.days, lat: e.lat, lon: e.lon, tags: e.tags,
    industries: e.industries, minLevel: 1, organizer: e.organizer, sourceUrl: e.sourceUrl, description: e.description, hosted: true };
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
    registrations: new Set(opts.registrations || ["and"]),
    connections: opts.connections || [],
    connXp: 0,               // veces que el servidor sumó los +100 XP de una conexión
    scanAccepts: !!opts.scanAccepts, // true = /scan como el backend anterior (conexión aceptada al instante)
    attendeesError: null,    // [status, error] para GET /api/me/attendees
    networkError: null,      // [status, error] para GET /api/me/network (p. ej. [403, "network_off"])
    networkCalls: 0,
    peerRequests: [],        // cuerpos de POST /api/me/connections con peerUserId
    connSeq: 0,
    profilePatches: [],      // cuerpos de PATCH /api/me
    coffees: [],
    coffeeXp: 0,             // veces que el servidor sumó los +50 XP de un café
    messages: [],
    msgSeq: 0,
    qrTokens: 0,
    qrMissing: false,        // true = backend sin /api/me/qr-token (404)
    consents: [],
    deleted: false,
    tokens: 0,
    // eventos del panel de creador: id → evento con info, venue, speakers, sessions, missions (owner: otro organizador; si no, el usuario)
    admin: new Map((opts.adminEvents || []).map((e) => [e.id, { venueName: "", dateLabel: "", lat: null, lon: null, tags: [], industries: [], description: "", sourceUrl: null,
      organizer: "", status: "draft", info: null, venue: null, days: [], speakers: [], sessions: [], missions: [], ...e }])),
    adminSeq: 0,
  };

  /* ---- /api/admin/* (forma de knet-backend/src/routes/admin/events.js) ---- */
  const ownerOf = (e) => e.owner || { id: USER_ID, name: state.user.name, email: state.user.email };
  const adminView = (e) => ({ ...publicEvent(e), status: e.status, ownerId: ownerOf(e).id, owner: ownerOf(e), catalog: false, info: e.info, venue: e.venue, speakers: e.speakers, sessions: e.sessions, missions: e.missions,
    counts: { sessions: e.sessions.length, speakers: e.speakers.length, missions: e.missions.length, registrations: 0 } });
  const invalid = (path, message) => [400, { error: "validation_error", message: "Datos inválidos", issues: [{ path, message }] }];
  // Un evento del catálogo sembrado tal como lo lista GET /api/admin/events?all=1 (solo lectura)
  const CATALOG = { id: "and", name: "Andina Link Smart Cities Expo 2027", kind: "real", city: "Cartagena", days: [], tags: ["Datos"], industries: ["tech"], status: "published",
    ownerId: null, owner: null, catalog: true, hosted: false, counts: { sessions: 0, speakers: 0, missions: 0, registrations: 0 } };
  function adminRoute(method, path, body, query) {
    const b = body || {};
    if (path === "/api/admin/events" && method === "GET") {
      const all = state.user.accountRole === "admin" && query.get("all") === "1";
      const evs = [...state.admin.values()].filter((e) => all || ownerOf(e).id === USER_ID).map(adminView);
      return [200, { events: all ? [...evs, CATALOG] : evs, role: state.user.accountRole }];
    }
    if (path === "/api/admin/events" && method === "POST") {
      if (!b.name || b.name.trim().length < 3) return invalid("name", "El nombre debe tener al menos 3 caracteres");
      const id = `o${String(++state.adminSeq).padStart(9, "0")}`;
      state.admin.set(id, { id, name: b.name, city: b.city, venueName: b.venueName || "", dateLabel: "", lat: b.lat ?? null, lon: b.lon ?? null, tags: b.tags || [], industries: b.industries || [],
        description: b.description || "", sourceUrl: b.sourceUrl || null, organizer: "Acme", status: "draft", info: null, venue: null, days: [], speakers: [], sessions: [], missions: [] });
      return [201, { event: adminView(state.admin.get(id)) }];
    }
    const m = /^\/api\/admin\/events\/([a-z0-9]+)(?:\/([a-z]+))?(?:\/([a-z0-9-]+))?$/.exec(path);
    const e = m && state.admin.get(m[1]);
    if (!e) return [404, { error: "not_found", message: "No existe el evento" }];
    if (ownerOf(e).id !== USER_ID && state.user.accountRole !== "admin") return [403, { error: "not_owner", message: "Solo puedes editar los eventos que creaste" }];
    const [, , sub, child] = m;
    if (!sub) {
      if (method === "GET") return [200, { event: adminView(e) }];
      if (method === "PATCH") { Object.assign(e, b); return [200, { event: adminView(e) }]; }
      if (method === "DELETE") { state.admin.delete(e.id); return [204]; }
    }
    if (sub === "days") { e.days = b.days; e.sessions = e.sessions.filter((s) => s.day < b.days.length); return [200, { event: adminView(e) }]; }
    if (sub === "info") { e.info = b.info; return [200, { event: adminView(e) }]; }
    if (sub === "venue") { e.venue = b.venue; return [200, { event: adminView(e) }]; }
    if (sub === "publish") {
      const missing = [!e.days.length && "al menos un día", !e.sessions.length && "al menos una charla", !e.info && "la ficha del evento", !e.description && "una descripción"].filter(Boolean);
      if (missing.length) return [400, { error: "incomplete_event", message: `Para publicar falta: ${missing.join(", ")}`, missing }];
      e.status = "published"; return [200, { event: adminView(e) }];
    }
    if (sub === "unpublish") { e.status = "draft"; return [200, { event: adminView(e) }]; }
    if (sub === "speakers" && method === "POST") { e.speakers.push({ id: ++state.adminSeq, tags: [], session: "", ...b }); return [201, { speaker: e.speakers.at(-1) }]; }
    if (sub === "sessions" && method === "POST") {
      if (b.day >= e.days.length) return [400, { error: "bad_request", message: `El evento no tiene el día ${b.day + 1}` }];
      const slot = e.sessions.filter((s) => s.day === b.day).reduce((n, s) => Math.max(n, s.slot + 1), 0);
      const s = { id: ++state.adminSeq, code: `${e.id}:${b.day}:${slot}`, eventId: e.id, slot, why: null, industry: null, ...b };
      e.sessions.push(s); return [201, { session: s }];
    }
    if (sub === "missions" && method === "POST") {
      const icons = { presencial: "pin", networking: "handshake", contenido: "file", quiz: "quiz" };
      const mi = { code: `${e.id}-m${++state.adminSeq}`, kind: "event", industry: null, eventId: e.id, icon: icons[b.type], title: b.title, subtitle: b.condition || "", xp: b.xp, tags: [b.type], completed: false };
      e.missions.push(mi); return [201, { mission: mi }];
    }
    if (method === "DELETE" && child) {
      const key = sub === "missions" ? "code" : "id", list = e[sub];
      const i = list ? list.findIndex((x) => String(x[key]) === child) : -1;
      if (i < 0) return [404, { error: "not_found", message: "No existe" }];
      list.splice(i, 1); return [204];
    }
    return [404, { error: "not_found", message: `Mock sin ${method} ${path}` }];
  }
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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

    // Catálogo: opts.events = lista de GET /api/events; opts.eventDetails[id] = detalle de GET /api/events/:id.
    // Los eventos publicados desde el panel de creador (state.admin) se suman como hosted.
    if (path === "/api/events") return json(200, { events: [...(opts.events || []), ...[...state.admin.values()].filter((e) => e.status === "published").map(publicEvent)] });
    const evDetail = /^\/api\/events\/([a-z0-9]+)$/.exec(path);
    if (evDetail && method === "GET") {
      const a = state.admin.get(evDetail[1]);
      if (a && a.status === "published") return json(200, { event: { ...publicEvent(a), info: a.info, venue: a.venue, speakers: a.speakers, sessions: a.sessions, missions: a.missions } });
      const d = (opts.eventDetails || {})[evDetail[1]];
      return d ? json(200, { event: d }) : json(404, { error: "not_found", message: `No existe el evento ${evDetail[1]}` });
    }

    // Panel de creador de eventos (simplificado: un solo organizador; mismas formas que knet-backend)
    if (path.startsWith("/api/admin/")) {
      if (!["organizer", "admin"].includes(state.user.accountRole)) return json(403, { error: "forbidden_role", message: "Tu cuenta no tiene permisos de organizador de eventos" });
      const r = adminRoute(method, path, body, url.searchParams);
      return json(r[0], r[1]);
    }
    if (state.deleted && path.startsWith("/api/me")) return json(401, { error: "invalid_token", message: "La cuenta ya no existe" });

    // Perfil
    if (path === "/api/me" && method === "GET") return json(200, me());
    if (path === "/api/me" && method === "PATCH") {
      state.profilePatches.push(body);
      for (const k of ["name", "role", "company", "industry", "seniority", "location", "interests", "graphRole"]) if (body[k] !== undefined) state.user[k] = body[k];
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
    // Contactos del catálogo (matches): solo si la prueba los da; si no, 404 como un backend sin contactos
    if (path === "/api/contacts" && opts.contacts) return json(200, { contacts: opts.contacts });
    if (path === "/api/me/connections" && method === "GET") return json(200, { connections: state.connections });
    // Solicitud a un contacto del catálogo (queda pendiente; source qr = aceptada con +100 XP)
    if (path === "/api/me/connections" && method === "POST" && body.peerUserId) {
      // Solicitud a otro usuario real (knet-backend#24): pendiente, sin XP; si la otra persona ya te lo pidió, se aceptan
      const a = (opts.attendees || []).find((x) => x.userId === body.peerUserId);
      if (!a) return json(404, { error: "not_found", message: "No existe el usuario" });
      const cur = state.connections.find((c) => c.contact.userId === body.peerUserId);
      if (cur && cur.status === "accepted") return json(409, { error: "already_connected" });
      if (cur && cur.direction === "outgoing") return json(409, { error: "request_pending" });
      if (cur && cur.direction === "incoming") { cur.status = "accepted"; delete cur.direction; state.user.xp += 100; state.connXp++; return json(200, { connection: cur, xpAwarded: 100, xp: state.user.xp }); }
      const connection = peerConnection(300 + ++state.connSeq, a.name, a.userId, { status: "pending", direction: "outgoing", source: "request", headline: a.headline });
      state.connections.push(connection); state.peerRequests.push(body);
      return json(201, { connection, xpAwarded: 0, xp: state.user.xp });
    }
    if (path === "/api/me/connections" && method === "POST") {
      // Contacto del catálogo por contactId (como knet-backend) o por nombre (clave de respaldo c:<nombre>)
      const ct = body.contactId ? (opts.contacts || []).find((c) => c.id === body.contactId) : (opts.contacts || []).find((c) => c.name === body.name);
      if (body.contactId && !ct) return json(404, { error: "not_found", message: `No existe el contacto ${body.contactId}` });
      const name = ct ? ct.name : body.name;
      if (state.connections.some((c) => !c.contact.userId && (c.contact.name === name || (ct && c.contact.id === ct.id)))) return json(409, { error: "conflict", message: `Ya tienes una conexión con ${name}` });
      const accepted = body.source === "qr";
      const connection = catalogConnection(200 + ++state.connSeq, name, accepted ? "accepted" : "pending", ct ? { contactId: ct.id } : {});
      state.connections.push(connection);
      if (accepted) { state.user.xp += 100; state.connXp++; }
      return json(201, { connection, xpAwarded: accepted ? 100 : 0, xp: state.user.xp });
    }
    // Aceptar (idempotente: solo la primera vez suma +100 XP) y quitar, como knet-backend
    if ((m = /^\/api\/me\/connections\/(\d+)$/.exec(path)) && ["PATCH", "DELETE"].includes(method)) {
      const i = state.connections.findIndex((c) => c.id === Number(m[1]));
      if (i < 0) return json(404, { error: "not_found", message: `No existe la conexión ${m[1]}` });
      if (method === "DELETE") { state.connections.splice(i, 1); return json(204); }
      const cn = state.connections[i];
      if (cn.status === "pending" && cn.direction === "outgoing") return json(403, { error: "not_recipient", message: "Solo puede aceptarla quien la recibió" });
      if (cn.status === "pending") { cn.status = "accepted"; cn.acceptedAt = new Date().toISOString(); delete cn.direction; state.user.xp += 100; state.connXp++; }
      return json(200, { connection: cn, xpAwarded: 100, xp: state.user.xp });
    }

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
      const name = body.token.split(".")[1] || "Asistente Real";
      if (state.scanAccepts) { // backend anterior a knet-backend#24: el escaneo crea la conexión aceptada con +100 XP
        const connection = peerConnection(100 + state.connections.length, name);
        state.connections.push(connection); state.user.xp += 100;
        return json(201, { connection, created: true, xpAwarded: 100, xp: state.user.xp });
      }
      const prev = state.connections.find((c) => c.contact.name === name);
      if (prev) return json(200, { connection: prev, created: false, xpAwarded: 0, xp: state.user.xp });
      const connection = peerConnection(100 + state.connections.length, name, undefined, { status: "pending", direction: "outgoing" });
      state.connections.push(connection);
      return json(201, { connection, created: true, xpAwarded: 0, xp: state.user.xp });
    }
    // Ranking del evento: opts.leaderboard = { event: [{ userId, name, xp }], connections: [...] } con los demás
    // (el usuario se añade con su XP del servidor); sin la opción, 404 como un backend sin el endpoint
    if (path === "/api/me/leaderboard" && opts.leaderboard) {
      const scope = url.searchParams.get("scope") || "event";
      const all = [...(opts.leaderboard[scope] || []), { userId: USER_ID, name: state.user.name, xp: state.user.xp, me: true }].sort((a, b) => b.xp - a.xp);
      const entries = all.map((e) => ({ pos: 1 + all.filter((o) => o.xp > e.xp).length, userId: e.userId, name: e.name, initials: "", xp: e.xp,
        level: Math.min(Math.floor(e.xp / 500) + 1, 5), me: !!e.me }));
      const me = entries.find((e) => e.me);
      return json(200, { eventId: url.searchParams.get("eventId"), scope, entries, me: { pos: me.pos, xp: me.xp, level: me.level }, total: entries.length });
    }
    // Directorio de asistentes del evento: opts.attendees (sin la opción, 404 como un backend sin el endpoint)
    if (path === "/api/me/attendees" && opts.attendees) {
      if (state.attendeesError) return json(state.attendeesError[0], { error: state.attendeesError[1], message: state.attendeesError[1] });
      const conn = (a) => { const c = state.connections.find((x) => x.contact.userId === a.userId); return c ? { id: c.id, status: c.status, direction: c.direction || null } : null; };
      return json(200, { eventId: url.searchParams.get("eventId"), attendees: opts.attendees.map((a) => ({ ...a, connection: conn(a) })), total: opts.attendees.length });
    }
    // Grafo de la red (knet-backend#30): opts.network = { nodes, edges } (sin la opción, 404 como un backend sin el endpoint)
    if (path === "/api/me/network" && opts.network) {
      state.networkCalls++;
      if (state.networkError) return json(state.networkError[0], { error: state.networkError[1], message: state.networkError[1] });
      const depth = Number(url.searchParams.get("depth") || 2);
      const nodes = opts.network.nodes.filter((n) => depth >= 2 || n.degree === 1);
      return json(200, { me: { id: USER_ID, graphRole: state.user.graphRole ?? null }, nodes, edges: opts.network.edges });
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
      // inboundSeeded: sin la solicitud automática de un match (las pruebas de «Solicitudes recibidas» la siembran)
      connected: true, ind: "tech", mv1: true, tourSeen: true, mv2: true, events: ["and"], xp, xpLocal, xpSynced: [], outbox: [], inboundSeeded: "tech",
      accountId: uid, accountEmail: "e2e@knet.test", apiLinked: true,
      profile: { name: "Paola Prueba", role: "Gerente de Producto", company: "Acme", seniority: "Gerencia", interests: ["Datos"], location: "Bogotá",
        src: { name: "manual", role: "manual", company: "manual", ind: "manual", seniority: "manual", interests: "manual", location: "manual" } },
      ...extra,
    }));
  }, { uid: USER_ID, xp, xpLocal, extra });
}

/** Conexión aceptada con otro usuario real (como la crea POST /api/me/connections/scan) */
export function peerConnection(id, name, userId = `99999999-0000-4000-8000-${String(id).padStart(12, "0")}`, { status = "accepted", direction, source = "qr", headline = "CTO · Logística" } = {}) {
  const at = new Date(Date.now() - (status === "accepted" ? 864e5 : 0)).toISOString();
  return { id, status, source, context: "", eventId: null, createdAt: at, acceptedAt: status === "accepted" ? at : null, ...(direction ? { direction } : {}),
    contact: { id: null, userId, name, initials: name.slice(0, 2).toUpperCase(), headline, industry: "tech", affinity: null, matchReason: "", interests: [], likes: [], goal: "" } };
}

/** Conexión con un contacto del catálogo (sin cuenta en KNET), pendiente o aceptada. contactId = id del contacto
 *  (el de GET /api/contacts); sin él, el de la conexión. */
export function catalogConnection(id, name, status = "pending", { contactId = id, ...extra } = {}) {
  const at = new Date().toISOString();
  return { id, status, source: "request", context: "", eventId: null, createdAt: at, acceptedAt: status === "accepted" ? at : null,
    contact: { id: contactId, userId: null, name, initials: name.slice(0, 2).toUpperCase(), headline: "", industry: "tech", affinity: null, matchReason: "", interests: [], likes: [], goal: "" }, ...extra };
}

/** Clave estable con la que el frontend guarda a una persona (knet-frontend#33): u:<userId> o c:<contactId> */
export const peerKey = (conn) => (conn.contact.userId ? `u:${conn.contact.userId}` : `c:${conn.contact.id}`);

/** EventSource falso: window.__es.emit(tipo, datos) entrega un evento como lo haría /api/me/stream */
export async function fakeEventSource(page) {
  await page.addInitScript(() => {
    class FakeES {
      constructor(url) { this.url = url; this.readyState = 1; this.ls = {}; window.__es = this; setTimeout(() => this.onopen && this.onopen(), 0); }
      addEventListener(type, fn) { (this.ls[type] ||= []).push(fn); }
      emit(type, data) { (this.ls[type] || []).forEach((fn) => fn({ data: JSON.stringify(data) })); }
      close() { this.readyState = 2; }
    }
    window.EventSource = FakeES;
  });
}

export const engineState =(page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1") || "null"));
export const goOnline = (page, state) => { state.offline = false; return page.evaluate(() => window.dispatchEvent(new Event("online"))); };
