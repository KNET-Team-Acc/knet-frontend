import { test, expect } from "@playwright/test";
import { installMockApi, engineState } from "./support/mock-api.js";
import { signUpViaUi, dismissOverlays } from "./support/ui.js";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
});

test("crea la cuenta y el perfil, lo sube a la API y lo edita con el lápiz", async ({ page }) => {
  const api = await installMockApi(page);
  await page.goto("/");
  await signUpViaUi(page, { name: "Paola Prueba" });

  const A = await engineState(page);
  expect(A.connected).toBe(true);
  expect(A.accountId).toBe(api.user.id);
  await expect.poll(() => api.user.role).toBe("Gerente de Producto"); // el perfil local se sube (PATCH /api/me)
  expect(api.log.some((r) => r.path === "/api/auth/register")).toBe(true);
  expect(api.log.filter((r) => r.path.startsWith("/api/me")).every((r) => r.auth.startsWith("Bearer "))).toBe(true);

  // Edición con el lápiz
  await page.locator('#appPanel [data-act="pfedit"][data-v="role"]').click();
  await page.fill("#pfe", "Directora de Producto");
  await page.press("#pfe", "Enter"); // Enter guarda, igual que el botón «Guardar»
  await expect.poll(() => api.user.role).toBe("Directora de Producto");
  expect((await engineState(page)).profile.role).toBe("Directora de Producto");
  expect((await engineState(page)).profile.src.role).toBe("edited");
});

test("recargar conserva la sesión y cerrar sesión la borra", async ({ page }) => {
  await installMockApi(page);
  await page.goto("/");
  await signUpViaUi(page);
  await page.reload();
  await expect(page.locator("#appView")).toBeVisible();
  await dismissOverlays(page, 500);
  await page.locator("#logoutBtn").click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("knet-auth"))).toBeNull();
  expect((await engineState(page)).connected).toBe(false);
});
