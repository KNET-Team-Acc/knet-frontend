import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, goOnline } from "./support/mock-api.js";

const localChain = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-consent-local") || "[]"));

/** Abre el registro (con la API caída muestra la cadena del navegador) y pulsa «Verificar integridad» */
async function verifyLocalChain(page) {
  await page.evaluate(() => document.querySelector("[data-registro]").click());
  await expect(page.locator("[data-regverify]")).toBeVisible();
  await page.click("[data-regverify]");
  const msg = page.locator("#regMsg");
  await expect(msg).not.toBeEmpty();
  const text = await msg.textContent();
  await page.keyboard.press("Escape");
  return text;
}

test("permisos: la cadena local sigue siendo válida y rec.api pasa de pendiente a guardado", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#perfil");
  await expect.poll(() => api.log.some((r) => r.path === "/api/me/connections")).toBe(true);

  api.offline = true;
  const sw = page.locator("#appPanel [data-scope=interests]");
  await sw.uncheck(); // revocar
  await sw.check();   // volver a conceder

  let chain = await localChain(page);
  const perms = chain.filter((r) => r.tipo === "cambio_permiso");
  expect(perms).toHaveLength(2);
  expect(perms.every((r) => r.api.estado === "pendiente")).toBe(true);
  expect(await verifyLocalChain(page)).toContain("Integridad verificada");

  await goOnline(page, api);
  await expect.poll(async () => (await localChain(page)).filter((r) => r.tipo === "cambio_permiso").every((r) => r.api.estado === "guardado")).toBe(true);
  expect(api.consents.filter((c) => c.type === "cambio_permiso")).toHaveLength(2);
  chain = await localChain(page);
  expect(chain.at(-1).hashAnterior).toBe(chain.at(-2).hash);

  // rec.api se escribe después del hash: la cadena sigue verificando
  api.offline = true;
  expect(await verifyLocalChain(page)).toContain("Integridad verificada");
});
