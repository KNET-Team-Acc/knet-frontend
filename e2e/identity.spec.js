import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, goOnline, peerConnection, catalogConnection, peerKey } from "./support/mock-api.js";
import { goTab } from "./support/ui.js";

/* knet-frontend#33: cada persona se identifica por u:<userId> (usuario real) o c:<contactId> (catálogo), nunca por su
   nombre. Dos personas con el mismo nombre no se pisan, un cambio de nombre no rompe nada y el estado antiguo
   (guardado por nombre) se migra sin perder conexiones, hilos, cafés ni XP. */
const UID_A = "aaaaaaaa-1111-4000-8000-000000000001", UID_B = "bbbbbbbb-2222-4000-8000-000000000002", UID_S = "cccccccc-3333-4000-8000-000000000003";
const ANA = "Ana Gómez";
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections" && r.method === "GET").length).toBeGreaterThanOrEqual(n);

async function sendDm(page, key, text) {
  await page.locator(`#connsCard [data-cmsg="${key}"]`).click();
  await expect(page.locator("#m-dm")).toBeVisible();
  await page.fill("#dmIn", text);
  await page.press("#dmIn", "Enter");
}

test("dos usuarios reales con el mismo nombre: cada uno con su conexión, su chat y su XP", async ({ page }) => {
  const a = peerConnection(11, ANA, UID_A, { headline: "CTO · Fintech" });
  const b = peerConnection(12, ANA, UID_B, { headline: "Data Lead · Retail" });
  const api = await installMockApi(page, { connections: [a, b] });
  api.user.xp = 200; // los +100 de cada conexión ya los sumó el servidor
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);

  const KA = peerKey(a), KB = peerKey(b);
  await expect.poll(async () => (await engineState(page)).connections.slice().sort()).toEqual([KA, KB].sort());
  let A = await engineState(page);
  expect(A.xpSynced).toEqual(expect.arrayContaining([`conn:${KA}`, `conn:${KB}`]));
  expect(A.xpLocal).toBe(100);                  // nada de XP local que restar (las dos son del servidor)
  expect(A.xp).toBe(api.user.xp + A.xpLocal);   // 200 + 100: cada conexión cuenta una vez
  expect(A.people[KA]).toMatchObject({ name: ANA, userId: UID_A });
  expect(A.people[KB]).toMatchObject({ name: ANA, userId: UID_B });

  // Dos tarjetas con el mismo nombre, cada una con su cargo
  const cards = page.locator("#connsCard .cc");
  await expect(cards).toHaveCount(2);
  await expect(page.locator("#connsCard .cc-name span", { hasText: ANA })).toHaveCount(2);
  await expect(page.locator(`#connsCard .cc:has([data-cmsg="${KA}"]) .cc-role`)).toHaveText("CTO · Fintech");
  await expect(page.locator(`#connsCard .cc:has([data-cmsg="${KB}"]) .cc-role`)).toHaveText("Data Lead · Retail");

  // Cada chat va a su conexión y no ve los mensajes de la otra
  await sendDm(page, KA, "Hola, Ana de Fintech");
  await expect.poll(() => api.messages.length).toBe(1);
  expect(api.messages[0]).toMatchObject({ connectionId: 11, body: "Hola, Ana de Fintech" });
  await page.keyboard.press("Escape");
  await expect(page.locator("#m-dm")).toBeHidden();

  await sendDm(page, KB, "Hola, Ana de Retail");
  await expect.poll(() => api.messages.length).toBe(2);
  expect(api.messages[1]).toMatchObject({ connectionId: 12, body: "Hola, Ana de Retail" });
  await expect(page.locator("#dmLog")).not.toContainText("Ana de Fintech");
  await expect(page.locator("#m-dm .dm-head .text-mute").first()).toContainText("Data Lead · Retail");

  A = await engineState(page);
  expect(A.dms[KA].map((m) => m.text)).toEqual(["Hola, Ana de Fintech"]);
  expect(A.dms[KB].map((m) => m.text)).toEqual(["Hola, Ana de Retail"]);

  // Quitar a una no toca a la otra
  await page.keyboard.press("Escape");
  await page.locator(`#connsCard [data-crm="${KA}"]`).click();
  await page.locator(`#connsCard [data-cyes="${KA}"]`).click();
  await expect.poll(async () => (await engineState(page)).connections).toEqual([KB]);
  A = await engineState(page);
  expect(A.xpSynced).toContain(`conn:${KB}`);
  expect(A.dms[KB].length).toBe(1);
  await expect.poll(() => api.connections.map((c) => c.id)).toEqual([12]);
});

