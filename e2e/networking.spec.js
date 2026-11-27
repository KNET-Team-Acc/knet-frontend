import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, goOnline, peerConnection, catalogConnection, fakeEventSource } from "./support/mock-api.js";
import { goTab } from "./support/ui.js";

/** Espera a que termine el sync (GET /api/me/connections es una de sus lecturas) */
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(n);
const PEER = "Diego R.";
const seedPeer = { extra: { connections: [PEER], xpSynced: [`conn:${PEER}`] } };

async function openPeerChat(page) {
  await goTab(page, "red");
  await page.locator(`#connsCard [data-cmsg="${PEER}"]`).click();
  await expect(page.locator("#m-dm")).toBeVisible();
}

test("usuario real: café y DM llegan al servidor, sin respuestas simuladas y sin duplicar la XP del café", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  await seedSession(page, seedPeer);
  await page.goto("/#red");
  await waitSync(api);
  // waitSync solo espera la petición: el motor aplica la respuesta un instante después
  await expect.poll(async () => (await engineState(page)).qrConn.find((q) => q.name === PEER)?.userId).toBeTruthy();

  await openPeerChat(page);
  await page.locator('#m-dm [data-dmcof="propose"]').click();
  await expect.poll(async () => (await engineState(page)).coffees[PEER]?.sid).toBe(1);
  expect(api.coffees[0]).toMatchObject({ connectionId: 7, status: "proposed" });
  await expect(page.locator("#m-dm")).toContainText("esperando respuesta");

  await page.fill("#dmIn", "Hola Diego, ¿café a las 3?");
  await page.press("#dmIn", "Enter");
  await expect.poll(() => api.messages.length).toBe(1);
  expect(api.messages[0]).toMatchObject({ connectionId: 7, body: "Hola Diego, ¿café a las 3?" });
  await page.waitForTimeout(2500); // con un usuario real no hay respuesta simulada
  let A = await engineState(page);
  expect(A.dms[PEER].map((m) => m.who)).toEqual(["me"]);
  expect(A.dms[PEER][0].sid).toBe(1);

  // La otra persona acepta el café (el servidor suma +50 XP una vez) y responde desde su app
  api.coffees[0].status = "accepted"; api.user.xp += 50;
  api.messages.push({ id: 2, connectionId: 7, fromMe: false, body: "¡Claro! Nos vemos en el Lounge B.", createdAt: new Date().toISOString() });
  const before = A;
  await goOnline(page, api);
  await expect.poll(async () => (await engineState(page)).coffees[PEER].status).toBe("accepted");
  await expect(page.locator("#dmLog")).toContainText("Nos vemos en el Lounge B");
  A = await engineState(page);
  expect(A.xpSynced).toContain("coffee:1");
  expect(A.xpLocal).toBe(before.xpLocal);       // la XP del café la puso el servidor, no la local
  expect(A.xp).toBe(api.user.xp + A.xpLocal);

  // Otro sync no cambia nada
  await goOnline(page, api);
  await waitSync(api, 3);
  expect((await engineState(page)).xp).toBe(A.xp);
});

test("offline: el café y el DM se encolan (coffee, dm) y se envían en orden al volver la red", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  await seedSession(page, seedPeer);
  await page.goto("/#red");
  await waitSync(api);
  await openPeerChat(page);

  api.offline = true;
  await page.locator('#m-dm [data-dmcof="propose"]').click();
  await page.fill("#dmIn", "Te escribo sin señal");
  await page.press("#dmIn", "Enter");
  await expect.poll(async () => (await engineState(page)).outbox.map((o) => o.t)).toEqual(["coffee", "dm"]);

  const start = api.log.length;
  await goOnline(page, api);
  await expect.poll(async () => (await engineState(page)).outbox.length).toBe(0);
  const sent = api.log.slice(start).filter((r) => r.method === "POST").map((r) => r.path);
  expect(sent).toEqual(["/api/me/coffees", "/api/me/messages/7"]);
  expect(api.messages[0].body).toBe("Te escribo sin señal");
});

