import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, goOnline } from "./support/mock-api.js";
import { goTab } from "./support/ui.js";

/** Espera a que termine el sync inicial (GET /api/me/connections es la última lectura) */
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(n);

test("XP híbrida: una misión hecha offline y confirmada online no suma dos veces", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page, { xp: 100, xpLocal: 100 });
  await page.goto("/#quests");
  await waitSync(api);
  expect((await engineState(page)).xp).toBe(100); // 0 del servidor + 100 locales

  api.offline = true;
  const btn = page.locator('[data-act="complete"]').first();
  const code = await btn.getAttribute("data-v");
  await btn.click();
  let A = await engineState(page);
  const gained = A.xp - 100;
  expect(gained).toBeGreaterThan(0);
  expect(A.xpLocal).toBe(100 + gained);
  expect(A.outbox.map((o) => `${o.t}:${o.id}`)).toEqual([`mission:${code}`]);

  api.missionXp = gained; // el servidor usa el mismo catálogo de misiones que el frontend
  await goOnline(page, api);
  await expect.poll(async () => (await engineState(page)).outbox.length).toBe(0);
  await waitSync(api, 2);
  A = await engineState(page);
  expect(api.user.xp).toBe(gained); // el servidor suma la misión una vez
  expect(A.xpSynced).toContain(`mission:${code}`);
  expect(A.xpLocal).toBe(100);  // su XP pasó de local al servidor
  expect(A.xp).toBe(api.user.xp + A.xpLocal);  // A.xp = xpServidor + A.xpLocal

  // Otro sync completo no vuelve a restar ni a sumar
  const before = A.xp;
  await goOnline(page, api);
  await waitSync(api, 3);
  expect((await engineState(page)).xp).toBe(before);
  expect(api.log.filter((r) => r.path === `/api/me/missions/${encodeURIComponent(code)}/complete`)).toHaveLength(1);
});

test("offline: las acciones se encolan en A.outbox y se reenvían en orden", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#quests");
  await waitSync(api);

  api.offline = true;
  const m1 = await page.locator('[data-act="complete"]').nth(0).getAttribute("data-v");
  await page.locator('[data-act="complete"]').nth(0).click();
  await goTab(page, "agenda");
  const attend = page.locator('[data-act="attend"]').first();
  const ses = await attend.getAttribute("data-v");
  await attend.click();
  await goTab(page, "quests");
  const m2 = await page.locator('[data-act="complete"]').nth(0).getAttribute("data-v");
  await page.locator('[data-act="complete"]').nth(0).click();

  expect((await engineState(page)).outbox.map((o) => `${o.t}:${o.id}`)).toEqual([`mission:${m1}`, `checkin:${ses}`, `mission:${m2}`]);

  const start = api.log.length;
  await goOnline(page, api);
  await expect.poll(async () => (await engineState(page)).outbox.length).toBe(0);
  const sent = api.log.slice(start).filter((r) => r.method === "POST" && /missions|checkins/.test(r.path)).map((r) => r.path);
  expect(sent).toEqual([`/api/me/missions/${encodeURIComponent(m1)}/complete`, "/api/me/checkins", `/api/me/missions/${encodeURIComponent(m2)}/complete`]);
});
