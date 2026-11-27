/**
 * Grafo de la red (knet-frontend#41): colores por rol «Soy», leyenda accesible, 2.º grado con o sin el permiso
 * «network» y aristas entre contactos. El canvas no se puede inspeccionar: las pruebas leen window.__knetGraph,
 * la instantánea que publica startGraph() (nodos con rol/color/grado/via y aristas con tipo/resaltado).
 */
import { test, expect } from "@playwright/test";
import { installMockApi, seedSession, engineState, peerConnection } from "./support/mock-api.js";

const uid = (n) => `99999999-0000-4000-8000-${String(n).padStart(12, "0")}`;
const BRUNO = uid(7), DARIO = uid(8), CELIA = uid(21), EVA = uid(22);
const ME = "11111111-2222-4333-8444-555555555555";
const node = (id, name, degree, graphRole, via = [], headline = "Head de Datos · Acme") => ({ id, kind: "user", name, headline, industry: "tech", graphRole, degree, via });
// Tú–Bruno–Celia (2.º vía Bruno), Tú–Dario, Bruno–Dario (1.º–1.º), Dario–Eva (2.º vía Dario), Celia–Eva (2.º–2.º)
const NETWORK = {
  nodes: [node(BRUNO, "Bruno B.", 1, "expert"), node(DARIO, "Dario D.", 1, "partner"), node(CELIA, "Celia C.", 2, "client", [BRUNO], "CIO · Retail"), node(EVA, "Eva E.", 2, "speaker", [DARIO])],
  edges: [[ME, BRUNO], [ME, DARIO], [BRUNO, DARIO], [BRUNO, CELIA], [DARIO, EVA], [CELIA, EVA]].map(([a, b]) => ({ a, b })),
};
const CONNS = () => [peerConnection(7, "Bruno B.", BRUNO), peerConnection(8, "Dario D.", DARIO)];
const graph = (page) => page.evaluate(() => {
  const g = window.__knetGraph; // sin funciones: se serializa
  return g ? { me: g.me, nodes: g.nodes, edges: g.edges, second: g.second } : null;
});
const nodeOf = async (page, label) => (await graph(page))?.nodes.find((n) => n.label === label);
const hasEdge = (g, a, b) => g.edges.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));

async function openGraph(page, api) {
  await page.goto("/#red");
  await expect(page.locator("#netGraph")).toBeVisible();
  // El sync trae a Bruno y Dario como conexiones reales y la red se pide a GET /api/me/network
  await expect.poll(() => api.networkCalls, { timeout: 15000 }).toBeGreaterThan(0);
  await expect.poll(async () => (await nodeOf(page, "Bruno B."))?.type, { timeout: 15000 }).toBe("conn");
}

test("rol «Soy»: cambiarlo guarda graphRole en PATCH /api/me, el nodo central toma su color y las aristas se resaltan según G_SUGGEST", async ({ page }) => {
  const api = await installMockApi(page, { network: NETWORK, connections: CONNS() });
  await seedSession(page);
  await openGraph(page, api);
  const g0 = await graph(page);
  expect(g0.me.role).toBe("experto"); // por defecto según la industria (tech)
  expect(g0.me.shape).toBe("diamond");
  // El rol de cada nodo sale de graphRole de la API, con su color G_ROLE[rol][3]
  expect(g0.nodes.find((n) => n.label === "Bruno B.")).toMatchObject({ role: "experto", rgb: "96,165,250", shape: "diamond" });
  expect(g0.nodes.find((n) => n.label === "Dario D.")).toMatchObject({ role: "partner", rgb: "163,230,53", shape: "square" });

  await page.locator('[data-grme="partner"]').click();
  await expect.poll(() => api.profilePatches).toContainEqual({ graphRole: "partner" });
  expect(api.user.graphRole).toBe("partner");
  await expect.poll(async () => (await engineState(page)).graphRole).toBe("partner");
  await expect(page.locator('[data-grme="partner"]')).toHaveAttribute("aria-checked", "true");
  // Transición suave: el color mostrado llega al del rol partner
  await expect.poll(async () => (await graph(page)).me.target).toBe("163,230,53");
  await expect.poll(async () => (await graph(page)).me.rgb).toBe("163,230,53");
  // Partner → conviene ver clientes y expertos: solo esas aristas quedan resaltadas; cada una lleva el color de su destino
  await page.locator("[data-grall]").click(); // «Todos»: se ven los cuatro roles
  const g1 = await graph(page);
  expect(g1.edges.length).toBeGreaterThan(0);
  for (const e of g1.edges) expect(e.highlighted, `${e.a}–${e.b}`).toBe(["cliente", "experto"].includes(e.role));
  const meL = g1.nodes[0].label;
  expect(hasEdge(g1, meL, "Bruno B.")).toMatchObject({ role: "experto", rgb: "96,165,250", highlighted: true });
  expect(hasEdge(g1, meL, "Dario D.")).toMatchObject({ role: "partner", highlighted: false });
  // La leyenda marca los roles sugeridos para el rol nuevo
  await expect(page.locator('#graphLegend li.is-sug')).toHaveCount(2);
  await expect(page.locator('#graphLegend li[data-legrole="cliente"]')).toHaveClass(/is-sug/);
});