test("contacto del catálogo: la respuesta simulada del café se registra en el servidor y su XP no cuenta dos veces", async ({ page }) => {
  const laura = { ...peerConnection(3, "Laura M."), source: "request" };
  laura.contact = { ...laura.contact, id: 1, userId: null };
  const api = await installMockApi(page, { connections: [laura] });
  await seedSession(page, { extra: { connections: ["Laura M."], xpSynced: ["conn:Laura M."] } });
  await page.goto("/#red");
  await waitSync(api);
  await page.locator('#connsCard [data-cprof="Laura M."]').click();
  await page.locator('#m-person [data-pact="coffee"]').click();

  await expect.poll(() => api.coffees[0]?.status, { timeout: 20_000 }).toBe("accepted");
  await expect.poll(async () => (await engineState(page)).xpSynced).toContain("coffee:1");
  const A = await engineState(page);
  expect(api.coffeeXp).toBe(1);
  expect(A.xpLocal).toBe(100);                 // los +50 locales pasaron al servidor
  expect(A.xp).toBe(api.user.xp + A.xpLocal);  // 50 + 100
});

test("QR dinámico: con cuenta muestra el token del servidor y el escáner real; sin el endpoint vuelve a la demo", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);
  await expect(page.locator("#myQr svg path")).toHaveCount(1); // QR real (un solo path con los módulos), no el decorativo
  expect(api.qrTokens).toBeGreaterThanOrEqual(1);
  await expect(page.locator("#qrCard")).toContainText("Sirve una sola vez");
  await expect(page.locator('#qrCard [data-act="qrcam"]')).toBeVisible();
  await expect(page.locator('[data-act="qrscan"]')).toHaveCount(0); // ni en la credencial ni en la cabecera de Mi red

  api.qrMissing = true;
  await page.evaluate(() => { location.hash = "#perfil"; });
  await page.reload();
  await waitSync(api, 2);
  await goTab(page, "red");
  await expect(page.locator('#qrCard [data-act="qrscan"]')).toBeVisible();
  await expect(page.locator('#qrCard [data-act="qrcam"]')).toHaveCount(0);
});

/** Cámara y BarcodeDetector falsos: el detector devuelve window.__qrValue */
async function fakeCamera(page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement("canvas"); c.width = c.height = 64; c.getContext("2d").fillRect(0, 0, 64, 64); return c.captureStream(5); };
    window.BarcodeDetector = class { static async getSupportedFormats() { return ["qr_code"]; } async detect() { return window.__qrValue ? [{ rawValue: window.__qrValue }] : []; } };
  });
}

test("escáner: un QR válido crea la conexión real con la XP del servidor; el propio muestra el error y no conecta", async ({ page }) => {
  const api = await installMockApi(page);
  await fakeCamera(page);
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);

  await page.evaluate(() => { window.__qrValue = "knet1.own"; });
  await page.locator('#qrCard [data-act="qrcam"]').click();
  await expect(page.locator("#m-qrscan")).toContainText("Es tu propio código");
  expect((await engineState(page)).connections).toEqual([]);

  await page.evaluate(() => { window.__qrValue = "https://example.com"; });
  await page.locator('#m-qrscan [data-qs="cam"]').click();
  await expect(page.locator("#qsMsg")).toContainText("no es de KNET");

  await page.evaluate(() => { window.__qrValue = "knet1.Valentina Q.firma"; });
  await expect(page.locator("#m-qrscan")).toContainText("¡Conexión lista con Valentina!");
  const A = await engineState(page);
  expect(A.connections).toContain("Valentina Q");
  expect(A.qrConn.find((q) => q.name === "Valentina Q").userId).toBeTruthy();
  expect(A.xpSynced).toContain("conn:Valentina Q");
  expect(A.xp).toBe(api.user.xp + A.xpLocal); // +100 del servidor, nada local
});

test("check-in NFC: la opción solo aparece con Web NFC y registra el check-in con method nfc", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#agenda");
  await waitSync(api);
  await expect(page.locator('[data-act="attend"]').first()).toBeVisible();
  await expect(page.locator('[data-act="nfcattend"]')).toHaveCount(0); // Chromium de escritorio no tiene NDEFReader

  await page.addInitScript(() => {
    window.NDEFReader = class {
      async scan() {
        setTimeout(() => { const data = new TextEncoder().encode("knet:checkin:" + window.__nfcTag); this.onreading && this.onreading({ message: { records: [{ recordType: "text", encoding: "utf-8", data }] } }); }, 300);
      }
    };
  });
  await page.reload();
  await waitSync(api, 2);
  const btn = page.locator('[data-act="nfcattend"]').first();
  const code = await btn.getAttribute("data-v");
  await page.evaluate((c) => { window.__nfcTag = c; }, code);
  await btn.click();
  await expect.poll(() => api.checkins.has(code)).toBe(true);
  expect(api.lastCheckinMethod).toBe("nfc");
  expect((await engineState(page)).attended).toContain(code);
});

