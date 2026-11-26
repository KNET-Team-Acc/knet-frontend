import { test, expect } from "@playwright/test";
import { signUpViaUi, goTab, dismissOverlays } from "../support/ui.js";

/**
 * Catálogo real contra knet-backend (issue #16): GET /api/events trae los 4 eventos con fuente oficial y una
 * cuenta nueva se inscribe en cada uno desde «Mis eventos › Explorar» sin 404 ni errores de consola.
 */
const API = process.env.E2E_API_URL || "http://localhost:4000";
const REAL = ["and", "ais", "edu", "adc"];
const token = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-auth") || "null")?.accessToken);
const apiGet = async (page, path) => {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${await token(page)}` } });
  return { status: r.status, json: r.status === 204 ? null : await r.json().catch(() => null) };
};

test("catálogo real: los 4 eventos del backend y la inscripción en cada uno", async ({ page }) => {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/WebGL|GL Driver|GPU stall/.test(m.text())) problems.push(`console: ${m.text()}`); });
  page.on("response", (r) => { if (r.url().startsWith(API) && r.status() === 404) problems.push(`404 ${r.request().method()} ${r.url().slice(API.length)}`); });

  // El backend publica exactamente el catálogo real
  const list = await (await fetch(`${API}/api/events`)).json();
  expect(list.events.map((e) => e.id).sort()).toEqual([...REAL].sort());
  for (const id of REAL) expect((await fetch(`${API}/api/events/${id}`)).status).toBe(200);
  for (const id of ["bog", "med", "baq", "x2", "x5"]) expect((await fetch(`${API}/api/events/${id}`)).status).toBe(404);

  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  await signUpViaUi(page, { name: "E2E Catálogo" });
  await expect.poll(async () => (await page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1") || "null")))?.apiLinked).toBe(true);

  await goTab(page, "miseventos");
  await dismissOverlays(page, 500);
  await page.locator('#appPanel [data-meview="explore"]').click();
  for (const id of REAL) {
    const card = page.locator(`#ev-${id}`);
    await expect(card).toBeVisible();
    const btn = card.locator(`[data-act="evsave"][data-v="${id}"]`);
    if (!(await btn.evaluate((b) => b.classList.contains("is-saved")))) await btn.click();
    await expect(card.locator(`[data-act="evsave"][data-v="${id}"]`)).toHaveClass(/is-saved/);
  }
  await expect.poll(async () => ((await apiGet(page, "/api/me/registrations")).json?.registrations || []).map((r) => r.eventId).sort())
    .toEqual([...REAL].sort());

  // Agenda de un evento con días (check-in en el servidor) y de uno con fecha por confirmar (estado vacío)
  await goTab(page, "agenda");
  await page.locator('#appPanel select[data-evsel="main"]').selectOption("edu");
  await expect(page.locator("#agendaCard")).toContainText("Edutechnia 2027");
  await expect(page.locator("#appPanel [data-ai-note]")).toContainText("Recomendación orientativa");
  await page.locator('#agendaCard [data-act="attend"]').first().click();
  await expect.poll(async () => ((await apiGet(page, "/api/me/checkins?eventId=edu")).json?.checkins || []).length).toBe(1);
  await page.locator('#appPanel select[data-evsel="main"]').selectOption("ais");
  await expect(page.locator("#agendaCard")).toContainText("AI Summit Colombia 2027");
  await expect(page.locator('#agendaCard [data-act="attend"]')).toHaveCount(0);

  expect(problems).toEqual([]);

  // Limpieza: borrar la cuenta de prueba
  const r = await fetch(API + "/api/me", { method: "DELETE", headers: { Authorization: `Bearer ${await token(page)}` } });
  expect(r.status).toBe(200);
});
