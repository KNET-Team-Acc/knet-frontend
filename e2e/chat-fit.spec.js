import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, catalogConnection, peerConnection } from "./support/mock-api.js";

/* Issue #39: el avatar de una conexión abre su perfil y el chat 1:1 se ajusta a la pantalla */
const MATCH = "Laura M.";
const contact = () => ({ id: 1, userId: null, name: MATCH, initials: "LA", headline: "CTO · Fintech", industry: "tech", affinity: 88,
  matchReason: "Comparte Datos contigo", interests: ["Datos"], likes: [], goal: "Escalar IA" });
const waitSync = (api) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(1);
const manyMsgs = () => Array.from({ length: 24 }, (_, i) => ({ who: i % 2 ? "them" : "me", text: `Mensaje número ${i + 1} sobre la agenda del Summit`, at: Date.now() - (24 - i) * 60000 }));

async function setup(page, extra = {}) {
  const api = await installMockApi(page, { contacts: [contact()], connections: [catalogConnection(3, MATCH, "accepted")] });
  await seedSession(page, { extra: { connections: [MATCH], xpSynced: [`conn:${MATCH}`], ...extra } });
  await page.goto("/#red");
  await waitSync(api);
}

test("avatar de Mis conexiones: abre el perfil con clic, Enter y Espacio", async ({ page }) => {
  await setup(page);
  const av = page.locator(`#connsCard [data-avprof="${MATCH}"]`);
  await expect(av).toHaveAttribute("aria-label", `Ver el perfil de ${MATCH}`);
  await expect(av).toHaveJSProperty("tagName", "BUTTON");
  await av.click();
  await expect(page.locator("#m-person")).toBeVisible();
  await expect(page.locator("#personName")).toHaveText(MATCH);
  for (const key of ["Enter", " "]) {
    await page.keyboard.press("Escape");
    await expect(page.locator("#m-person")).toBeHidden();
    await av.focus();
    await page.keyboard.press(key === " " ? "Space" : key);
    await expect(page.locator("#m-person")).toBeVisible();
  }
});

