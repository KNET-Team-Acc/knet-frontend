import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState } from "./support/mock-api.js";
import { dismissOverlays } from "./support/ui.js";

const AVATAR = { gender: "mujer", skin: 2, hair: "bob", hairColor: 1, outfit: 0, acc: "credencial", beard: false };

/** Cierra sesión desde la barra y espera a la landing */
async function logout(page) {
  await page.click("#logoutBtn");
  await expect(page.locator("#appView")).toBeHidden();
  await expect(page.locator("#logoutBtn")).toBeHidden();
}

/** Ningún CTA visible ofrece «Continuar como…» / «Continue as…» */
async function expectNoContinueAs(page) {
  await expect(page.locator("body")).not.toContainText(/Continuar como|Continue as/);
}

test("cerrar sesión: solo inicio de sesión (sin «Continuar como») y al volver se recupera todo", async ({ page }) => {
  const api = await installMockApi(page, { user: { xp: 320 } });
  await seedSession(page, { xp: 320, xpLocal: 0, extra: { avatar: AVATAR } });
  await page.goto("/#perfil");
  await expect(page.locator("#appView")).toBeVisible();
  await dismissOverlays(page, 800);

  await logout(page);
  await expectNoContinueAs(page);
  await expect(page.locator("#navLblL")).toHaveText("Iniciar sesión");
  await expect(page.locator(".cta-connect-lbl").first()).toHaveText("Iniciar sesión");

  // El perfil, el avatar y el progreso siguen en este navegador
  const off = await engineState(page);
  expect(off.connected).toBe(false);
  expect(off.loggedOut).toBe(true);
  expect(off.profile.name).toBe("Paola Prueba");
  expect(off.avatar).toEqual(AVATAR);
  expect(off.xp).toBe(320);
  expect(off.events).toContain("and");

  // En inglés tampoco aparece «Continue as…»
  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="en"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectNoContinueAs(page);
  await expect(page.locator("#navLblL")).toHaveText("Log in");
  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="es"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // Una recarga mantiene el estado de «sesión cerrada»
  await page.reload();
  await expectNoContinueAs(page);
  await expect(page.locator("#navLblL")).toHaveText("Iniciar sesión");

  // El CTA abre directamente el formulario de inicio de sesión
  await page.locator("[data-connect]:visible").first().click();
  await expect(page.locator("#m-auth")).toBeVisible();
  await expect(page.locator("[data-authtab=login]")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#authNameRow")).toBeHidden();
  await expect(page.locator("#appView")).toBeHidden();
  await expectNoContinueAs(page);

  // Volver a iniciar sesión con la misma cuenta recupera perfil, avatar y progreso
  await page.fill("#au-email", "e2e@knet.test");
  await page.fill("#au-pass", "clave-segura-1");
  await page.click("#authSubmit");
  await expect(page.locator("#appView")).toBeVisible();
  expect(api.log.some((r) => r.path === "/api/auth/login")).toBe(true);
  const back = await engineState(page);
  expect(back.connected).toBe(true);
  expect(back.loggedOut).toBeUndefined();
  expect(back.profile.name).toBe("Paola Prueba");
  expect(back.avatar).toEqual(AVATAR);
  expect(back.xp).toBe(320);
  expect(back.events).toContain("and");
  await expect(page.locator("#userChip")).toContainText("Paola");
});

test("cerrar sesión desde la actualización legal tampoco ofrece «Continuar como»", async ({ page }) => {
  await installMockApi(page, { user: { legalVersion: "0.9" } });
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  await page.locator("[data-connect]:visible").first().click();
  await page.locator("[data-authtab=login]").click();
  await page.fill("#au-email", "e2e@knet.test");
  await page.fill("#au-pass", "clave-segura-1");
  await page.click("#authSubmit");
  await expect(page.locator("#m-legalup")).toBeVisible();
  await page.click("[data-legaluplogout]");
  await expect(page.locator("#m-legalup")).toBeHidden();
  await expectNoContinueAs(page);
  await expect(page.locator("#navLblL")).toHaveText("Iniciar sesión");
  expect((await engineState(page)).loggedOut).toBe(true);
  await page.locator("[data-connect]:visible").first().click();
  await expect(page.locator("#m-auth")).toBeVisible();
  await expect(page.locator("[data-authtab=login]")).toHaveAttribute("aria-selected", "true");
});