/* ---- Solicitudes recibidas (issue #19 · 4a) ---- */
const MATCH = "Laura M.";
/** Contacto del catálogo tal como lo devuelve GET /api/contacts */
const contact = (name = MATCH, id = 1) => ({ id, userId: null, name, initials: name.slice(0, 2).toUpperCase(), headline: "CTO · Fintech", industry: "tech", affinity: 88,
  matchReason: "Comparte Datos contigo", interests: ["Datos"], likes: [], goal: "Escalar IA" });
const seedInbound = () => ({ extra: { inbound: { [MATCH]: { at: Date.now(), from: "match" } } } });
/** Escrituras a /api/me/connections (sin las lecturas del sync), como «MÉTODO ruta» */
const connWrites = (api, from = 0) => api.log.slice(from).filter((r) => r.path.startsWith("/api/me/connections") && r.method !== "GET").map((r) => `${r.method} ${r.path}`);
const connGets = (api) => api.log.filter((r) => r.path === "/api/me/connections" && r.method === "GET").length;

test("solicitud recibida: aceptar en Mi red crea la conexión y suma +100 XP una sola vez", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()] });
  await seedSession(page, seedInbound());
  await page.goto("/#red");
  await waitSync(api);
  const sec = page.locator("#connsCard #inboundSec");
  await expect(sec).toContainText("Solicitudes recibidas (1)");
  await expect(sec).toContainText(MATCH);
  const before = await engineState(page);

  await sec.locator(`[data-inacc="${MATCH}"]`).click();
  await expect.poll(() => api.connXp).toBe(1);
  expect(connWrites(api)).toEqual(["POST /api/me/connections", "PATCH /api/me/connections/201"]);
  await expect.poll(async () => (await engineState(page)).xpSynced).toContain(`conn:${MATCH}`);
  const A = await engineState(page);
  expect(A.connections).toContain(MATCH);
  expect(A.inbound[MATCH]).toBeUndefined();
  expect(A.xpLocal).toBe(before.xpLocal);       // los +100 locales pasaron al servidor
  expect(A.xp).toBe(api.user.xp + A.xpLocal);
  await expect(page.locator("#inboundSec")).toHaveCount(0);
  await expect(page.locator(`#connsCard [data-cmsg="${MATCH}"]`)).toBeVisible();

  // Otro sync no vuelve a sumar
  const gets = connGets(api);
  await goOnline(page, api);
  await expect.poll(() => connGets(api)).toBeGreaterThan(gets);
  expect((await engineState(page)).xp).toBe(A.xp);
  expect(api.connXp).toBe(1);
});

test("solicitud recibida sin conexión: aceptar se encola (conn accepted) y se envía una vez al volver la red", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()] });
  await seedSession(page, seedInbound());
  await page.goto("/#red");
  await waitSync(api);

  api.offline = true;
  await page.locator(`#inboundSec [data-inacc="${MATCH}"]`).click();
  await expect.poll(async () => (await engineState(page)).outbox.map((o) => [o.t, o.id, o.state])).toEqual([["conn", MATCH, "accepted"]]);
  expect((await engineState(page)).connections).toContain(MATCH);

  const start = api.log.length;
  await goOnline(page, api);
  await expect.poll(async () => (await engineState(page)).outbox.length).toBe(0);
  expect(connWrites(api, start)).toEqual(["POST /api/me/connections", "PATCH /api/me/connections/201"]);
  expect(api.connXp).toBe(1);
  const A = await engineState(page);
  expect(A.xpSynced).toContain(`conn:${MATCH}`);
  expect(A.xp).toBe(api.user.xp + A.xpLocal);
});

test("solicitud recibida: se rechaza desde el perfil, no llega al servidor y no vuelve a aparecer", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()] });
  await seedSession(page, seedInbound());
  await page.goto("/#red");
  await waitSync(api);

  await page.locator(`#inboundSec [data-cprof="${MATCH}"]`).click();
  await expect(page.locator("#personStatus")).toContainText("Te envió una solicitud");
  await expect(page.locator('#m-person [data-pact="accept"]')).toBeVisible();
  await page.locator('#m-person [data-pact="decline"]').click();
  await expect(page.locator('#m-person [data-pact="connect"]')).toBeVisible();
  const A = await engineState(page);
  expect(A.inbound[MATCH]).toBeUndefined();
  expect(A.inboundGone).toContain(MATCH);
  expect(connWrites(api)).toEqual([]);

  await page.keyboard.press("Escape");
  await page.reload();
  await waitSync(api, 2);
  await goTab(page, "red");
  await expect(page.locator("#connsCard")).toBeVisible();
  await expect(page.locator("#inboundSec")).toHaveCount(0);
});

