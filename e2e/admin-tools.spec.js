import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState } from "./support/mock-api.js";

/** Herramientas del panel de eventos: eventos reales del catálogo (admin), generador de recintos y asistente de IA */
const waitSync = (api) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(1);
const card = (page) => page.locator("#orgCard");
const ai = (page) => page.locator("#orgAi");
const DRAFT = { id: "o000000501", name: "Foro de Datos del Caribe", city: "Barranquilla", description: "Foro de prueba para el generador y el asistente.",
  tags: ["Datos"], industries: ["tech"], days: ["2027-09-14", "2027-09-15"],
  info: { tone: ["#1E1452", "#0E3A4A"], accent: "#BE82FF", lema: "Foro", para: "", formato: ["Presencial", "2 días"], agenda: [], llevas: [] } };

async function openPanel(page, opts) {
  const api = await installMockApi(page, opts);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect.poll(async () => (await engineState(page)).accountRole).toBe(opts.user.accountRole);
  await page.locator("#orgTab").click();
  await expect(card(page)).toBeVisible();
  return { api, errors };
}
async function editDraft(page, step) {
  await card(page).locator(`[data-org-ev="${DRAFT.id}"] [data-org="edit"]`).click();
  await card(page).locator(`.org-step:has-text("${step}")`).click();
}

test("admin: añade un evento real al catálogo con su web oficial, sin charlas ni misiones", async ({ page }) => {
  const { api, errors } = await openPanel(page, { user: { accountRole: "admin" } });
  await card(page).locator('[data-org="newCat"]').click();
  await expect(card(page).locator(".pcard-k").first()).toHaveText("Nuevo evento del catálogo");
  await expect(card(page).locator(".org-step")).toHaveText([/Detalles/, /Días y agenda/, /Speakers/, /Recinto 3D/, /Vista previa/]);

  const f = card(page).locator('[data-org-form="details"]');
  await f.locator('[name="name"]').fill("Colombia 4.0 Bogotá");
  await f.locator('[name="description"]').fill("Encuentro real de la industria digital, añadido al catálogo por el admin.");
  await f.locator('[name="tags"]').fill("IA, Industria digital");
  await f.locator('[name="ind"][value="tech"]').check();
  await f.locator('button[type="submit"]').click();
  await expect(card(page).locator(".org-msg.is-err")).toContainText("web oficial");
  await f.locator('[name="sourceUrl"]').fill("https://example.com/colombia40");
  await f.locator('button[type="submit"]').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Días y agenda");
  const [ev] = [...api.admin.values()];
  expect(ev).toMatchObject({ curated: true, sourceUrl: "https://example.com/colombia40" });

  await card(page).locator('[data-org="dayAdd"]').click();
  await card(page).locator('[data-org-form="days"] button[type="submit"]').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Speakers");
  await card(page).locator('.org-step:has-text("Vista previa")').click();
  await expect(card(page).locator(".org-check")).not.toContainText("charla");
  await card(page).locator('[data-org="publish"]').click();
  await expect(card(page).locator(".org-msg.is-ok")).toBeVisible();
  expect(api.admin.get(ev.id).status).toBe("published");

  // En la lista sale con la marca de catálogo
  await card(page).locator('[data-org="back"]').click();
  await expect(card(page).locator(`[data-org-ev="${ev.id}"]`)).toContainText("Catálogo");
  // Y sale en el catálogo publicado como evento real (con su web oficial), no como uno creado en KNET
  await page.locator('[data-meview="explore"]').click();
  await expect(page.locator("#appPanel")).toContainText("Colombia 4.0 Bogotá");
  expect(errors).toEqual([]);
});

test("un organizador no ve «Añadir evento real al catálogo»", async ({ page }) => {
  await openPanel(page, { user: { accountRole: "organizer" } });
  await expect(card(page).locator('[data-org="newCat"]')).toHaveCount(0);
});

test("generador de recintos: zonas a mano y desde una descripción (sin IA, respaldo local)", async ({ page }) => {
  const { api, errors } = await openPanel(page, { user: { accountRole: "organizer" }, adminEvents: [DRAFT] });
  await editDraft(page, "Recinto 3D");
  const gen = card(page).locator('[data-org-form="vgen"]');
  await expect(gen.locator(".org-row-z")).toHaveCount(3);

  // Descripción → zonas con el traductor local (la IA no está en las pruebas)
  await card(page).locator('[data-org-form="vbrief"] [name="brief"]').fill("Auditorio grande, feria de stands, 2 salas de talleres y zona de café");
  await card(page).locator('[data-org-form="vbrief"] button[type="submit"]').click();
  await expect(card(page).locator(".org-msg.is-ok")).toContainText("La IA no está disponible");
  await expect(gen.locator(".org-row-z")).toHaveCount(5);

  // Ajuste a mano: quitar una zona, renombrar otra y generar
  await gen.locator('[data-org="vzDel"]').last().click();
  await expect(gen.locator(".org-row-z")).toHaveCount(4);
  await gen.locator('[name="vzName"]').first().fill("Gran Salón Caribe");
  await gen.locator('[name="vground"]').selectOption("wood");
  await gen.locator('button[type="submit"]').click();
  await expect(card(page).locator(".org-msg.is-ok")).toContainText("Recinto guardado con 4 zonas");
  const v = api.admin.get(DRAFT.id).venue;
  expect(v.z.map((z) => z[0])[0]).toBe("Gran Salón Caribe");
  expect(v).toMatchObject({ ground: "wood", ent: "E" });
  expect(v.z.every((z) => v.nodes[z[6]])).toBe(true);
  await expect(card(page).locator(".org-vplan")).toBeVisible();
  await expect(card(page).locator(".org-vprev")).toContainText("Recinto generado");
  expect(errors).toEqual([]);
});