test("rol «Soy» del servidor: graphRole de /api/me se aplica al abrir", async ({ page }) => {
  const api = await installMockApi(page, { network: NETWORK, connections: CONNS(), user: { graphRole: "speaker" } });
  await seedSession(page);
  await openGraph(page, api);
  await expect.poll(async () => (await graph(page)).me.role, { timeout: 15000 }).toBe("speaker");
  await expect(page.locator('[data-grme="speaker"]')).toHaveAttribute("aria-checked", "true");
  expect((await graph(page)).me.shape).toBe("triangle");
});

test("leyenda: los 4 roles con color, forma distinta y texto, visible en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const api = await installMockApi(page, { network: NETWORK, connections: CONNS() });
  await seedSession(page);
  await openGraph(page, api);
  const legend = page.locator("#graphLegend");
  await legend.scrollIntoViewIfNeeded();
  await expect(legend).toBeVisible();
  await expect(legend).toHaveAttribute("role", "group");
  await expect(legend).toHaveAttribute("aria-label", /rol/);
  const items = legend.locator(".gr-leg-roles li");
  await expect(items).toHaveCount(4);
  const shapes = await items.evaluateAll((els) => els.map((li) => li.dataset.shape));
  expect(new Set(shapes).size).toBe(4); // no depende solo del color
  for (const li of await items.all()) {
    await expect(li.locator("svg.gr-shape")).toBeVisible();
    expect((await li.innerText()).trim().length).toBeGreaterThan(3);
  }
  // Cabe en el ancho del móvil (sin desbordar la tarjeta)
  const box = await legend.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(390);
});

test("2.º grado con «network»: anillo exterior, «Te conecta», aristas cruzadas, pedir presentación y conectar", async ({ page }) => {
  const api = await installMockApi(page, { network: NETWORK, connections: CONNS(), attendees: [{ userId: CELIA, name: "Celia C.", initials: "CC", headline: "CIO · Retail", industry: "tech", interests: [] }] });
  await seedSession(page, { extra: { graphSee: ["cliente", "experto", "speaker", "partner"] } });
  await openGraph(page, api);
  const sw = page.locator("#grSecond");
  await expect(sw).toBeEnabled();
  await expect(sw).toHaveAttribute("aria-checked", "false");
  expect((await graph(page)).nodes.some((n) => n.degree === 2)).toBe(false);

  await sw.click();
  await expect(page.locator("#grSecond")).toHaveAttribute("aria-checked", "true");
  await expect.poll(async () => (await nodeOf(page, "Celia C."))?.degree).toBe(2);
  const g = await graph(page);
  const celia = g.nodes.find((n) => n.label === "Celia C."), bruno = g.nodes.find((n) => n.label === "Bruno B.");
  expect(celia).toMatchObject({ type: "second", via: ["Bruno B."], role: "cliente" });
  expect(celia.r).toBeLessThan(bruno.r); // más pequeños en el anillo exterior
  expect(g.nodes.length).toBeLessThanOrEqual(60);
  expect(hasEdge(g, "Bruno B.", "Celia C.")).toMatchObject({ kind: "second", dashed: true });
  expect(hasEdge(g, "Bruno B.", "Dario D.")).toMatchObject({ kind: "cross", dashed: false }); // 1.º–1.º
  expect(hasEdge(g, "Celia C.", "Eva E.")).toMatchObject({ kind: "cross" });                   // 2.º–2.º
  await expect(page.locator("#graphStats")).toContainText("2 de 2.º grado");

  // Clic / tooltip en un nodo de 2.º grado
  expect(await page.evaluate(() => window.__knetGraph.select("Celia C."))).toBe(true);
  await expect(page.locator("#graphInfo")).toContainText("Te conecta Bruno B.");
  await expect(page.locator("#graphTip")).toContainText("Te conecta Bruno B.");

  // «Pedir presentación»: abre el chat con Bruno con el mensaje listo; al enviarlo llega a su hilo (conexión 7)
  await page.locator("#graphInfo [data-grask]").click();
  await expect(page.locator("#m-dm")).toBeVisible();
  await expect(page.locator("#dmIn")).toHaveValue(/Celia C\./);
  await page.locator("#dmIn").press("Enter");
  await expect.poll(() => api.messages.length).toBe(1);
  expect(api.messages[0]).toMatchObject({ connectionId: 7 });
  expect(api.messages[0].body).toContain("Celia C.");
  await page.keyboard.press("Escape");
  await expect(page.locator("#m-dm")).toBeHidden();

  // «Conectar»: solicitud por peerUserId (la responde Celia)
  expect(await page.evaluate(() => window.__knetGraph.select("Celia C."))).toBe(true);
  await page.locator("#graphInfo [data-grconn]").click();
  await expect.poll(() => api.peerRequests.map((b) => b.peerUserId)).toContain(CELIA);
  await expect.poll(async () => (await engineState(page)).requests[`u:${CELIA}`]).toMatchObject({ status: "pending", real: true, userId: CELIA });
  expect((await graph(page)).nodes.find((n) => n.label === "Celia C.").key).toBe(`u:${CELIA}`);
});