for (const [w, h] of [[360, 640], [768, 1024], [1280, 720]]) {
  test(`chat a ${w}x${h}: cabecera visible, último mensaje a la vista y la página no se mueve`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await setup(page, { dms: { [MATCH]: manyMsgs() } });
    const btn = page.locator(`#connsCard [data-cmsg="${MATCH}"]`);
    await btn.scrollIntoViewIfNeeded();
    const y0 = await page.evaluate(() => window.scrollY); // posición del fondo al abrir el chat
    await btn.click();
    await expect(page.locator("#m-dm")).toBeVisible();

    // tras la animación de entrada de la tarjeta (toastIn)
    await page.locator("#m-dm .dm-card").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const head = await page.locator("#m-dm .dm-head").boundingBox();
    const card = await page.locator("#m-dm .dm-card").boundingBox();
    expect(head.y).toBeGreaterThanOrEqual(0);
    expect(card.y + card.height).toBeLessThanOrEqual(h + 1);
    await expect(page.locator("#dmTitle")).toBeInViewport();
    await expect(page.locator("#dmIn")).toBeInViewport();

    const log = page.locator("#dmLog");
    await expect.poll(() => log.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThanOrEqual(2);
    expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true); // solo la lista hace scroll
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);

    await page.locator("#dmLog").hover();
    await page.mouse.wheel(0, -400);
    await expect(page.locator("#dmTitle")).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/chat-${w}x${h}.png` });
  });
}

/* Conexión por QR (usuario real, sin ficha de catálogo): el avatar y la cabecera del chat abren su ficha básica */
test("conexión por QR: el avatar y el nombre del chat abren la ficha básica; «Enviar» no se recorta", async ({ page }) => {
  const PEER = "Diego R.";
  const api = await installMockApi(page, { connections: [peerConnection(5, PEER)] });
  await seedSession(page, { extra: { connections: [PEER], xpSynced: [`conn:${PEER}`] } });
  await page.goto("/#red");
  await expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(1);

  await page.locator(`#connsCard [data-avprof="${PEER}"]`).click();
  await expect(page.locator("#m-person")).toBeVisible();
  await expect(page.locator("#personName")).toHaveText(PEER);
  await expect(page.locator("#m-person .peer-note")).toBeVisible();
  await expect(page.locator('#m-person [data-pact="chat"]')).toBeVisible();

  await page.locator('#m-person [data-pact="chat"]').click();
  await expect(page.locator("#m-dm")).toBeVisible();
  await page.locator("#m-dm .dm-who").click();
  await expect(page.locator("#m-person")).toBeVisible();
  await expect(page.locator("#personName")).toHaveText(PEER);

  for (const [w, h] of [[360, 640], [1280, 720]]) {
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: w, height: h });
    await page.locator(`#connsCard [data-cmsg="${PEER}"]`).click();
    await expect(page.locator("#m-dm")).toBeVisible();
    await page.locator("#m-dm .dm-card").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    // «Enviar» y su sombra (3px) caben dentro del área visible de la tarjeta
    const fits = await page.locator("#dmForm button[type=submit]").evaluate((b) => {
      const card = b.closest(".dm-card"), r = b.getBoundingClientRect(), c = card.getBoundingClientRect(), cs = getComputedStyle(card);
      return r.right + 3 <= c.right - parseFloat(cs.borderRightWidth) && r.bottom + 3 <= c.bottom && r.left >= c.left;
    });
    expect(fits).toBe(true);
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/qr-chat-${w}x${h}.png` });
  }
});

test("sin perfil disponible: el clic muestra un aviso en vez de no hacer nada", async ({ page }) => {
  await setup(page);
  await page.evaluate(() => { const b = document.createElement("button"); b.dataset.avprof = "Nadie Conocido"; b.id = "ghost"; b.textContent = "x"; document.body.append(b); });
  await page.locator("#ghost").click();
  await expect(page.locator("#m-person")).toBeHidden();
  await expect(page.getByText("No hay un perfil disponible para Nadie Conocido")).toBeVisible();
});

/* Intereses de un contacto por QR: llegan en contact.interests (el backend aplica su permiso «interests») */
test("conexión por QR: la ficha muestra sus intereses y una ficha guardada sin ellos se completa en el sync", async ({ page }) => {
  const PEER = "Diego R.", conn = peerConnection(5, PEER);
  conn.contact = { ...conn.contact, interests: ["IA generativa", "Datos", "<b>XSS</b>"], headline: "CTO · Logística" };
  await installMockApi(page, { connections: [conn] });
  // Ficha que este navegador guardó antes del arreglo: sin intereses y con el cargo genérico
  const old = { name: PEER, role: "Asistente de KNET", lugar: "En persona", userId: conn.contact.userId, at: Date.now() - 864e5, interests: [], hora: "10:00", fecha: "26 de noviembre de 2026" };
  await seedSession(page, { extra: { connections: [PEER], xpSynced: [`conn:${PEER}`], qrConn: [old] } });
  await page.goto("/#red");

  await expect.poll(() => page.evaluate((n) => JSON.parse(localStorage.getItem("knet-demo-v1")).qrConn.find((q) => q.name === n)?.interests, PEER))
    .toEqual(["IA generativa", "Datos", "bXSS/b"]);
  await page.locator(`#connsCard [data-avprof="${PEER}"]`).click();
  await expect(page.locator("#m-person")).toBeVisible();
  const chips = page.locator("#m-person .peer-cols .chip");
  await expect(chips).toHaveText(["IA generativa", "Datos", "bXSS/b"]);
  await expect(page.locator("#m-person")).not.toContainText("Aún no compartió sus intereses.");
  await expect(page.locator("#m-person")).toContainText("CTO · Logística");
});
