import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState } from "./support/mock-api.js";

/** Espera a que termine el sync inicial (GET /api/me/connections es una de sus lecturas) */
const waitSync = (api, n = 1) => expect.poll(() => api.log.filter((r) => r.path === "/api/me/connections").length).toBeGreaterThanOrEqual(n);

test("migración: el AI & Business Summit (bog) pasa al evento principal y los eventos retirados desaparecen", async ({ page }) => {
  const api = await installMockApi(page, { registrations: ["bog", "x3"] });
  await seedSession(page, { extra: { mv2: false, events: ["bog", "med", "x3"], attended: ["bog:0:1", "med:0:0"], xpSynced: ["checkin:bog:0:1"] } });
  await page.goto("/#agenda");
  await waitSync(api);
  await expect.poll(async () => (await engineState(page)).events).toEqual(["and"]);
  const A = await engineState(page);
  expect(A.mv2).toBe(true);
  expect(A.attended).toEqual(["and:0:1"]);
  expect(A.xpSynced).toContain("checkin:and:0:1");
  await expect(page.locator("#agendaCard")).toContainText("Andina Link Smart Cities Expo 2027");
  await expect(page.locator('[data-act="attend"]').first()).toBeVisible();
});

test("fecha por confirmar: se puede inscribir y la agenda queda en estado vacío, sin check-in", async ({ page }) => {
  const api = await installMockApi(page, { registrations: ["and", "ais"] });
  await seedSession(page, { extra: { events: ["and", "ais"], sel: { main: { ev: "ais", day: 0 } } } });
  await page.goto("/#agenda");
  await waitSync(api);
  await expect(page.locator("#agendaCard")).toContainText("Fecha por confirmar");
  await expect(page.locator("#agendaCard")).toContainText("AI Summit Colombia 2027");
  await expect(page.locator('[data-act="attend"]')).toHaveCount(0);

  // Pasar a un evento con agenda desde la misma tarjeta
  await page.locator('#agendaCard [data-act="evactive"]').click();
  await expect.poll(async () => (await engineState(page)).sel.main.ev).toBe("and");
  await expect(page.locator('[data-act="attend"]').first()).toBeVisible();
});

test("catálogo real: sin eventos exclusivos por nivel y todos se pueden inscribir", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page, { xp: 0, xpLocal: 0 });
  await page.goto("/#eventos");
  await waitSync(api);
  await expect(page.locator("#exclusiveCard")).toHaveCount(0);
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem("knet-demo-v1")).events);
  expect(ids).toEqual(["and"]);
});

/* Evento real que solo publica el backend (no está en src/data/events.js) */
const NEW_EV = { id: "nev", kind: "real", name: "Expo Datos Medellín 2027", city: "Medellín", venueName: "Plaza Mayor · Medellín", dateLabel: "10–11 jun 2027",
  days: ["2027-06-10", "2027-06-11"], lat: 6.25, lon: -75.57, tags: ["Datos", "Cloud"], industries: ["tech", "consultoria"], minLevel: 1,
  organizer: "Organizador de prueba", sourceUrl: "https://example.org/expo-datos", description: "Feria de datos y nube de prueba." };
const NEW_INFO = { tone: ["#0E2E4A", "#3B1A6E"], accent: "#7DD3FC", lema: "Lema de la ficha del backend.", para: "Equipos de datos.", formato: ["Presencial", "2 días", "Feria"],
  agenda: [["Feria", "Exposición", "Stands de datos"]], llevas: ["Contactos del sector"] };

/** Abre «Mis eventos › Explorar» (el catálogo con el mapa) */
const openExplore = async (page) => { await page.locator('#appPanel [data-meview="explore"]').click(); };

