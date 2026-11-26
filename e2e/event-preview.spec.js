import { test, expect } from "@playwright/test";
import { installMockApi } from "./support/mock-api.js";

/** Espera a que la vista previa termine de armarse (chip del registro en «Listo»/«Ready») */
const ready = (page, txt = "Listo") => expect(page.locator("#agentState")).toHaveText(txt);
const pickIndustry = async (page, ind, txt = "Listo") => { await page.locator(`#indGrid [data-ind="${ind}"]`).click(); await ready(page, txt); };

/** Textos de la versión anterior del simulador (charlas, salas y cargos inventados) que no deben volver */
const INVENTED = ["Sala Quantum", "Sala Nexus", "Sala Orbit", "Auditorio Principal", "Lab 1", "Lab 3", "Engineering Manager", "Head de Riesgo Digital", "148 sesiones", "Agentes autónomos en producción"];

test("vista previa de tu evento: sugiere eventos reales del catálogo según la industria, sin datos inventados", async ({ page }) => {
  await installMockApi(page);
  await page.goto("/");
  const demo = page.locator("#demo"), app = page.locator("#app");
  await expect(demo.locator(".eyebrow")).toHaveText("Vista previa de tu evento");
  await ready(page);

  // Tecnología (por defecto): empate de afinidad entre AI Summit y Edutechnia → gana el que tiene días confirmados
  await expect(page.locator("#evName")).toHaveText("Edutechnia 2027");
  await expect(page.locator("#evSub")).toContainText("Bogotá");
  await expect(page.locator("#evSrc")).toHaveAttribute("href", "https://www.edutechnia.com/");
  await expect(page.locator("#view-evento")).toContainText("Corferias · Bogotá");
  await expect(page.locator("#view-evento [data-sim-aff]")).toHaveText("78%");
  await expect(page.locator("#evOthers [data-sim-other]")).toHaveCount(3);

  await pickIndustry(page, "energia");
  await expect(page.locator("#evName")).toHaveText("Andina Link Smart Cities Expo 2027");
  await expect(page.locator("#view-evento [data-sim-aff]")).toHaveText("92%");

  await pickIndustry(page, "banca");
  await expect(page.locator("#evName")).toHaveText("AI Summit Colombia 2027");
  await expect(page.locator("#evSub")).toContainText("fecha por confirmar");

  // Formato: bloques publicados en la ficha del evento + aviso de que la agenda la publica el organizador
  await page.click("#t-formato");
  await expect(page.locator("#view-formato")).toBeVisible();
  await expect(page.locator("#view-formato")).toContainText("Por confirmar");
  await expect(page.locator("#view-formato [data-sim-note]")).toContainText("KNET no los inventa");

  // Concierge: responde con datos del catálogo
  await page.click("#t-concierge");
  await page.locator('#view-concierge [data-sq="0"]').click();
  await expect(page.locator("#simChat .bubble.ai").last()).toContainText("Sede por confirmar · Bogotá");
  await page.locator('#view-concierge [data-sq="2"]').click();
  await expect(page.locator("#simChat .bubble.ai").last()).toContainText("ANDICOM 2027");

  // Misiones de ejemplo: suman XP
  await page.click("#t-misiones");
  await page.locator("#view-misiones button[data-xp]").first().click();
  await expect(page.locator("#xpLabel")).toHaveText("100 XP");
  await expect(page.locator("#view-misiones .mission.done")).toHaveCount(1);

  for (const txt of INVENTED) await expect(app).not.toContainText(txt);
  await expect(page.locator("#console")).not.toContainText("148 sesiones");
});

test("vista previa de tu evento: textos en inglés con clave al cambiar de idioma", async ({ page }) => {
  await installMockApi(page);
  await page.addInitScript(() => localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false })));
  await page.goto("/");
  await ready(page);

  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="en"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await ready(page, "Ready");
  await expect(page.locator("#demo .eyebrow")).toHaveText("Your event preview");
  await expect(page.locator("#genBtn")).toContainText("See my event preview");
  await expect(page.locator("#t-evento")).toHaveText("The event");
  await expect(page.locator("#console")).toContainText("Preview ready in");
  await expect(page.locator("#evName")).toHaveText("Edutechnia 2027");
  await page.click("#t-concierge");
  await expect(page.locator('#view-concierge [data-sq="0"]')).toHaveText("When and where is it?");
  await page.click("#t-formato");
  await expect(page.locator("#view-formato [data-sim-note]")).toContainText("KNET doesn’t make them up");

  await pickIndustry(page, "energia", "Ready");
  await expect(page.locator("#evName")).toHaveText("Andina Link Smart Cities Expo 2027");

  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="es"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await ready(page);
  await expect(page.locator("#demo .eyebrow")).toHaveText("Vista previa de tu evento");
  await expect(page.locator("#t-evento")).toHaveText("El evento");
});
