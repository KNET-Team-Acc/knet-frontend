import { expect } from "@playwright/test";

/** Cierra el onboarding que abre la app tras crear el perfil (avatar y tour guiado) */
export async function dismissOverlays(page, waitMs = 2500) {
  await page.waitForTimeout(waitMs);
  for (let i = 0; i < 12; i++) {
    const busy = await page.evaluate(() => !!document.querySelector(".tour")
      || [...document.querySelectorAll(".modal")].some((m) => !m.hidden && !m.dataset.locked));
    if (!busy) return;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }
}

/** Abre la entrada al panel desde la landing */
export async function openEntry(page) {
  await page.locator("[data-connect]:visible").first().click();
}

/** Crea una cuenta y el perfil por la interfaz. Devuelve el correo usado. */
export async function signUpViaUi(page, { name = "Paola Prueba", email = `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@knet.test`, password = "clave-segura-1" } = {}) {
  await openEntry(page);
  await expect(page.locator("#m-auth")).toBeVisible();
  await page.locator("[data-authtab=register]").click();
  await page.fill("#au-name", name);
  await page.fill("#au-email", email);
  await page.fill("#au-pass", password);
  await page.check("#au-tyc");
  await page.check("#au-priv");
  await page.click("#authSubmit");
  await expect(page.locator("#mcpForm")).toBeVisible();
  await page.fill("#pf-role", "Gerente de Producto");
  await page.selectOption("#pf-sen", { index: 2 });
  await page.locator("#pf-ints .av-chip").first().click();
  await page.click("#mcpForm button[type=submit]");
  await page.waitForFunction(() => location.hash === "#perfil");
  await dismissOverlays(page);
  return email;
}

export const goTab = (page, tab) => page.evaluate((t) => { location.hash = "#" + t; }, tab);
