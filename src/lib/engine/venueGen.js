/**
 * Generador de recintos 3D para el panel de eventos (organizer.js). A partir de una lista de zonas
 * ({ type, name, size, description }) arma un recinto con la forma de VENUES (src/data/venues.js), el mismo
 * formato que valida el backend (venueSchema) y que pinta el motor (vnBuildZones / startVenue):
 *   pasillo central este-oeste con la entrada al oeste, zonas a ambos lados (los auditorios al norte para que
 *   la pantalla quede al fondo) y un nodo de ruta frente a la puerta de cada zona.
 * parseVenueBrief() traduce una descripción en texto a zonas sin IA (respaldo cuando la IA no está disponible).
 * Los nombres y descripciones que se guardan van en español (la fuente); el inglés lo aplica el diccionario.
 */

export const ZONE_TYPES = ["stage", "booths", "labs", "lounge", "dinner"];
export const ZONE_SIZES = ["s", "m", "l"];
export const VENUE_GROUNDS = ["conv", "concrete", "stone", "wood", "industrial", "terracotta", "sand"];
export const MAX_ZONES = 6;

const WIDTH = { s: 12, m: 18, l: 26 };
const DEPTH = { s: 10, m: 12, l: 14 };
const AISLE = 6, GAP = 2, ENTRY = 8, MARGIN = 3;
const TYPE_COLOR = { stage: "orange", booths: "blue", labs: "purple", lounge: "lime", dinner: "orange" };
const COLORS = ["purple", "lime", "orange", "blue"];
export const ZONE_DEFAULTS = {
  stage: { name: "Auditorio principal", description: "Charlas principales y keynotes." },
  booths: { name: "Feria de expositores", description: "Stands de empresas y aliados." },
  labs: { name: "Salas de talleres", description: "Talleres y sesiones paralelas." },
  lounge: { name: "Zona de networking", description: "Encuentros entre asistentes." },
  dinner: { name: "Zona de alimentos", description: "Café, almuerzo y pausas." },
};

const r1 = (n) => Math.round(n * 2) / 2; // medio metro

/** Normaliza una zona (tipo y tamaño válidos, nombre por defecto) */
export function cleanZone(z) {
  const type = ZONE_TYPES.includes(z && z.type) ? z.type : "labs";
  return {
    type,
    size: ZONE_SIZES.includes(z && z.size) ? z.size : "m",
    name: String((z && z.name) || ZONE_DEFAULTS[type].name).trim().slice(0, 60) || ZONE_DEFAULTS[type].name,
    description: String((z && z.description) || ZONE_DEFAULTS[type].description).trim().slice(0, 200),
  };
}

/** Recinto con la forma de VENUES a partir de 1–6 zonas */
export function generateVenue({ zones, ground = "conv" }) {
  const zs = (zones || []).slice(0, MAX_ZONES).map(cleanZone);
  if (!zs.length) throw new Error("El recinto necesita al menos una zona");
  const w = (z) => WIDTH[z.size], d = (z) => DEPTH[z.size];
  // Fila norte (0) y sur (1): auditorios al norte; el resto donde haya menos largo ocupado, en el orden de la lista
  const rows = [[], []], len = [0, 0];
  const put = (i, r) => { rows[r].push(i); len[r] += w(zs[i]) + GAP; };
  zs.forEach((z, i) => { if (z.type === "stage" && len[0] <= len[1] + WIDTH.l) put(i, 0); });
  zs.forEach((z, i) => { if (!rows[0].includes(i)) put(i, len[0] <= len[1] ? 0 : 1); });
  const run = Math.max(len[0], len[1]) - GAP;
  const L = ENTRY + run + MARGIN, x0 = -L / 2;
  const depth = (r) => Math.max(0, ...rows[r].map((i) => d(zs[i])));
  const zN = -(AISLE / 2 + depth(0) + MARGIN), zS = AISLE / 2 + depth(1) + MARGIN;
  const nodes = { E: [r1(x0 + 1.5), 0] }, out = [];
  const colorCount = {};
  rows.forEach((row, r) => {
    let x = x0 + ENTRY;
    row.forEach((i) => {
      const z = zs[i], zw = w(z), zd = d(z), cx = r1(x + zw / 2);
      const rect = r === 0 ? [r1(x), r1(x + zw), r1(-AISLE / 2 - zd), r1(-AISLE / 2)] : [r1(x), r1(x + zw), r1(AISLE / 2), r1(AISLE / 2 + zd)];
      const key = "n" + (i + 1);
      nodes[key] = [cx, 0];
      // Mismo tipo repetido → otro color para distinguirlas en el plano
      const k = colorCount[z.type] = (colorCount[z.type] || 0) + 1;
      const color = k === 1 ? TYPE_COLOR[z.type] : COLORS[(COLORS.indexOf(TYPE_COLOR[z.type]) + k - 1) % COLORS.length];
      out[i] = [z.name, z.type, color, z.description, rect, [cx, r === 0 ? rect[3] : rect[2]], key];
      x += zw + GAP;
    });
  });
  const chain = Object.keys(nodes).filter((k) => k !== "E").sort((a, b) => nodes[a][0] - nodes[b][0]);
  const edges = chain.map((k, i) => [i ? chain[i - 1] : "E", k]);
  const totems = chain.filter((_, i) => i % 2 === 0).slice(0, 4);
  const floor = [r1(x0), r1(x0 + L), r1(zN), r1(zS)];
  return {
    size: Math.round(Math.max(L, zS - zN) * 1.15), floor, ground: VENUE_GROUNDS.includes(ground) ? ground : "conv",
    aisle: AISLE, ent: "E", totems, nodes, edges, z: out,
  };
}