test("solicitud recibida automática: un match afín te escribe una vez y llega a las notificaciones", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()] });
  await seedSession(page, { extra: { inboundSeeded: null } });
  await page.goto("/#red");
  await waitSync(api);
  await expect(page.locator("#inboundSec")).toContainText(MATCH, { timeout: 15_000 });
  const A = await engineState(page);
  expect(A.inboundSeeded).toBe("tech");
  expect(A.notifs[0]).toMatchObject({ type: "conn", n: MATCH });
  expect(A.notifs[0].title).toContain("quiere conectar contigo");
});

test("SSE: una solicitud entrante (connection.request) aparece en vivo y aceptarla solo hace PATCH", async ({ page }) => {
  const req = catalogConnection(9, "Andrés V.", "pending", { direction: "incoming" });
  req.contact.userId = "99999999-0000-4000-8000-000000000009";
  const api = await installMockApi(page);
  await fakeEventSource(page);
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);
  await expect.poll(() => page.evaluate(() => !!window.__es)).toBe(true);

  api.connections.push(req); // el servidor ya la tiene
  await page.evaluate((c) => window.__es.emit("connection.request", { connection: c, at: new Date().toISOString() }), req);
  const sec = page.locator("#connsCard #inboundSec");
  await expect(sec).toContainText("Andrés V.");
  await expect(sec).toContainText("desde KNET");
  expect((await engineState(page)).notifs[0].title).toBe("Andrés V. quiere conectar contigo");

  const start = api.log.length;
  await sec.locator('[data-inacc="Andrés V."]').click();
  await expect.poll(() => api.connXp).toBe(1);
  expect(connWrites(api, start)).toEqual(["PATCH /api/me/connections/9"]);
  await expect.poll(async () => (await engineState(page)).xpSynced).toContain("conn:Andrés V.");
  const A = await engineState(page);
  expect(A.connections).toContain("Andrés V.");
  expect(A.xp).toBe(api.user.xp + A.xpLocal);
});

test("SSE: una solicitud propia (sin direction) no entra en «Solicitudes recibidas»", async ({ page }) => {
  const api = await installMockApi(page);
  await fakeEventSource(page);
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);
  await expect.poll(() => page.evaluate(() => !!window.__es)).toBe(true);
  const gets = connGets(api);
  await page.evaluate((c) => window.__es.emit("connection.request", { connection: c }), catalogConnection(10, "Laura M.", "pending"));
  await expect.poll(() => connGets(api)).toBeGreaterThan(gets); // solo sincroniza
  await expect(page.locator("#inboundSec")).toHaveCount(0);
});

/* ---- Perfil desde el chat (4b) ---- */
test("chat: el nombre del encabezado abre el perfil con clic y con Enter", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()], connections: [catalogConnection(3, MATCH, "accepted")] });
  await seedSession(page, { extra: { connections: [MATCH], xpSynced: [`conn:${MATCH}`] } });
  await page.goto("/#red");
  await waitSync(api);

  const openChat = async () => { await page.locator(`#connsCard [data-cmsg="${MATCH}"]`).click(); await expect(page.locator("#m-dm")).toBeVisible(); };
  await openChat();
  const who = page.locator("#m-dm .dm-who");
  await expect(who).toHaveText(MATCH);
  await expect(who).toHaveAttribute("aria-label", `Ver el perfil de ${MATCH}`);
  await who.click();
  await expect(page.locator("#m-person")).toBeVisible();
  await expect(page.locator("#m-dm")).toBeHidden();
  await expect(page.locator("#personName")).toHaveText(MATCH);

  await page.keyboard.press("Escape");
  await expect(page.locator("#m-person")).toBeHidden();
  await openChat();
  await who.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#m-person")).toBeVisible();
});

