import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, peerConnection } from "./support/mock-api.js";

const PEER = "Diego R.";
const seedPeer = { extra: { connections: [PEER], xpSynced: [`conn:${PEER}`] } };
const invitedBy = (id, connectionId) => ({ id, connectionId, role: "invitee", with: { name: PEER, userId: "99999999-0000-4000-8000-000000000007" },
  slot: "Hoy · 15:00", place: "Lounge B", status: "proposed", createdAt: new Date().toISOString() });

test("Invitaciones: acceso en 1 clic desde cualquier pestaña, con contador de pendientes, y se responde ahí mismo", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  api.coffees.push(invitedBy(1, 7));
  await seedSession(page, seedPeer);
  await page.goto("/#quests");

  const btn = page.locator("#invBtn");
  await expect(btn.locator(".side-inv-n")).toHaveText("1");
  await expect(btn).toHaveAttribute("aria-label", "Abrir Invitaciones · 1 pendiente");
  await expect(page.locator('#appTabs [data-tab="miseventos"] .app-tab-dot')).toHaveText("1");

  await btn.click();
  await expect(page).toHaveURL(/#miseventos$/);
  await expect(page.locator('#appTabs [data-tab="miseventos"]')).toHaveAttribute("aria-current", "page");
  const card = page.locator("#invitesCard");
  await expect(card).toBeVisible();
  await expect(card).toBeFocused();
  await expect(card).toContainText(PEER);

  await card.locator(`[data-inv="yes"][data-n="${PEER}"]`).click();
  await expect.poll(async () => (await engineState(page)).coffees[PEER]?.status).toBe("accepted");
  await expect(btn.locator(".side-inv-n")).toHaveCount(0);
  await expect(btn).toContainText("Sin pendientes");
  await expect(card).toContainText("No tienes invitaciones pendientes.");
});

test("Invitaciones en inglés y con teclado", async ({ page }) => {
  const api = await installMockApi(page, { connections: [peerConnection(7, PEER)] });
  api.coffees.push(invitedBy(1, 7));
  await seedSession(page, seedPeer);
  await page.goto("/#perfil");
  await page.click("#langBtn");
  await page.click('#langMenu [data-lang="en"]');

  const btn = page.locator("#invBtn");
  await expect(btn).toHaveAttribute("aria-label", "Open Invitations · 1 pending");
  await expect(btn).toContainText("Invitations");
  await btn.focus();
  await page.keyboard.press("Enter");
  const card = page.locator("#invitesCard");
  await expect(card).toBeFocused();
  await expect(card.locator("#invTitle")).toHaveText("Invitations");
  await expect(card).toContainText("Awaiting your reply");
  await expect(card.locator('[data-inv="no"]')).toHaveText("Decline");
});