/** Zonas editables a partir de un recinto existente (plantilla o generado antes) */
export function zonesFromVenue(v) {
  if (!v || !Array.isArray(v.z)) return [];
  return v.z.slice(0, MAX_ZONES).map((z) => {
    const r = z[4] || [0, 0, 0, 0], width = Math.abs(r[1] - r[0]);
    return cleanZone({ type: ZONE_TYPES.includes(z[1]) ? z[1] : "labs", name: z[0], description: z[3], size: width >= 24 ? "l" : width >= 16 ? "m" : "s" });
  });
}

/** Descripción en texto → zonas, sin IA (palabras clave en español e inglés) */
export function parseVenueBrief(text) {
  const s = String(text || "").toLowerCase();
  const big = /grande|amplio|gran |principal|large|big/;
  const num = (re) => { const m = new RegExp(`(\\d+)\\s*(?:${re})`).exec(s); return m ? Math.min(3, Math.max(1, +m[1])) : 1; };
  const zones = [];
  if (/auditorio|plenaria|escenario|keynote|auditorium|main stage|stage/.test(s)) zones.push({ type: "stage", size: "l" });
  if (/stand|feria|expo|muestra|booth|exhibit/.test(s)) zones.push({ type: "booths", size: big.test(s) ? "l" : "m" });
  if (/sala|taller|lab|workshop|room/.test(s)) {
    const n = num("salas|talleres|labs|workshops|rooms");
    for (let i = 0; i < n; i++) zones.push({ type: "labs", size: n > 1 ? "s" : "m", name: n > 1 ? `Sala ${i + 1}` : undefined });
  }
  if (/networking|lounge|encuentro|reuniones|meetup/.test(s)) zones.push({ type: "lounge", size: "m" });
  if (/comida|almuerzo|cena|restaurante|caf[eé]|cafeter|food|lunch|coffee/.test(s)) zones.push({ type: "dinner", size: "m" });
  const out = zones.length ? zones : [{ type: "stage", size: "l" }, { type: "booths", size: "m" }, { type: "lounge", size: "m" }, { type: "labs", size: "m" }];
  return out.slice(0, MAX_ZONES).map(cleanZone);
}

/** Plano 2D (SVG) del recinto para la vista previa del panel */
export function venuePlanSVG(v, esc, label) {
  if (!v || !Array.isArray(v.floor) || !Array.isArray(v.z)) return "";
  const [fx0, fx1, fz0, fz1] = v.floor, W = fx1 - fx0, H = fz1 - fz0;
  const fill = { purple: "#A100FF", lime: "#9BE36D", orange: "#FF9A3D", blue: "#3D6BFF" };
  const nodes = v.nodes || {};
  const edges = (v.edges || []).filter(([a, b]) => nodes[a] && nodes[b]).map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" class="vp-aisle" stroke-width="${v.aisle || 5}"/>`).join("");
  const zones = v.z.map((z) => {
    const [x0, x1, z0, z1] = z[4], c = fill[z[2]] || "#A100FF";
    return `<g><rect x="${x0}" y="${z0}" width="${x1 - x0}" height="${z1 - z0}" rx="1.2" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width=".5"/><text x="${(x0 + x1) / 2}" y="${(z0 + z1) / 2}" class="vp-lbl" text-anchor="middle" dominant-baseline="middle">${esc(z[0])}</text></g>`;
  }).join("");
  const ent = nodes[v.ent] ? `<circle cx="${nodes[v.ent][0]}" cy="${nodes[v.ent][1]}" r="1.6" class="vp-ent"/>` : "";
  return `<svg class="org-vplan" viewBox="${fx0} ${fz0} ${W} ${H}" role="img" aria-label="${esc(label)}"><rect x="${fx0}" y="${fz0}" width="${W}" height="${H}" rx="2" class="vp-floor"/>${edges}${zones}${ent}</svg>`;
}
