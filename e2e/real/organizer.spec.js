import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { signUpViaUi, goTab, dismissOverlays } from "../support/ui.js";

/**
 * Panel de creador de eventos contra knet-backend (knet-frontend#21 + knet-backend#18): una cuenta nueva recibe el
 * rol organizer (npm run user:role del backend: no hay endpoint para darse permisos), crea un evento completo,
 * lo publica y, como asistente, se inscribe, ve la agenda oficial y hace check-in.
 * Backend: KNET_BACKEND_DIR (por defecto ./backend en CI o ../knet-backend en local), con DATABASE_URL de su .env.
 */
const API = process.env.E2E_API_URL || "http://localhost:4000";
const BACKEND = process.env.KNET_BACKEND_DIR || [path.resolve("backend"), path.resolve("..", "knet-backend")].find((d) => existsSync(path.join(d, "scripts", "set-role.js")));
const token = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-auth") || "null")?.accessToken);
const apiCall = async (page, method, p) => {
  const r = await fetch(API + p, { method, headers: { Authorization: `Bearer ${await token(page)}` } });
  return { status: r.status, json: r.status === 204 ? null : await r.json().catch(() => null) };
};
const engine = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1") || "null"));

test("organizador real: crea, publica y usa como asistente un evento propio", async ({ page }) => {
  test.skip(!BACKEND, "Sin knet-backend local para asignar el rol (KNET_BACKEND_DIR)");
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/WebGL|GL Driver|GPU stall/.test(m.text())) problems.push(`console: ${m.text()}`); });

  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  const email = await signUpViaUi(page, { name: "E2E Organizadora" });
  await expect.poll(async () => (await engine(page))?.apiLinked).toBe(true);
  // Sin rol: /api/admin responde 403 y no hay panel
  expect((await apiCall(page, "GET", "/api/admin/events")).status).toBe(403);
  execFileSync(process.execPath, ["scripts/set-role.js", email, "organizer"], { cwd: BACKEND, stdio: "pipe" });

  await page.reload();
  await expect.poll(async () => (await engine(page))?.accountRole).toBe("organizer");
  await goTab(page, "miseventos");
  await dismissOverlays(page, 500);
  await page.locator("#orgTab").click();
  const card = page.locator("#orgCard");
  await card.locator('[data-org="new"]').first().click();

  const f1 = card.locator('[data-org-form="details"]');
  await f1.locator('[name="name"]').fill("E2E Summit Real de Datos");
  await f1.locator('[name="city"]').selectOption("Cali");
  await f1.locator('[name="description"]').fill("Evento de prueba e2e contra el backend real de KNET.");
  await f1.locator('[name="tags"]').fill("Datos, IA");
  await f1.locator('[name="ind"][value="tech"]').check();
  await f1.locator('button[type="submit"]').click();
  await expect(card.locator(".org-step.is-cur")).toContainText("Días y agenda");

  await card.locator('[data-org="dayAdd"]').click();
  await card.locator('[name="day"]').fill("2027-09-15");
  await card.locator('[data-org-form="days"] button[type="submit"]').click();
  await expect(card.locator(".org-step.is-cur")).toContainText("Charlas");

  const fs = card.locator('[data-org-form="session"]');
  await fs.locator('[name="time"]').fill("09:30");
  await fs.locator('[name="title"]').fill("Keynote de apertura real");
  await fs.locator('[name="speaker"]').fill("Ana Pérez");
  await fs.locator('button[type="submit"]').click();
  await expect(card.locator(".org-msg")).toContainText("Charla agregada");

  await card.locator('[data-org="step"][data-v="4"]').first().click();
  const fm = card.locator('[data-org-form="mission"]');
  await fm.locator('[name="title"]').fill("Visita el stand de datos");
  await fm.locator('button[type="submit"]').click();
  await expect(card.locator(".org-msg")).toContainText("Misión agregada");

  await card.locator('[data-org="step"][data-v="5"]').first().click();
  await card.locator('[data-org="venue"][data-v="and"]').click();
  await expect(card.locator('[data-org="venue"][data-v="and"]')).toHaveAttribute("aria-checked", "true");

  await card.locator('[data-org="step"][data-v="6"]').first().click();
  await card.locator('[data-org="publish"]').click();
  await expect(card.locator(".org-msg")).toContainText("¡Publicado!");

  // Publicado en el catálogo del backend, con su agenda y su misión
  const mine = (await apiCall(page, "GET", "/api/admin/events")).json.events;
  const id = mine.find((e) => e.name === "E2E Summit Real de Datos").id;
  const pub = await (await fetch(`${API}/api/events/${id}`)).json();
  expect(pub.event).toMatchObject({ hosted: true, status: "published", days: ["2027-09-15"] });
  expect(pub.event.sessions.map((s) => s.title)).toEqual(["Keynote de apertura real"]);
  expect(pub.event.missions.map((m) => m.title)).toEqual(["Visita el stand de datos"]);
  expect(pub.event.venue).toBeTruthy();

  // Como asistente: inscripción, agenda oficial y check-in con el código del servidor
  await expect.poll(async () => ((await engine(page)).apiEvents || []).find((e) => e.id === id)?.sessions?.length).toBe(1);
  await card.locator('[data-org="explore"]').click();
  await page.locator(`#appPanel [data-act="evsave"][data-v="${id}"]`).first().click();
  await expect.poll(async () => ((await apiCall(page, "GET", "/api/me/registrations")).json?.registrations || []).map((r) => r.eventId)).toContain(id);
  await goTab(page, "agenda");
  await page.locator('#appPanel select[data-evsel="main"]').selectOption(id);
  const agenda = page.locator("#agendaCard");
  await expect(agenda).toContainText("Agenda oficial");
  await agenda.locator(`[data-act="attend"][data-v="${id}:0:0"]`).click();
  await expect.poll(async () => ((await apiCall(page, "GET", `/api/me/checkins?eventId=${id}`)).json?.checkins || []).length).toBe(1);

  expect(problems).toEqual([]);

  // Limpieza: el evento y la cuenta de prueba
  expect((await apiCall(page, "DELETE", `/api/admin/events/${id}`)).status).toBe(204);
  expect((await apiCall(page, "DELETE", "/api/me")).status).toBe(200);
});
