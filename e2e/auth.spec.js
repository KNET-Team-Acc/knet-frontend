import { test, expect } from "@playwright/test";
import { installMockApi, seedSession } from "./support/mock-api.js";

test("token caducado: se refresca una sola vez de forma transparente", async ({ page }) => {
  const api = await installMockApi(page);
  let rejected = 0;
  // La primera petición con el token sembrado responde 401 token_expired
  await page.route("http://api.knet.test/api/events", async (route) => {
    if (route.request().headers().authorization === "Bearer acc-seed") {
      rejected++;
      return route.fulfill({ status: 401, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }, body: JSON.stringify({ error: "token_expired" }) });
    }
    return route.fallback();
  });
  await seedSession(page);
  await page.goto("/#perfil");
  await expect.poll(() => api.log.filter((r) => r.path === "/api/auth/refresh").length).toBe(1);
  await expect.poll(() => api.log.some((r) => r.path === "/api/me/connections")).toBe(true);
  expect(rejected).toBe(1);
  await expect(page.locator("#appView")).toBeVisible();
  const auth = await page.evaluate(() => JSON.parse(localStorage.getItem("knet-auth")));
  expect(auth.accessToken).not.toBe("acc-seed");
});

test("si el refresh falla, vuelve al login", async ({ page }) => {
  await installMockApi(page);
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  await page.route("http://api.knet.test/api/events", (r) => r.fulfill({ status: 401, headers: cors, body: '{"error":"token_expired"}' }));
  await page.route("http://api.knet.test/api/auth/refresh", (r) => r.fulfill({ status: 401, headers: cors, body: '{"error":"invalid_refresh"}' }));
  await seedSession(page);
  await page.goto("/#perfil");
  await expect(page.locator("#m-auth")).toBeVisible();
  await expect(page.locator("#authNotice")).toContainText("Tu sesión caducó");
  await expect(page.locator("#appView")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("knet-auth"))).toBeNull();
});

test("legal_outdated: no se entra al panel hasta aceptar", async ({ page }) => {
  const api = await installMockApi(page, { user: { legalVersion: "0.9" } });
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  await page.locator("[data-connect]:visible").first().click();
  await page.locator("[data-authtab=login]").click();
  await page.fill("#au-email", "e2e@knet.test");
  await page.fill("#au-pass", "clave-segura-1");
  await page.click("#authSubmit");
  await expect(page.locator("#m-legalup")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#m-legalup")).toBeVisible();
  await page.check("#lu-tyc");
  await page.check("#lu-priv");
  await page.click("[data-legalupaccept]");
  await expect(page.locator("#appView")).toBeVisible();
  const acc = api.consents.find((c) => c.type === "aceptacion");
  expect(acc.payload.documents.map((d) => d.id).sort()).toEqual(["privacidad", "terminos"]);
});