test("cambio de nombre de una conexión: misma conexión, mismo hilo y misma XP, con el nombre nuevo", async ({ page }) => {
  const c = peerConnection(11, ANA, UID_A, { headline: "CTO · Fintech" });
  const api = await installMockApi(page, { connections: [c] });
  api.user.xp = 100;
  await seedSession(page);
  await page.goto("/#red");
  await waitSync(api);
  const K = peerKey(c);
  await expect.poll(async () => (await engineState(page)).connections).toEqual([K]);
  await sendDm(page, K, "¿Café a las 3?");
  await expect.poll(() => api.messages.length).toBe(1);
  await page.keyboard.press("Escape");
  const before = await engineState(page);

  // La otra persona cambia su nombre en su perfil
  c.contact.name = "Ana G. Pérez"; c.contact.headline = "CTO · Nubia";
  api.messages.push({ id: 2, connectionId: 11, fromMe: false, body: "¡Claro!", createdAt: new Date().toISOString() });
  await goOnline(page, api);
  await expect(page.locator("#connsCard .cc-name")).toHaveText(["Ana G. Pérez"]);
  await expect(page.locator("#connsCard")).not.toContainText(ANA);
  await expect(page.locator("#connsCard .cc-role")).toHaveText("CTO · Nubia");

  const A = await engineState(page);
  expect(A.connections).toEqual([K]);                                   // sin duplicar la conexión
  expect(A.people[K]).toMatchObject({ name: "Ana G. Pérez", userId: UID_A });
  expect(A.qrConn.filter((q) => q.key === K)).toHaveLength(1);
  expect(A.qrConn.find((q) => q.key === K).name).toBe("Ana G. Pérez");
  expect(A.dms[K].map((m) => m.text)).toEqual(["¿Café a las 3?", "¡Claro!"]); // el hilo sigue entero
  expect(Object.keys(A.dms)).toEqual([K]);
  expect(A.xpSynced.filter((k) => k === `conn:${K}`)).toHaveLength(1);
  expect(A.xp).toBe(before.xp);
  expect(A.xpLocal).toBe(before.xpLocal);

  await page.locator(`#connsCard [data-cmsg="${K}"]`).click();
  await expect(page.locator("#m-dm .dm-who")).toHaveText("Ana G. Pérez");
  await expect(page.locator("#dmLog")).toContainText("¿Café a las 3?");
  await expect(page.locator("#dmLog")).toContainText("¡Claro!");
});

