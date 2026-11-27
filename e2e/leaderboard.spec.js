import { test, expect } from "@playwright/test";
import { installMockApi, seedSession } from "./support/mock-api.js";

/** Espera a que termine el sync (GET /api/me/connections es una de sus lecturas) */
const waitSync = (api) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(1);
const SARA = { userId: "00000000-0000-4000-8000-0000000000a1", name: "Sara Núñez", xp: 900 };
const TOMAS = { userId: "00000000-0000-4000-8000-0000000000a2", name: "Tomás Rey", xp: 50 };

test("ranking: general del evento y solo mis conexiones, con tu XP local en el orden", async ({ page }) => {
  // El servidor te tiene con 0 XP; el motor suma tus 100 XP locales y te pone por encima de Tomás
  const api = await installMockApi(page, { leaderboard: { event: [SARA, TOMAS], connections: [SARA] } });
  await seedSession(page);
  await page.goto("/#quests");
  await waitSync(api);
  const card = page.locator("#lbCard");
  await expect(card.locator(".lb-row")).toHaveCount(3);
  await expect(card.locator(".lb-row").nth(0)).toContainText("Sara Núñez");
  await expect(card.locator(".lb-row").nth(1)).toHaveClass(/\bme\b/);
  await expect(card.locator(".lb-row").nth(2)).toContainText("Tomás Rey");
  await expect(card.locator(".lb-row").nth(0)).toContainText("Nivel 2");
  await expect(card.locator(".chip-accent")).toHaveText("#2 de 3");
  await expect(card).not.toContainText("Solo tú por ahora");
  expect(api.log.some((r) => r.path === "/api/me/leaderboard")).toBe(true);

  await card.locator('[data-lbscope="connections"]').click();
  await expect(card.locator('[data-lbscope="connections"]')).toHaveAttribute("aria-selected", "true");
  await expect(card.locator('[data-lbscope="connections"]')).toBeFocused();
  await expect(card.locator(".lb-row")).toHaveCount(2);
  await expect(card).not.toContainText("Tomás Rey");
  await expect(card.locator(".chip-accent")).toHaveText("#2 de 2");

  await card.locator('[data-lbscope="event"]').click();
  await expect(card.locator(".lb-row")).toHaveCount(3);
});

test("ranking de conexiones vacío: lleva al directorio de asistentes", async ({ page }) => {
  const api = await installMockApi(page, { leaderboard: { event: [SARA], connections: [] } });
  await seedSession(page);
  await page.goto("/#quests");
  await waitSync(api);
  const card = page.locator("#lbCard");
  await expect(card.locator(".chip-accent")).toHaveText("#2 de 2");
  await card.locator('[data-lbscope="connections"]').click();
  await expect(card).toContainText("Aún no tienes conexiones en este evento");
  await expect(card.locator(".chip-accent")).toHaveText("Solo tú por ahora");
  await expect(card.locator('[data-act="goto"][data-v="red:attendeesCard"]')).toBeVisible();
});

test("ranking sin el endpoint (backend anterior): solo tú y sin pestañas", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#quests");
  await waitSync(api);
  const card = page.locator("#lbCard");
  await expect(card.locator(".chip-accent")).toHaveText("Solo tú por ahora");
  await expect(card).toContainText("El ranking se llena con asistentes reales");
  await expect(card.locator("[data-lbscope]")).toHaveCount(0);
});
