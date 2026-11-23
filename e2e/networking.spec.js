import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, goOnline, peerConnection } from "./support/mock-api.js";
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
  expect((await engineState(page)).qrConn.find((q) => q.name === PEER).userId).toBeTruthy();

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