test("migración: un estado guardado por nombre pasa a claves sin perder conexiones, hilos, cafés, solicitudes ni XP", async ({ page }) => {
  const now = Date.now();
  const ana = peerConnection(11, ANA, UID_A, { headline: "CTO · Fintech" });
  const laura = catalogConnection(3, "Laura M.", "accepted", { contactId: 1 });
  const sara = peerConnection(21, "Sara Núñez", UID_S, { status: "pending", direction: "outgoing", source: "request", headline: "Data Lead · Rappi" });
  const api = await installMockApi(page, { connections: [ana, laura, sara] });
  api.user.xp = 200; // +100 por cada conexión aceptada, ya en el servidor
  api.messages.push({ id: 1, connectionId: 11, fromMe: true, body: "Hola de antes", createdAt: new Date(now - 6e5).toISOString() });
  api.msgSeq = 1;
  api.coffees.push({ id: 1, connectionId: 3, role: "proposer", with: { name: "Laura M.", userId: null }, slot: new Date(now + 36e5).toISOString(), place: "Lounge B", status: "accepted", createdAt: new Date(now - 6e5).toISOString() });

  // knet-demo-v1 tal como lo guardaba la versión anterior: todo indexado por el nombre visible
  await seedSession(page, { xp: 300, xpLocal: 100, extra: {
    connections: [ANA, "Laura M."],
    xpSynced: [`conn:${ANA}`, "conn:Laura M.", "coffee:1"],
    qrConn: [{ name: ANA, role: "CTO · Fintech", lugar: "En persona", userId: UID_A, at: now - 864e5, interests: [], hora: "10:00", fecha: "26 de noviembre de 2026" }],
    dms: {
      [ANA]: [{ who: "me", text: "Hola de antes", at: now - 6e5, sid: 1 }],
      "Laura M.": [{ who: "me", text: "¿Hablamos de datos?", at: now - 5e5 }, { who: "them", text: "¡Claro!", at: now - 4e5 }, { who: "me", text: "Mensaje sin enviar", at: now - 3e5 }],
    },
    coffees: { "Laura M.": { status: "accepted", at: now - 6e5, role: "proposer", slot: "15:00 · Lounge B", sid: 1 } },
    requests: { "Sara Núñez": { status: "pending", at: now - 2e5, real: true, userId: UID_S, via: "dir", headline: "Data Lead · Rappi" } },
    outbox: [{ t: "dm", id: `Laura M.|${now - 3e5}`, n: "Laura M.", at: now - 3e5 }],
    actions: { "f-Laura M.": true },
  } });
  await page.goto("/#red");
  await waitSync(api);

  const KA = peerKey(ana), KL = peerKey(laura), KS = peerKey(sara);
  expect(KL).toBe("c:1");
  await expect.poll(async () => (await engineState(page)).connections.slice().sort()).toEqual([KA, KL].sort());
  await expect.poll(async () => (await engineState(page)).outbox.length).toBe(0);
  const A = await engineState(page);
  expect(A.idv).toBe(1);
  // Ninguna estructura queda indexada por nombre
  for (const o of [A.dms, A.coffees, A.requests, A.inbound || {}]) for (const k of Object.keys(o)) expect(k).toMatch(/^[uc]:/);
  expect(A.xpSynced.filter((k) => k.startsWith("conn:")).sort()).toEqual([`conn:${KA}`, `conn:${KL}`].sort());
  // XP: el total no cambia y la XP ya reconciliada no se resta otra vez
  expect(A.xpLocal).toBe(100);
  expect(A.xp).toBe(300);
  expect(A.xp).toBe(api.user.xp + A.xpLocal);
  // Hilos, café, solicitud y plan de acción
  expect(A.dms[KA].map((m) => m.text)).toEqual(["Hola de antes"]); // sin duplicar el mensaje que ya estaba en el servidor
  expect(A.dms[KL].map((m) => m.text)).toEqual(["¿Hablamos de datos?", "¡Claro!", "Mensaje sin enviar"]);
  expect(api.messages.find((m) => m.body === "Mensaje sin enviar")).toMatchObject({ connectionId: 3 }); // la cola migrada se envió a su conexión
  expect(A.coffees[KL]).toMatchObject({ status: "accepted", sid: 1 });
  expect(A.requests[KS]).toMatchObject({ status: "pending", real: true, userId: UID_S });
  expect(A.actions[`f-${KL}`]).toBe(true);
  expect(A.qrConn).toEqual([expect.objectContaining({ key: KA, name: ANA, userId: UID_A })]);
  expect(A.people[KL]).toMatchObject({ name: "Laura M.", contactId: 1 });

  // La interfaz muestra los nombres de siempre y el chat migrado
  await expect(page.locator(`#connsCard .cc:has([data-cmsg="${KA}"]) .cc-name`)).toContainText(ANA);
  await expect(page.locator(`#connsCard .cc:has([data-cmsg="${KL}"]) .cc-name`)).toContainText("Laura M.");
  await expect(page.locator("#sentSec")).toContainText("Sara Núñez");
  await page.locator(`#connsCard [data-cmsg="${KL}"]`).click();
  await expect(page.locator("#dmLog .bubble")).toHaveCount(3);
  await page.keyboard.press("Escape");

  // Tras recargar (y otro sync) nada cambia
  await page.reload();
  await waitSync(api, 2);
  await goTab(page, "red");
  await expect(page.locator(`#connsCard [data-cmsg="${KA}"]`)).toBeVisible();
  const B = await engineState(page);
  expect(B.connections.slice().sort()).toEqual([KA, KL].sort());
  expect(B.xp).toBe(300);
  expect(B.xpLocal).toBe(100);
  expect(api.messages.filter((m) => m.body === "Mensaje sin enviar")).toHaveLength(1);
});
