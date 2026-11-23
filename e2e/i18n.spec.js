import { test, expect } from "@playwright/test";
import { installMockApi } from "./support/mock-api.js";
import { openEntry } from "./support/ui.js";

test("cambia de español a inglés y vuelve", async ({ page }) => {
  await installMockApi(page);
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  await openEntry(page);
  await expect(page.locator("#authTitle")).toHaveText("Crea tu cuenta KNET");
  await page.keyboard.press("Escape");

  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="en"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await openEntry(page);
  await expect(page.locator("#authTitle")).toHaveText("Create your KNET account");
  await expect(page.locator("[data-authtab=login]")).toHaveText("Sign in");
  await expect(page.locator("#au-email")).toHaveAttribute("placeholder", "you@company.com");
  await page.click("#authSubmit");
  await expect(page.locator("#authErr")).toHaveText("Enter your name.");
  await page.keyboard.press("Escape");

  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="es"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await openEntry(page);
  await expect(page.locator("#authTitle")).toHaveText("Crea tu cuenta KNET");
});
