import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, goOnline, USER_ID } from "./support/mock-api.js";

/** «Revocar y borrar mis datos» (pide confirmar con un segundo clic) */
async function revokeAndErase(page) {
  const b = page.locator('#appPanel [data-act="revoke"]');
  await b.click();
  await b.click();
}
const ls = (page, k) => page.evaluate((key) => localStorage.getItem(key), k);
const deletes = (api) => api.log.filter((r) => r.method === "DELETE" && r.path === "/api/me");

test.beforeEach(async ({ page }) => { await seedSession(page); });

test("online: borra local y llama a DELETE /api/me con la sesión", async ({ page }) => {
  const api = await installMockApi(page);
  await page.goto("/#perfil");
  await expect.poll(() => api.log.some((r) => r.path === "/api/me/connections")).toBe(true);
  await revokeAndErase(page);
  await expect.poll(() => deletes(api).length).toBe(1);
  expect(deletes(api)[0].auth).toMatch(/^Bearer /);
  await expect(page.locator("#appView")).toBeHidden();
  await expect.poll(() => ls(page, "knet-auth")).toBeNull();
  expect(await ls(page, "knet-demo-v1")).toBeNull();
  expect(await ls(page, "knet-pending-erase")).toBeNull();
  // La revocación quedó en la cadena antes que la supresión
  expect(api.consents.at(-1).type).toBe("revocacion");
});

test("offline: guarda el UUID en knet-pending-erase y reintenta en syncFromApi()", async ({ page }) => {
  const api = await installMockApi(page);
  await page.goto("/#perfil");
  await expect.poll(() => api.log.some((r) => r.path === "/api/me/connections")).toBe(true);
  api.offline = true;
  await revokeAndErase(page);
  await expect.poll(() => ls(page, "knet-pending-erase")).toBe(JSON.stringify([USER_ID]));
  expect(await ls(page, "knet-demo-v1")).toBeNull();
  expect(await ls(page, "knet-auth")).not.toBeNull(); // se conserva solo para reintentar el borrado

  await goOnline(page, api);
  await expect.poll(() => deletes(api).length).toBe(1);
  await expect.poll(() => ls(page, "knet-pending-erase")).toBeNull();
  await expect.poll(() => ls(page, "knet-auth")).toBeNull();
  // La revocación pendiente llega al servidor antes que el borrado
  const iRev = api.log.findIndex((r) => r.path === "/api/me/consents" && r.method === "POST");
  const iDel = api.log.findIndex((r) => r.method === "DELETE" && r.path === "/api/me");
  expect(iRev).toBeGreaterThan(-1);
  expect(iRev).toBeLessThan(iDel);
});

test("403 demo_account: solo se borra lo local", async ({ page }) => {
  const api = await installMockApi(page);
  api.deleteMode = "demo";
  await page.goto("/#perfil");
  await expect.poll(() => api.log.some((r) => r.path === "/api/me/connections")).toBe(true);
  await revokeAndErase(page);
  await expect.poll(() => deletes(api).length).toBe(1);
  await expect(page.locator("#toasts")).toContainText("Cuenta demo compartida");
  expect(await ls(page, "knet-demo-v1")).toBeNull();
  expect(await ls(page, "knet-pending-erase")).toBeNull();
});