test("sin «network»: con el permiso revocado en el servidor el conmutador se deshabilita; sin el permiso local no hay grafo", async ({ page }) => {
  const api = await installMockApi(page, { network: NETWORK, connections: CONNS() });
  api.networkError = [403, "network_off"];
  await seedSession(page, { extra: { graphSecond: true } });
  await page.goto("/#red");
  await expect.poll(() => api.networkCalls).toBeGreaterThan(0);
  await expect(page.locator("#grSecond")).toBeDisabled();
  await expect(page.locator("#grSecondHint")).toContainText("Red de contactos");
  await expect.poll(async () => (await graph(page))?.second).toMatchObject({ disabled: true });
  expect((await graph(page)).nodes.some((n) => n.degree === 2)).toBe(false);
});

test("sin «network» en Permisos MCP: el grafo queda bloqueado y no hay conmutador de 2.º grado", async ({ page }) => {
  await installMockApi(page, { network: NETWORK, connections: CONNS() });
  await seedSession(page, { extra: { scopes: { profile: true, industry: true, interests: true, network: false } } });
  await page.goto("/#red");
  await expect(page.locator("#networkCard")).toHaveClass(/pcard-locked/);
  await expect(page.locator("#grSecond")).toHaveCount(0);
  await expect(page.locator("#netGraph")).toHaveCount(0);
});

test("modo local (sin cuenta): el 2.º grado se genera desde SUMMIT_POOL con quién te conecta", async ({ page }) => {
  await installMockApi(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem("e2e-seeded")) return;
    sessionStorage.setItem("e2e-seeded", "1");
    localStorage.setItem("knet-storage-pref", JSON.stringify({ preferencias: false, fecha: new Date().toISOString(), version: "1.2" }));
    localStorage.setItem("knet-demo-v1", JSON.stringify({
      connected: true, ind: "tech", mv1: true, tourSeen: true, mv2: true, events: ["and"], xp: 100, xpLocal: 100, xpSynced: [], outbox: [], inboundSeeded: "tech",
      connections: ["Andrea P."], graphSecond: true, graphSee: ["cliente", "experto", "speaker", "partner"],
      profile: { name: "Paola Prueba", role: "Gerente de Producto", company: "Acme", seniority: "Gerencia", interests: ["Datos"], location: "Bogotá", src: {} },
    }));
  });
  await page.goto("/#red");
  await expect(page.locator("#netGraph")).toBeVisible();
  await expect.poll(async () => (await graph(page))?.nodes.filter((n) => n.degree === 2).length).toBeGreaterThan(5);
  const g = await graph(page);
  expect(g.second.live).toBe(false);
  expect(g.nodes.find((n) => n.label === "Andrea P.")).toMatchObject({ degree: 1, type: "conn" });
  const second = g.nodes.filter((n) => n.degree === 2);
  for (const n of second) expect(n.via).toEqual(["Andrea P."]); // la única conexión es quien te conecta con todos
  expect(g.nodes.length).toBeLessThanOrEqual(60);
  expect(g.edges.filter((e) => e.kind === "second").length).toBe(second.length);
});
