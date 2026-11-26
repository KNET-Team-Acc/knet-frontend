import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState } from "./support/mock-api.js";

/** Espera a que termine el sync inicial (GET /api/me/connections es una de sus lecturas) */
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(n);
const card = (page) => page.locator("#orgCard");
const msg = (page) => card(page).locator(".org-msg");

test("sin rol de organizador no hay panel de creador y «Crear un evento» sigue siendo una propuesta local", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect(page.locator(".me-seg .me-seg-b").first()).toBeVisible();
  await expect(page.locator("#orgTab")).toHaveCount(0);
  await page.goto("/#creador");
  await expect(page.locator("#orgCard")).toHaveCount(0);
  await page.locator('#appPanel [data-ne="new"]:visible').first().click();
  await expect(page.locator("#m-newev")).toBeVisible();
  expect(api.log.some((r) => r.path.startsWith("/api/admin"))).toBe(false);
});

test("organizador: crea un evento completo, lo guarda como borrador, lo publica y los asistentes ven agenda, misiones y recinto", async ({ page }) => {
  const api = await installMockApi(page, { user: { accountRole: "organizer" } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect.poll(async () => (await engineState(page)).accountRole).toBe("organizer");

  await page.locator("#orgTab").click();
  await expect(card(page)).toContainText("Aún no has creado eventos");
  await card(page).locator('[data-org="new"]').first().click();

  // 1 · Detalles (con validaciones en español)
  const f1 = card(page).locator('[data-org-form="details"]');
  await f1.locator('[name="name"]').fill("Su");
  await f1.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Escribe un nombre de al menos 3 caracteres.");
  await f1.locator('[name="name"]').fill("Summit de Datos del Pacífico 2027");
  await f1.locator('[name="city"]').selectOption("Cali");
  await f1.locator('[name="venueName"]').fill("Centro de Eventos Valle del Pacífico");
  await f1.locator('[name="description"]').fill("Dos días de casos reales de datos e IA para equipos de la región.");
  await f1.locator('[name="tags"]').fill("Datos, IA");
  await f1.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Elige al menos una industria.");
  await f1.locator('[name="ind"][value="tech"]').check();
  await f1.locator('[name="sourceUrl"]').fill("javascript:alert(1)");
  await f1.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("El sitio web debe empezar por http:// o https://.");
  await f1.locator('[name="sourceUrl"]').fill("");
  await f1.locator('button[type="submit"]').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Días y agenda");
  const [ev] = [...api.admin.values()];
  expect(ev).toMatchObject({ name: "Summit de Datos del Pacífico 2027", city: "Cali", status: "draft", industries: ["tech"], tags: ["Datos", "IA"], sourceUrl: null });
  expect(ev.info.formato).toEqual(["Presencial"]);

  // 2 · Días y agenda general
  await card(page).locator('[data-org="dayAdd"]').click();
  await card(page).locator('[data-org="dayAdd"]').click();
  const days = card(page).locator('[name="day"]');
  await days.nth(0).fill("2027-05-10");
  await days.nth(1).fill("2027-05-11");
  await card(page).locator('[data-org="agAdd"]').click();
  await card(page).locator('[name="ag0"]').fill("08:00");
  await card(page).locator('[name="ag1"]').fill("Registro");
  await card(page).locator('[data-org-form="days"] button[type="submit"]').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Charlas");
  expect(ev.days).toEqual(["2027-05-10", "2027-05-11"]);
  expect(ev.dateLabel).toBe("10–11 may 2027");
  expect(ev.info.agenda).toEqual([["08:00", "Registro", ""]]);
  expect(ev.info.formato).toEqual(["Presencial", "2 días"]);

  // 3 · Charlas
  const fs = card(page).locator('[data-org-form="session"]');
  await fs.locator('[name="time"]').fill("10:00");
  await fs.locator('[name="kind"]').selectOption("Keynote");
  await fs.locator('[name="title"]').fill("Gobierno de datos en la práctica");
  await fs.locator('[name="room"]').fill("Auditorio");
  await fs.locator('[name="speaker"]').fill("Laura Gómez");
  await fs.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Charla agregada: Gobierno de datos en la práctica");
  await expect(card(page).locator(".org-item-s")).toHaveCount(1);

  // 4 · Speakers
  await card(page).locator('[data-org="step"][data-v="3"]').first().click();
  const fsp = card(page).locator('[data-org-form="speaker"]');
  await fsp.locator('[name="name"]').fill("Laura Gómez");
  await fsp.locator('[name="role"]').fill("CDO");
  await fsp.locator('[name="org"]').fill("Datalab");
  await fsp.locator('[name="avatar"]').selectOption("mujer");
  await fsp.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Speaker agregado: Laura Gómez");
  expect(ev.speakers[0]).toMatchObject({ name: "Laura Gómez", role: "CDO", org: "Datalab" });
  expect(ev.speakers[0].avatar.gender).toBe("mujer");

  // 5 · Misiones
  await card(page).locator('[data-org="step"][data-v="4"]').first().click();
  const fm = card(page).locator('[data-org-form="mission"]');
  await fm.locator('[name="xp"]').fill("9999");
  await fm.locator('[name="title"]').fill("Visita la feria de datos");
  await fm.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("La XP debe estar entre 10 y 500.");
  await fm.locator('[name="xp"]').fill("120");
  await fm.locator('[name="condition"]').fill("Escanea el tótem de la feria");
  await fm.locator('button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Misión agregada: Visita la feria de datos");

  // 6 · Recinto 3D: plantilla de un evento del catálogo
  await card(page).locator('[data-org="step"][data-v="5"]').first().click();
  await card(page).locator('[data-org="venue"][data-v="and"]').click();
  await expect(card(page).locator('[data-org="venue"][data-v="and"]')).toHaveAttribute("aria-checked", "true");
  expect(ev.venue && ev.venue.z.length).toBeGreaterThan(0);

  // 7 · Vista previa y publicar
  await card(page).locator('[data-org="step"][data-v="6"]').first().click();
  await expect(card(page).locator(".org-check li.ok")).toHaveCount(6);
  await card(page).locator('[data-org="publish"]').click();
  await expect(msg(page)).toContainText("¡Publicado!");
  expect(ev.status).toBe("published");

  // El evento aparece en Explorar (hosted: sin URL oficial) y el asistente se inscribe
  await expect.poll(async () => ((await engineState(page)).apiEvents || []).map((e) => e.id)).toContain(ev.id);
  await card(page).locator('[data-org="explore"]').click();
  await expect(page.locator(`#ev-${ev.id}`)).toContainText("Summit de Datos del Pacífico 2027");
  await expect(page.locator(`#ev-${ev.id}`)).toContainText("Publicado en KNET");
  await page.locator(`#appPanel [data-act="evsave"][data-v="${ev.id}"]`).first().click();
  await expect.poll(() => api.registrations.has(ev.id)).toBe(true);

  // Agenda oficial con check-in del código del servidor
  await expect.poll(async () => ((await engineState(page)).apiEvents || []).find((e) => e.id === ev.id)?.sessions?.length).toBe(1);
  await page.evaluate((id) => { const A = JSON.parse(localStorage.getItem("knet-demo-v1")); A.sel = { ...(A.sel || {}), main: { ev: id, day: 0 } }; localStorage.setItem("knet-demo-v1", JSON.stringify(A)); }, ev.id);
  await page.reload();
  await page.goto("/#agenda");
  await expect.poll(() => errors).toEqual([]);
  const agenda = page.locator("#agendaCard");
  await expect(agenda).toContainText("Agenda oficial");
  await expect(agenda).toContainText("Gobierno de datos en la práctica");
  await expect(agenda).toContainText("Con Laura Gómez");
  await agenda.locator(`[data-act="attend"][data-v="${ev.id}:0:0"]`).click();
  await expect.poll(() => api.checkins.has(`${ev.id}:0:0`)).toBe(true);

  // Misión del evento en «Misiones»
  await page.goto("/#quests");
  const evm = page.locator("#eventMissions");
  await expect(evm).toContainText("Visita la feria de datos");
  await expect(evm).toContainText("+120 XP");
  const code = ev.missions[0].code;
  await evm.locator(`[data-act="complete"][data-v="${code}"]`).click();
  await expect.poll(() => api.missions.get(code)).toBeTruthy();
  await expect(evm).toContainText("Completada");
  expect(errors).toEqual([]);
});

test("un 403 de la API se explica con un mensaje claro y el panel desaparece", async ({ page }) => {
  const api = await installMockApi(page, { user: { accountRole: "organizer" } });
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await page.locator("#orgTab").click();
  await expect(card(page)).toBeVisible();
  api.user.accountRole = "attendee"; // el equipo de KNET le retiró el rol
  await card(page).locator('[data-org="new"]').first().click();
  const f1 = card(page).locator('[data-org-form="details"]');
  await f1.locator('[name="name"]').fill("Evento sin permiso");
  await f1.locator('[name="description"]').fill("Descripción suficientemente larga para pasar.");
  await f1.locator('[name="tags"]').fill("Datos");
  await f1.locator('[name="ind"][value="tech"]').check();
  await f1.locator('button[type="submit"]').click();
  await expect(page.locator(".toast").last()).toContainText("Tu cuenta no tiene permisos de organizador");
  await expect(page.locator("#orgTab")).toHaveCount(0);
  await expect(page.locator("#orgCard")).toHaveCount(0);
});

test("textos del panel en inglés", async ({ page }) => {
  const api = await installMockApi(page, { user: { accountRole: "organizer" } });
  await seedSession(page);
  await page.addInitScript(() => localStorage.setItem("knet-lang", "en"));
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect(page.locator("#orgTab")).toHaveText("My created events");
  await page.locator("#orgTab").click();
  await card(page).locator('[data-org="new"]').first().click();
  await card(page).locator('[data-org-form="details"] button[type="submit"]').click();
  await expect(msg(page)).toHaveText("Enter a name of at least 3 characters.");
  await expect(card(page).locator(".org-step").first()).toContainText("Details");
});

test("admin: ve los eventos de todos los organizadores, edita el de otro y el catálogo queda en solo lectura", async ({ page }) => {
  const OTHER = { id: "o000000077", name: "Feria de IA de Medellín", city: "Medellín", description: "Evento de otra organizadora para la prueba del admin.",
    owner: { id: "99999999-0000-4000-8000-000000000077", name: "Laura Organizadora", email: "laura@knet.test" } };
  const api = await installMockApi(page, { user: { accountRole: "admin" }, adminEvents: [OTHER] });
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect.poll(async () => (await engineState(page)).accountRole).toBe("admin");
  await page.locator("#orgTab").click();

  // «Mis eventos»: solo los suyos (ninguno). «Todos los eventos»: el de la otra organizadora y el del catálogo
  await expect(card(page).locator(".org-item")).toHaveCount(0);
  await card(page).locator('[data-org="scope"][data-v="all"]').click();
  await expect(card(page).locator(".pcard-t")).toHaveText("Todos los eventos");
  const other = card(page).locator(`[data-org-ev="${OTHER.id}"]`);
  await expect(other).toContainText("De Laura Organizadora");
  const cat = card(page).locator('[data-org-ev="and"]');
  await expect(cat).toContainText("Catálogo · solo lectura");
  await expect(cat.locator('[data-org="edit"], [data-org="del"]')).toHaveCount(0);
  expect(api.log.some((r) => r.path === "/api/admin/events" && r.method === "GET")).toBe(true);

  // Edita el evento de otra persona: aviso de admin y el cambio se guarda en su evento
  await other.locator('[data-org="edit"]').click();
  await expect(card(page).locator(".org-msg.is-admin")).toContainText("Estás editando como admin un evento de Laura Organizadora");
  const f1 = card(page).locator('[data-org-form="details"]');
  await f1.locator('[name="venueName"]').fill("Plaza Mayor");
  await f1.locator('[name="tags"]').fill("IA");
  await f1.locator('[name="ind"][value="tech"]').check();
  await f1.locator('button[type="submit"]').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Días y agenda");
  expect(api.admin.get(OTHER.id)).toMatchObject({ venueName: "Plaza Mayor", owner: { name: "Laura Organizadora" } });

  // Al volver sigue en «Todos los eventos»
  await card(page).locator('[data-org="back"]').click();
  await expect(card(page).locator('[data-org="scope"][data-v="all"]')).toHaveAttribute("aria-selected", "true");
  await expect(card(page).locator(`[data-org-ev="${OTHER.id}"]`)).toBeVisible();
});

test("un organizador no ve el selector de admin", async ({ page }) => {
  const api = await installMockApi(page, { user: { accountRole: "organizer" } });
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await page.locator("#orgTab").click();
  await expect(card(page)).toBeVisible();
  await expect(card(page).locator('[data-org="scope"]')).toHaveCount(0);
});