/* ---- Encuesta desde la notificación (4c) ---- */
test("notificación de encuesta: abre la encuesta de esa sesión y queda resuelta al enviarla", async ({ page }) => {
  const AT = 1767225600000, hid = `ev:and@${AT}`;
  const api = await installMockApi(page);
  await seedSession(page, { extra: { ended: { "ev:and": AT },
    notifs: [{ id: "n1", type: "survey", title: "¿Qué tal estuvo el evento?", sub: "Responde la encuesta de satisfacción · +30 XP", at: Date.now(), read: false, hid }] } });
  await page.goto("/#perfil");
  await waitSync(api);

  await page.locator("#notifBtn").click();
  const item = page.locator(`#notifPanel [data-nsurvey="${hid}"]`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator("#m-survey")).toBeVisible();
  await expect(page.locator("#svTitle")).toHaveText("¿Qué tal estuvo?");
  await page.locator('#svBody [data-svstar="rating"][data-v="5"]').click();
  await page.locator("#svBody [data-svsend]").click();
  await expect(page.locator("#svBody")).toContainText("¡Gracias por tu opinión!");
  const A = await engineState(page);
  expect(A.surveys[hid].rating).toBe(5);
  expect(A.notifs.find((n) => n.hid === hid)).toMatchObject({ done: true, read: true });

  await page.keyboard.press("Escape");
  await page.locator("#notifBtn").click();
  await expect(page.locator("#notifPanel .notif-item.done")).toContainText("Encuesta respondida");
  await expect(page.locator("#notifPanel [data-nsurvey]")).toHaveCount(0);
});

/* ---- Intereses: buscador, categorías y propios (4d) ---- */
test("intereses: el buscador filtra, se agrega uno propio y se respeta el límite de 5", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#perfil");
  await waitSync(api);

  await page.locator('[data-act="pfedit"][data-v="interests"]').click();
  const q = page.locator("#pfeInts-q");
  await expect(q).toBeFocused();
  await q.fill("kube");
  await expect(page.locator('#pfeInts [data-eint="Kubernetes"]')).toBeVisible();
  await expect(page.locator('#pfeInts [data-eint="Cloud"]')).toBeHidden();
  await expect(page.locator('#pfeInts [data-eint="Datos"]')).toBeVisible(); // los elegidos siguen a la vista

  await page.locator('.int-cat[data-icat="sec"]').click();
  await q.fill("");
  await expect(page.locator('#pfeInts [data-eint="Zero Trust"]')).toBeVisible();
  await expect(page.locator('#pfeInts [data-eint="Kubernetes"]')).toBeHidden();
  await page.locator('.int-cat[data-icat="all"]').click();

  await q.fill("Rust embebido");
  const add = page.locator(".int-picker [data-iadd]");
  await expect(add).toHaveText("+ Agregar «Rust embebido»");
  await add.click();
  await expect(page.locator('#pfeInts [data-eint="Rust embebido"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".int-count")).toHaveText("2/5 elegidos");
  await expect(q).toHaveValue("");

  // Uno que ya está en el catálogo no se duplica: se selecciona
  await q.fill("devops");
  await q.press("Enter");
  await expect(page.locator('#pfeInts [data-eint="DevOps"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('#pfeInts [data-ik="devops"]')).toHaveCount(1);

  for (const x of ["Cloud", "MCP"]) await page.locator(`#pfeInts [data-eint="${x}"]`).click();
  await q.fill("Computación cuántica");
  await q.press("Enter");
  await expect(page.locator("#pfeErr")).toContainText("hasta 5 intereses");
  await expect(page.locator('#pfeInts [data-eint="Computación cuántica"]')).toHaveCount(0);

  await page.locator('[data-act="pfsave"][data-v="interests"]').click();
  await expect.poll(async () => (await engineState(page)).profile.interests.slice().sort()).toEqual(["Cloud", "Datos", "DevOps", "MCP", "Rust embebido"]);
  await expect.poll(() => (api.profilePatches.at(-1) || {}).interests || []).toContain("Rust embebido");
});

test("inglés: solicitudes recibidas y categorías de intereses con su clave", async ({ page }) => {
  const api = await installMockApi(page, { contacts: [contact()] });
  await page.addInitScript(() => localStorage.setItem("knet-lang", "en"));
  await seedSession(page, seedInbound());
  await page.goto("/#red");
  await waitSync(api);
  await expect(page.locator("#inboundSec")).toContainText("Received requests (1)");
  await expect(page.locator(`#inboundSec [data-inacc="${MATCH}"]`)).toHaveText("Accept · +100 XP");
  await goTab(page, "perfil");
  await page.locator('[data-act="pfedit"][data-v="interests"]').click();
  await expect(page.locator('.int-cat[data-icat="ai"]')).toHaveText("AI & LLMs");
  await expect(page.locator('#pfeInts [data-eint="Agentes de IA"]')).toHaveText("AI agents");
  await expect(page.locator(".int-count")).toHaveText("1/5 selected");
});
