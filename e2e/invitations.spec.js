import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, peerConnection, peerKey } from "./support/mock-api.js";

const PEER = "Diego R.";
const seedPeer = { extra: { connections: [PEER], xpSynced: [`conn:${PEER}`] } };
const invitedBy = (id, connectionId) => ({ id, connectionId, role: "invitee", with: { name: PEER, userId: "99999999-0000-4000-8000-000000000007" },
  slot: "Hoy · 15:00", place: "Lounge B", status: "proposed", createdAt: new Date().toISOString() });

test("Invitaciones: pestaña dentro de Mis eventos, con contador de pendientes, y se responde ahí mismo", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  api.coffees.push(invitedBy(1, 7));
  await seedSession(page, seedPeer);
  await page.goto("/#quests");

  // Ya no hay acceso en el menú lateral; el contador sigue en la pestaña «Mis eventos»
  await expect(page.locator("#invBtn")).toHaveCount(0);
  const meTab = page.locator('#appTabs [data-tab="miseventos"]');
  await expect(meTab.locator(".app-tab-dot")).toHaveText("1");
  await meTab.click();
  await expect(page).toHaveURL(/#miseventos$/);

  const seg = page.locator(".me-seg");
  await expect(seg.locator(".me-seg-b")).toHaveText(["Mis inscripciones y meetups", "Recinto", "Explorar próximos eventos", /^Invitaciones/]);
  const tab = page.locator("#invTab");
  await expect(tab.locator(".me-seg-n")).toHaveText("1");
  await expect(tab).toHaveAttribute("aria-label", "Invitaciones · 1 pendiente");
  await expect(tab).toHaveAttribute("aria-selected", "false");
  await expect(page.locator("#invitesCard")).toHaveCount(0);

  await tab.click();
  await expect(page.locator("#invTab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-meview="mine"]')).toHaveAttribute("aria-selected", "false");
  const card = page.locator("#invitesCard");
  await expect(card).toBeVisible();
  await expect(card).toContainText(PEER);

  const PK = peerKey(peerConnection(7, PEER)); // u:<userId> (knet-frontend#33)
  await card.locator(`[data-inv="yes"][data-n="${PK}"]`).click();
  await expect.poll(async () => (await engineState(page)).coffees[PK]?.status).toBe("accepted");
  await expect(page.locator("#invTab .me-seg-n")).toHaveCount(0);
  await expect(page.locator("#invTab")).toHaveAttribute("aria-label", "Invitaciones · Sin pendientes");
  await expect(meTab.locator(".app-tab-dot")).toHaveCount(0);
  await expect(card).toContainText("No tienes invitaciones pendientes.");
});

test("Invitaciones en inglés y con teclado", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  api.coffees.push(invitedBy(1, 7));
  await seedSession(page, seedPeer);
  await page.goto("/#miseventos");
  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="en"]');

  const tab = page.locator("#invTab");
  await expect(tab).toHaveAttribute("aria-label", "Invitations · 1 pending");
  await expect(tab).toContainText("Invitations");
  await tab.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#invTab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#invTab")).toBeFocused();
  const card = page.locator("#invitesCard");
  await expect(card.locator("#invTitle")).toHaveText("Invitations");
  await expect(card).toContainText("Awaiting your reply");
  await expect(card.locator('[data-inv="no"]')).toHaveText("Decline");
});
