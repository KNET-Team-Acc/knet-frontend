import { test, expect } from "@playwright/test";
import { installMockApi, seedSession } from "./support/mock-api.js";

test("cabeceras de seguridad y ninguna violación de la CSP al arrancar y entrar al panel", async ({ page }) => {
  const violations = [];
  page.on("console", (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text()); });
  await installMockApi(page);
  await seedSession(page);
  const res = await page.goto("/#perfil");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("script-src 'self'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  await expect(page.locator("#appView")).toBeVisible();
  await page.waitForTimeout(1500); // fuentes, WebGL de la landing y sync inicial
  expect(violations).toEqual([]);
});

test("recargar en una ruta interna devuelve la app (fallback SPA)", async ({ page }) => {
  await installMockApi(page);
  const res = await page.goto("/eventos/bog?x=1");
  expect(res.status()).toBe(200);
  await expect(page.locator("#top")).toBeAttached();
  await expect(page.locator("[data-connect]").first()).toBeAttached();
});
