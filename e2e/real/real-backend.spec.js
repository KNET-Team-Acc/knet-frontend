import { test, expect } from "@playwright/test";
import { signUpViaUi, goTab, dismissOverlays } from "../support/ui.js";

/**
 * Flujo completo contra knet-backend real (ver playwright.real.config.js): cuenta, perfil, misión con
 * XP híbrida, cadena de consentimientos del servidor y supresión de la cuenta.
 */
const API = process.env.E2E_API_URL || "http://localhost:4000";
const token = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-auth") || "null")?.accessToken);
const apiGet = async (page, path) => {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${await token(page)}` } });
  return { status: r.status, json: r.status === 204 ? null : await r.json().catch(() => null) };
};
const engine = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1") || "null"));

test("cuenta real: perfil, misión, consentimientos y supresión", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  const email = await signUpViaUi(page, { name: "E2E Real" });

  // El perfil y la aceptación legal están en el servidor
  await expect.poll(async () => (await apiGet(page, "/api/me")).json?.user?.role).toBe("Gerente de Producto");
  const me = (await apiGet(page, "/api/me")).json.user;
  expect(me.email).toBe(email);
  expect(me.legalVersion).toBeTruthy();
  await expect.poll(async () => (await engine(page)).apiLinked).toBe(true);

  // Misión: el servidor la suma una vez y A.xp = xpServidor + A.xpLocal
  await goTab(page, "quests");
  await dismissOverlays(page, 500);
  const btn = page.locator('#appPanel [data-act="complete"]').first();
  const code = await btn.getAttribute("data-v");
  await btn.click();
  await expect.poll(async () => (await engine(page)).xpSynced?.includes(`mission:${code}`)).toBe(true);
  const missions = (await apiGet(page, "/api/me/missions")).json;
  expect(missions.missions.find((m) => m.code === code)?.completed).toBe(true);
  const A = await engine(page);
  expect(A.xp).toBe(missions.xp + A.xpLocal);

  // Cadena de consentimientos del servidor: válida y con la aceptación del registro
  const cons = (await apiGet(page, "/api/me/consents")).json;
  expect(cons.chain.valid).toBe(true);
  expect(cons.consents.some((c) => c.type === "aceptacion")).toBe(true);

  // Revocar y borrar: la cuenta deja de existir en el servidor
  const oldToken = await token(page);
  await goTab(page, "perfil");
  const revoke = page.locator('#appPanel [data-act="revoke"]');
  await revoke.click();
  await revoke.click();
  await expect(page.locator("#appView")).toBeHidden();
  await expect.poll(async () => (await fetch(API + "/api/me", { headers: { Authorization: `Bearer ${oldToken}` } })).status).toBe(401);
  expect(await page.evaluate(() => localStorage.getItem("knet-auth"))).toBeNull();
});