test("asistente de IA: propone y cada propuesta se aplica a mano", async ({ page }) => {
  const seen = [];
  const { api, errors } = await openPanel(page, {
    user: { accountRole: "organizer" }, adminEvents: [DRAFT],
    assist: (b) => {
      seen.push(b);
      return b.focus === "venue"
        ? { reply: "Zonas propuestas.", proposals: { details: null, agenda: [], sessions: [], speakers: [], missions: [], venue: { zones: [{ type: "stage", name: "Plenaria", size: "l", description: "" }, { type: "lounge", name: "Networking", size: "m", description: "" }] } } }
        : { reply: "Te propongo dos misiones y una charla.", proposals: { details: null, agenda: [["08:00", "Registro", ""]], venue: null, speakers: [],
          sessions: [{ day: 0, time: "09:00", kind: "Keynote", title: "Apertura del foro", room: "Plenaria", speaker: "" }],
          missions: [{ type: "networking", title: "Conecta con 3 personas de datos", condition: "", xp: 100 }, { type: "contenido", title: "Comparte un aprendizaje", condition: "", xp: 50 }] } };
    },
  });
  // Sin evento abierto: sugerencias para empezar
  await expect(ai(page).locator('[data-org="aiSug"]')).toHaveCount(3);

  await editDraft(page, "Misiones");
  await ai(page).locator('[name="q"]').fill("Sugiere misiones y una charla de apertura");
  await ai(page).locator('button[type="submit"]').click();
  await expect(ai(page).locator(".org-ai-m").last()).toContainText("Te propongo dos misiones");
  expect(seen.at(-1)).toMatchObject({ eventId: DRAFT.id, message: "Sugiere misiones y una charla de apertura", lang: "es" });

  // Añadir todas las misiones → se guardan con el endpoint de siempre
  await ai(page).locator('.org-ai-p:has-text("Misiones") button:has-text("Añadir todas")').click();
  await expect(card(page).locator(".org-msg.is-ok")).toContainText("Añadí 2 elementos");
  expect(api.admin.get(DRAFT.id).missions.map((m) => m.title)).toEqual(["Conecta con 3 personas de datos", "Comparte un aprendizaje"]);
  await expect(ai(page).locator('.org-ai-p:has-text("Misiones") button:has-text("Añadir todas")')).toHaveCount(0);

  // Una charla
  await ai(page).locator('.org-ai-p:has-text("Charlas") button:has-text("Añadir")').first().click();
  await expect.poll(() => api.admin.get(DRAFT.id).sessions.length).toBe(1);

  // La agenda se lleva al formulario para revisarla (no se guarda sola)
  await ai(page).locator('button:has-text("Usar en la agenda")').click();
  await expect(card(page).locator(".org-step.is-cur")).toContainText("Días y agenda");
  await expect(card(page).locator('[name="ag1"]').first()).toHaveValue("Registro");
  expect(api.admin.get(DRAFT.id).info.agenda).toEqual([]);

  // «Proponer zonas» en el recinto usa la IA (focus: venue)
  await card(page).locator('.org-step:has-text("Recinto 3D")').click();
  await card(page).locator('[data-org-form="vbrief"] [name="brief"]').fill("Plenaria grande y una zona de networking");
  await card(page).locator('[data-org-form="vbrief"] button[type="submit"]').click();
  await expect(card(page).locator(".org-msg.is-ok")).toContainText("La IA propuso 2 zonas");
  await expect(card(page).locator('[name="vzName"]')).toHaveCount(2);
  await expect(card(page).locator('[name="vzName"]').nth(0)).toHaveValue("Plenaria");
  await expect(card(page).locator('[name="vzName"]').nth(1)).toHaveValue("Networking");
  expect(errors).toEqual([]);
});

test("asistente de IA sin IA disponible: avisa y el panel sigue funcionando", async ({ page }) => {
  await openPanel(page, { user: { accountRole: "organizer" } });
  await ai(page).locator('[data-org="aiSug"]').first().click();
  await expect(ai(page).locator(".org-ai-m.is-err")).toContainText("La IA no está disponible ahora");
  await expect(card(page).locator('[data-org="new"]').first()).toBeEnabled();
});