test("API: un evento real nuevo del backend se integra, se puede inscribir y sigue al recargar", async ({ page }) => {
  const opts = {
    events: [NEW_EV,
      { ...NEW_EV, id: "fic", kind: "demo", sourceUrl: null, name: "Evento ficticio" },
      { ...NEW_EV, id: "bad", sourceUrl: "javascript:alert(1)", name: "Evento con enlace inválido" },
      { ...NEW_EV, id: "xss", name: 'Expo <img src=x id=pwn onerror="window.__pwn=1">', description: '<script>window.__pwn=1</script>Texto', venueName: 'Sala "A"' }],
    eventDetails: { nev: { ...NEW_EV, info: NEW_INFO, venue: null, speakers: [] } },
  };
  const api = await installMockApi(page, opts);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  // Se integran los reales con fuente oficial http(s) (nev con la ficha del detalle); el demo y el de enlace inválido, no
  await expect.poll(async () => ((await engineState(page)).apiEvents || []).map((e) => e.id)).toEqual(["nev", "xss"]);
  await expect.poll(async () => (await engineState(page)).apiEvents[0].info?.lema).toBe(NEW_INFO.lema);
  await openExplore(page);
  const save = page.locator('#appPanel [data-act="evsave"][data-v="nev"]').first();
  await expect(save).toBeVisible();
  await expect(page.locator("#ev-nev")).toContainText("Expo Datos Medellín 2027");
  await expect(page.locator('#appPanel [data-v="fic"], #appPanel [data-v="bad"]')).toHaveCount(0);
  // Los textos del backend no se interpretan como HTML
  await expect(page.locator("#ev-xss")).toBeVisible();
  await expect(page.locator("#pwn")).toHaveCount(0);
  expect(await page.evaluate(() => window.__pwn)).toBeUndefined();

  await save.click();
  await expect.poll(async () => (await engineState(page)).events).toContain("nev");
  await expect.poll(() => api.registrations.has("nev")).toBe(true);

  // Al recargar sigue disponible (caché local) y su agenda se genera con sus días, sin 404 ni errores
  await page.reload();
  await waitSync(api, 2);
  expect((await engineState(page)).events).toContain("nev");
  await page.evaluate(() => { location.hash = "#agenda"; });
  await page.locator('#appPanel select[data-evsel="main"]').selectOption("nev");
  await expect(page.locator("#agendaCard")).toContainText("Expo Datos Medellín 2027");
  await expect(page.locator('#agendaCard [data-act="attend"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("API: un evento nuevo que el backend deja de publicar se retira sin romper la app", async ({ page }) => {
  const opts = { events: [NEW_EV], eventDetails: {}, registrations: ["and", "nev"] };
  const api = await installMockApi(page, opts);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seedSession(page, { extra: { events: ["and", "nev"] } });
  await page.goto("/#miseventos");
  await waitSync(api);
  await expect.poll(async () => (await engineState(page)).events).toEqual(["and", "nev"]);

  // El mock lee opts en cada petición: ahora solo publica «and»
  opts.events = [{ id: "and", kind: "real", name: "Andina Link Smart Cities Expo 2027", sourceUrl: "https://www.luminik.io/events/andina-link-cartagena/" }];
  api.registrations.delete("nev");
  await page.reload();
  await waitSync(api, 2);
  await expect.poll(async () => ((await engineState(page)).apiEvents || []).map((e) => e.id)).toEqual([]);
  await expect.poll(async () => (await engineState(page)).events).toEqual(["and"]);
  await expect(page.locator("#appPanel")).not.toContainText("Expo Datos Medellín 2027");
  expect(errors).toEqual([]);
});

test("avisos: la Agenda IA es una recomendación orientativa y el recinto 3D es ilustrativo", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#agenda");
  await waitSync(api);
  const note = page.locator("#appPanel [data-ai-note]");
  await expect(note).toContainText("Recomendación orientativa");
  await expect(note).toContainText("no son la agenda oficial");
  await expect(note.locator("a.ev-src")).toHaveAttribute("href", /^https:\/\//);
  await page.evaluate(() => { location.hash = "#recinto"; });
  await expect(page.locator("[data-venue-note]")).toContainText("Plano ilustrativo");
});

test("experiencias presenciales: estado vacío mientras el organizador no publique ninguna", async ({ page }) => {
  const api = await installMockApi(page);
  await seedSession(page);
  await page.goto("/#miseventos");
  await waitSync(api);
  const card = page.locator("#actCard");
  await expect(card).toContainText("aún no ha publicado actividades presenciales");
  await expect(card).not.toContainText("Taller de arte digital");
  await expect(card).not.toContainText("Clase de cocina colombiana");
});
