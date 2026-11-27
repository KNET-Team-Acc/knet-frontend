import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, catalogConnection } from "./support/mock-api.js";

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
