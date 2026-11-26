import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState } from "./support/mock-api.js";

/** Espera a que termine el sync inicial (GET /api/me/connections es una de sus lecturas) */
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(n);

/** WebXR simulado: `modes` = sesiones que el dispositivo dice soportar; null = navegador sin navigator.xr */
const fakeXR = (page, modes) => page.addInitScript((m) => {
  const xr = m === null ? undefined : { isSessionSupported: (k) => Promise.resolve(m.includes(k)), requestSession: () => Promise.reject(new Error("sin visor")) };
  Object.defineProperty(navigator, "xr", { configurable: true, get: () => xr });
}, modes);

async function openVenue(page, events) {
  const api = await installMockApi(page, { registrations: events });
  await seedSession(page, { extra: { events, sel: { main: { ev: events[0], day: 0 } } } });
  await page.goto("/#agenda");
  await waitSync(api);
  await page.evaluate(() => { location.hash = "#recinto"; });
  await expect(page.locator("#venueCanvas")).toBeVisible();
}

test("multievento: inscrito en dos eventos, el selector cambia el recinto 3D/AR y el evento activo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fakeXR(page, ["immersive-vr", "immersive-ar"]);
  await openVenue(page, ["and", "adc"]);

  const card = page.locator(".vn-card"), sel = page.locator("#vnEvSel");
  await expect(card.locator(".pcard-t")).toHaveText("Andina Link Smart Cities Expo 2027");
  await expect(sel).toBeVisible();
  await expect(sel.locator("option")).toHaveCount(2);
  await expect(page.locator(".vn-z")).toContainText(["Congreso", "Feria de expositores", "Zona de networking", "Salas técnicas"]);

  await sel.selectOption("adc");
  await expect(card.locator(".pcard-t")).toHaveText("ANDICOM 2027");
  await expect(page.locator(".vn-z")).toContainText(["Plenaria", "Muestra comercial", "Networking", "Salas temáticas"]);
  await expect(page.locator("#venueCanvas")).toHaveAttribute("aria-label", /ANDICOM 2027.*Plenaria/);
  await expect.poll(async () => (await engineState(page)).sel.main.ev).toBe("adc");

  // Volver al primero, sin recargar la página
  await page.locator("#vnEvSel").selectOption("and");
  await expect(card.locator(".pcard-t")).toHaveText("Andina Link Smart Cities Expo 2027");
  await expect.poll(async () => (await engineState(page)).sel.main.ev).toBe("and");
  await expect(page.locator("#vnAR")).toBeEnabled();
  await expect(page.locator("#vnNote")).toContainText("AR y VR disponibles");
  expect(errors).toEqual([]);
});

test("sin soporte immersive-ar: el botón AR se deshabilita y se explica por qué", async ({ page }) => {
  await fakeXR(page, ["immersive-vr"]);
  await openVenue(page, ["and"]);
  await expect(page.locator("#vnAR")).toBeDisabled();
  await expect(page.locator("#vnVR")).toBeEnabled();
  const note = page.locator("#vnNote");
  await expect(note).toContainText("no admite realidad aumentada");
  await expect(note).toContainText("ARCore");
  await expect(note).toHaveClass(/warn/);
});

test("navegador sin WebXR: AR y VR deshabilitados con mensaje claro", async ({ page }) => {
  await fakeXR(page, null);
  await openVenue(page, ["and"]);
  await expect(page.locator("#vnAR")).toBeDisabled();
  await expect(page.locator("#vnVR")).toBeDisabled();
  await expect(page.locator("#vnNote")).toContainText("no es compatible con WebXR");
  await expect(page.locator("#vnNote")).toHaveClass(/warn/);
});
