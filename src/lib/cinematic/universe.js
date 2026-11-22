/* KNET · universo cinematográfico: WebGL sin dependencias, partículas que cambian de forma con el scroll. */


/**
 * Inicia la escena 3D en <canvas id="cine">. Si no hay WebGL, la landing queda en versión estática.
 */
export function startCinematicUniverse() {
  const cv = document.getElementById("cine"); if (!cv) return;
  const root = document.documentElement;
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gl = null;
  try { gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" }); } catch (e) {}
  /* vista previa que estira la página a toda su altura (sin scroll propio): mejor la versión estática */
  const tallFrame = window.innerHeight > Math.max(2600, (screen.height || 900) * 2.2);
  if (!gl || tallFrame) { root.classList.add("no-cine"); return; }
  root.classList.add("has-cine"); if (RM) root.classList.add("cine-still");
  const SMALL = Math.min(screen.width, screen.height) < 700 || (navigator.hardwareConcurrency || 4) <= 4;
  const N = SMALL ? 2600 : 5600;

  /* ---------- utilidades ---------- */
  let seed = 20261122; const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = (a, b) => a + (b - a) * R();
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const inSphere = (r) => { let x, y, z; do { x = R() * 2 - 1; y = R() * 2 - 1; z = R() * 2 - 1; } while (x * x + y * y + z * z > 1); return [x * r, y * r, z * r]; };
  const onSphere = (r) => { const u = R() * 2 - 1, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r]; };
  const jit = (p, j) => [p[0] + rr(-j, j), p[1] + rr(-j, j), p[2] + rr(-j, j)];

  /* ---------- formaciones: Float32Array(N*4) = x,y,z,grupo ---------- */
  function build(fill) { const a = new Float32Array(N * 4); for (let i = 0; i < N; i++) { const [x, y, z, g] = fill(i, i / N); a[i * 4] = x; a[i * 4 + 1] = y; a[i * 4 + 2] = z; a[i * 4 + 3] = g; } return a; }
  const dust = (sx, sy, sz, oy) => [rr(-sx, sx), rr(-sy, sy) + (oy || 0), rr(-sz, sz), 7];
  function edgePt(a, b) { const t = R(); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function boxEdge(x0, x1, y0, y1, z0, z1) {
    const c = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const k = e[Math.floor(R() * e.length)]; return edgePt(c[k[0]], c[k[1]]);
  }
  function textPts(txt) {
    const c = document.createElement("canvas"), W = 900, H = 260; c.width = W; c.height = H; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = '800 230px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
    x.fillText(txt, W / 2, H / 2 + 8); const d = x.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 3) for (let xx = 0; xx < W; xx += 3) if (d[(y * W + xx) * 4 + 3] > 140) pts.push([(xx - W / 2) / 100, -(y - H / 2) / 100, Math.min(3, Math.floor((xx / W) * 4))]);
    return pts.length ? pts : [[0, 0, 0]];
  }
  const F = {}; const FN = ["logo", "aud", "chaos", "sphere", "cycle", "orbit", "floor", "venue", "arch", "shield", "final"]; FN.forEach((n, i) => F[n] = i);
  const FORMS = [];
  /* 0 · Logo KNET (intro) */
  { const tp = textPts("KNET"); FORMS.push(build((i, f) => { if (f > .9) return [...onSphere(rr(5, 9)), 7]; const p = tp[Math.floor(R() * tp.length)]; return [p[0] + rr(-.02, .02), p[1] + rr(-.02, .02), rr(-.18, .18), p[2]]; })); }
  /* 1 · Auditorio: gradas, pantalla holográfica, escenario y polvo de luz */
  FORMS.push(build((i, f) => {
    if (f < .52) { const row = Math.floor(R() * 14), Rr = 3.4 + row * .44, a = rr(-1.22, 1.22); return [Math.sin(a) * Rr + rr(-.05, .05), -1.55 + row * .2 + rr(0, .07), -4.2 + Math.cos(a) * Rr, 0]; }
    if (f < .7) { const edge = R() < .3; let x = rr(-3.3, 3.3), y = rr(.25, 3.05); if (edge) { if (R() < .5) x = R() < .5 ? -3.3 : 3.3; else y = R() < .5 ? .25 : 3.05; } else if (R() < .45) y = [.75, 1.2, 1.65, 2.1, 2.55][Math.floor(R() * 5)] + rr(-.03, .03); return [x, y, -6.4 - x * x * .03, 1]; }
    if (f < .8) { const a = R() * Math.PI * 2, rx = 3.7, rz = 1.25, rim = R() < .6; const s = rim ? 1 : Math.sqrt(R()); return [Math.cos(a) * rx * s, -1.62, -4.9 + Math.sin(a) * rz * s, 2]; }
    if (f < .86) { const s = R() < .5 ? -1 : 1, t = R(); return [s * lerp(5.6, 3.2, t), lerp(5.6, .6, t), lerp(-2.4, -4.8, t), 3]; }
    return dust(9, 3.6, 8, 2.2);
  }));
  /* 2 · Caos: conocimiento disperso */
  FORMS.push(build((i) => [rr(-8.5, 8.5), rr(-4.6, 4.6), rr(-7, 3.5), Math.floor(R() * 4)]));
  /* 3 · Núcleo de conocimiento: esfera de Fibonacci + núcleo interno; 4 sectores = 4 transformaciones */
  const SPH_R = 2.3; const sphSurf = [];
  FORMS.push(build((i, f) => {
    if (f < .74) { const k = i / (N * .74), y = 1 - 2 * k, s = Math.sqrt(1 - y * y), a = i * 2.399963; const p = [Math.cos(a) * s * SPH_R, y * SPH_R, Math.sin(a) * s * SPH_R]; const g = Math.floor(((Math.atan2(p[2], p[0]) + Math.PI) / (Math.PI * 2)) * 4) % 4; if (i % 19 === 0) sphSurf.push(p); return [...jit(p, .03), g]; }
    if (f < .93) { const p = inSphere(1.25); return [...p, 5]; }
    return dust(8, 4.5, 6);
  }));
  /* figuras planas: polígonos y círculos */
  const polyEdge = (P) => { const i = Math.floor(R() * P.length), a = P[i], b = P[(i + 1) % P.length], t = R(); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; };
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const polyFill = (P) => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); for (let n = 0; n < 60; n++) { const x = rr(Math.min(...xs), Math.max(...xs)), y = rr(Math.min(...ys), Math.max(...ys)); if (inPoly(P, x, y)) return [x, y]; } return P[0]; };
  const rectP = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, a0, a1) => { const a = a0 == null ? R() * Math.PI * 2 : rr(a0, a1); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const bust = (cx, cy, cz, s) => { if (R() < .38) { const p = onSphere(.3 * s); return [cx + p[0], cy + .58 * s + p[1], cz + p[2]]; } const p = onSphere(.62 * s); return [cx + p[0], cy - .72 * s + Math.abs(p[1]) * .95, cz + p[2] * .55]; };
  const BOLT = [[.12, .75], [-.38, -.02], [-.02, -.02], [-.18, -.75], [.38, .08], [.02, .08]];
  /* 4 · Ciclo: anillo con 4 nodos (Evento, Insight, Conexión, Acción) */
  const CYC_R = 3.5, cycNode = (k) => { const a = Math.PI + k * Math.PI / 2; return [Math.cos(a) * CYC_R, 0, -Math.sin(a) * CYC_R]; };
  FORMS.push(build((i, f) => {
    if (f < .6) { const k = Math.floor(R() * 4), c = cycNode(k); let p;
      if (k === 0) { const u = R(); /* calendario */
        if (u < .42) p = [...polyEdge(rectP(-.55, .55, -.5, .42)), 0];
        else if (u < .58) p = [rr(-.55, .55), rr(.24, .42), 0];
        else if (u < .86) { const c = Math.floor(R() * 9), cx = -.33 + (c % 3) * .33, cy = .06 - Math.floor(c / 3) * .2; p = [cx + rr(-.08, .08), cy + rr(-.05, .05), 0]; }
        else { const q = circ(0, .5, .09); p = [R() < .5 ? -.28 : .28, q[1], q[0]]; } }
      else if (k === 1) { const u = R(); /* bombillo */
        if (u < .55) { let q; do { q = onSphere(.42); } while (q[1] < -.28); p = [q[0], q[1] + .22, q[2]]; }
        else if (u < .75) { const a = R() * Math.PI * 2; p = [Math.cos(a) * .17, rr(-.5, -.12), Math.sin(a) * .17]; }
        else if (u < .83) { const a = R() * Math.PI * 2, y = [-.28, -.37, -.46][Math.floor(R() * 3)]; p = [Math.cos(a) * .2, y, Math.sin(a) * .2]; }
        else { const a = [.25, .9, 1.57, 2.24, 2.89][Math.floor(R() * 5)], r = rr(.6, .82); p = [Math.cos(a) * r, .22 + Math.sin(a) * r, 0]; } }
      else if (k === 2) { const a = R() * Math.PI * 2, r2 = R() < .5; p = r2 ? [Math.cos(a) * .5 + .26, Math.sin(a) * .5, 0] : [Math.cos(a) * .5 - .26, 0, Math.sin(a) * .5]; }
      else { const q = R() < .5 ? polyEdge(BOLT) : polyFill(BOLT); p = [q[0], q[1], rr(-.06, .06)]; }
      return [...jit([p[0] + c[0], p[1] + c[1], p[2] + c[2]], .02), k]; }
    if (f < .92) { const a = R() * Math.PI * 2; const seg = (Math.floor(((Math.PI - a + Math.PI * 4) % (Math.PI * 2)) / (Math.PI / 2))) % 4; return [Math.cos(a) * CYC_R + rr(-.07, .07), rr(-.06, .06), -Math.sin(a) * CYC_R + rr(-.07, .07), seg]; }
    return dust(9, 4, 6);
  }));
  /* 5 · Órbitas: el núcleo con las 4 experiencias girando */
  FORMS.push(build((i, f) => {
    if (f < .28) return [...onSphere(1.05 + rr(-.04, .04)), 5];
    if (f < .9) { const k = Math.floor(R() * 4), r = 1.9 + k * .48, a = R() * Math.PI * 2, tilt = [.35, -.5, .9, -.15][k], yaw = k * .8; let p = [Math.cos(a) * r, 0, Math.sin(a) * r];
      p = [p[0], p[2] * Math.sin(tilt), p[2] * Math.cos(tilt)]; const c = Math.cos(yaw), s = Math.sin(yaw); return [c * p[0] + s * p[2] + rr(-.03, .03), p[1] + rr(-.03, .03), -s * p[0] + c * p[2], k]; }
    return dust(9, 4.5, 6);
  }));
  /* 6 · Plano: rejilla tranquila mientras se usa el simulador */
  FORMS.push(build((i, f) => { if (f < .85) { const along = R() < .5, l = Math.round(rr(-14, 14)) * .9; return along ? [l, -2.8, rr(-16, 6), 7] : [rr(-14, 14), -2.8, Math.round(rr(-16, 6)), 7]; } return dust(10, 3, 8, 1); }));
  /* 7 · Recinto: maqueta (auditorio, salas, labs, lounge) */
  const ROOMS = [["aud", -5, -1, -3.5, .4, 1.2, 0], ["salas", -.6, 2, -3.5, -.6, .8, 1], ["labs", 2.4, 5, -3.5, .4, .95, 2], ["lounge", -5, -1.4, 1.5, 3.5, .5, 3]], FLOOR_Y = -1.2;
  const TOTEMS = [[-.4, 1.05], [2.0, .9], [-3.0, 1.1], [4.3, 1.1]];
  FORMS.push(build((i, f) => {
    if (f < .66) { const r = ROOMS[Math.floor(R() * ROOMS.length)]; if (R() < .72) return [...boxEdge(r[1], r[2], FLOOR_Y, FLOOR_Y + r[5], r[3], r[4]), r[6]];
      return [rr(r[1], r[2]), FLOOR_Y + .01, rr(r[3], r[4]), r[6]]; }
    if (f < .78) return [...boxEdge(-5.4, 5.4, FLOOR_Y - .12, FLOOR_Y, -3.9, 3.9), 4];
    if (f < .86) { const t = TOTEMS[Math.floor(R() * TOTEMS.length)]; return [t[0] + rr(-.05, .05), FLOOR_Y + rr(0, .55), t[1] + rr(-.05, .05), 6]; }
    return dust(9, 3, 7, 1);
  }));
  /* 8 · Arquitectura: lo que autorizas → puente seguro → asistentes de IA → donde lo usas */
  const ARX = [-5.1, -1.7, 1.7, 5.1];
  FORMS.push(build((i, f) => {
    if (f < .72) { const k = Math.floor(R() * 4); let p;
      const u = R(), z = rr(-.04, .04);
      if (k === 0) { /* credencial de perfil: foto, datos y check de permiso */
        if (u < .32) { const q = polyEdge(rectP(-.72, .72, -.95, .95)); p = [q[0], q[1], z]; }
        else if (u < .44) { const q = circ(0, .42, .26); p = [q[0], q[1], z]; }
        else if (u < .56) { const q = circ(0, -.02, .4, .25, Math.PI - .25); p = [q[0], q[1] - .1, z]; }
        else if (u < .78) { const row = Math.floor(R() * 3); p = [rr(-.45, [.45, .3, .38][row]), -.32 - row * .17, z]; }
        else { const q = R() < .55 ? circ(.5, .72, .17) : (R() < .4 ? [lerp(.42, .48, R()), lerp(.73, .66, R())] : [lerp(.48, .6, R()), lerp(.66, .8, R())]); p = [q[0], q[1], z]; } }
      else if (k === 1) { /* candado: puente seguro */
        if (u < .3) { const q = circ(0, .2, .36, 0, Math.PI); p = [q[0], q[1], rr(-.06, .06)]; }
        else if (u < .36) { p = [R() < .5 ? -.36 : .36, rr(-.05, .2), rr(-.06, .06)]; }
        else if (u < .7) { const q = polyEdge(rectP(-.55, .55, -.85, -.05)); p = [q[0], q[1], rr(-.08, .08)]; }
        else if (u < .86) { p = [rr(-.55, .55), rr(-.85, -.05), .08]; }
        else { const q = R() < .6 ? circ(0, -.38, .1) : [rr(-.03, .03), rr(-.68, -.42)]; p = [q[0], q[1], .1]; } }
      else if (k === 2) { /* asistente de IA: cabeza de robot */
        if (u < .38) { const q = polyEdge(rectP(-.62, .62, -.55, .5)); p = [q[0], q[1], z]; }
        else if (u < .56) { const q = circ(R() < .5 ? -.25 : .25, .05, rr(.05, .13)); p = [q[0], q[1], z]; }
        else if (u < .66) { p = [rr(-.25, .25), -.28, z]; }
        else if (u < .76) { const q = R() < .45 ? circ(0, .82, .09) : [0, rr(.5, .73)]; p = [q[0], q[1], z]; }
        else if (u < .86) { p = [R() < .5 ? rr(-.78, -.62) : rr(.62, .78), rr(-.15, .1), z]; }
        else p = [rr(-.62, .62), rr(-.55, .5), -.12]; }
      else { /* donde lo usas: celular y credencial NFC */
        if (u < .36) { const q = polyEdge(rectP(-.42, .42, -.9, .9)); p = [q[0] - .25, q[1], z]; }
        else if (u < .44) { p = [rr(-.37, -.13), .8, z]; }
        else if (u < .6) { const row = Math.floor(R() * 4); p = [rr(-.55, -.55 + [.55, .45, .6, .35][row]), .45 - row * .25, z]; }
        else if (u < .8) { const q = polyEdge(rectP(.3, .85, -.75, 0)); p = [q[0] + .05, q[1], z + .15]; }
        else { const q = circ(.62, -.38, [.1, .2][Math.floor(R() * 2)], -1, 1); p = [q[0] + .05, q[1], z + .15]; } }
      return [...jit([p[0] + ARX[k], p[1], p[2]], .015), k]; }
    if (f < .9) { const s = Math.floor(R() * 3); return [rr(ARX[s] + .9, ARX[s + 1] - .9), rr(-.05, .05), rr(-.05, .05), s]; }
    return dust(9, 4, 6);
  }));
  /* 9 · Escudo: cúpula geodésica protegiendo un núcleo, con 4 satélites (principios) */
  const geo = (() => { const t = (1 + Math.sqrt(5)) / 2; let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => { const l = Math.hypot(...p); return p.map(c => c / l); });
    let fcs = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (let s = 0; s < 2; s++) { const nf = [], mid = {}; const m = (a, b) => { const k = a < b ? a + "_" + b : b + "_" + a; if (mid[k] != null) return mid[k]; const p = v[a].map((c, i) => (c + v[b][i]) / 2), l = Math.hypot(...p); v.push(p.map(c => c / l)); return mid[k] = v.length - 1; };
      fcs.forEach(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); }); fcs = nf; }
    const e = new Set(); fcs.forEach(([a, b, c]) => [[a, b], [b, c], [c, a]].forEach(([x, y]) => e.add(x < y ? x + "_" + y : y + "_" + x)));
    return { v, e: [...e].map(s => s.split("_").map(Number)) }; })();
  const SH_R = 3, SAT = [[-2.6, 1.5, 1.2], [2.6, 1.5, 1.2], [-2.6, -1.5, 1.2], [2.6, -1.5, 1.2]];
  const domeEdges = geo.e.filter(([a, b]) => geo.v[a][2] + geo.v[b][2] > -.25);
  FORMS.push(build((i, f) => {
    if (f < .55) { const [a, b] = domeEdges[Math.floor(R() * domeEdges.length)], p = edgePt(geo.v[a], geo.v[b]); const l = Math.hypot(...p); return [p[0] / l * SH_R, p[1] / l * SH_R, p[2] / l * SH_R, 4]; }
    if (f < .75) return [...inSphere(.95), 5];
    if (f < .9) { const k = Math.floor(R() * 4); return [...SAT[k].map((c, j) => c + onSphere(.22)[j]), k]; }
    return dust(9, 4.5, 6);
  }));
  /* 10 · Final: todo converge en el núcleo KNET */
  FORMS.push(build((i, f) => {
    if (f < .5) return [...inSphere(1.35), 5];
    if (f < .82) { const a = R() * Math.PI * 2, r = rr(2.1, 2.6); return [Math.cos(a) * r, rr(-.05, .05), Math.sin(a) * r, Math.floor(R() * 4)]; }
    return [...onSphere(rr(3.2, 5.2)), 7];
  }));

  /* 11-14 · El problema: una figura por transformación */
  FN.push("match", "trophy", "card", "doc"); FN.forEach((n, i) => F[n] = i);
  const crowd = Array.from({ length: 9 }, (_, k) => { const a = -2.4 + k * .6 + rr(-.15, .15); return [Math.sin(a) * rr(3, 4.2), rr(-1.2, .2), -Math.cos(a) * rr(1.5, 3) - 1]; });
  FORMS.push(build((i, f) => { /* Matchmaking con IA: dos personas conectadas en medio de la multitud */
    if (f < .44) return [...bust(R() < .5 ? -1.6 : 1.6, -.1, 0, 1), 0];
    if (f < .55) { const t = R(), a = [-1.25, .35], c = [0, 2.1], b = [1.25, .35]; const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]; return [x + rr(-.03, .03), y + rr(-.03, .03), rr(-.03, .03), 1]; }
    if (f < .92) { const c = crowd[Math.floor(R() * crowd.length)]; return [...bust(c[0], c[1], c[2], .42), 2]; }
    return dust(8, 4.5, 6);
  }));
  const STAR = Array.from({ length: 10 }, (_, k) => { const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .15 : .36; return [Math.cos(a) * r, 2.05 + Math.sin(a) * r]; });
  FORMS.push(build((i, f) => { /* Participación gamificada: trofeo, estrella y órbita de XP */
    if (f < .42) { const u = R(), y = .1 + u * 1.25, r = .24 + .6 * Math.pow(u, .55), a = R() * Math.PI * 2; const rim = R() < .18; return [Math.cos(a) * (rim ? .84 : r), rim ? 1.35 : y, Math.sin(a) * (rim ? .84 : r), 0]; }
    if (f < .5) { const sd = R() < .5 ? -1 : 1, q = circ(0, 0, .3, -Math.PI / 2, Math.PI / 2); return [sd * (.82 + q[0]), .85 + q[1], 0, 0]; }
    if (f < .58) { const a = R() * Math.PI * 2; return R() < .5 ? [Math.cos(a) * .1, rr(-.38, .1), Math.sin(a) * .1, 0] : [Math.cos(a) * rr(.2, .6), rr(-.55, -.4), Math.sin(a) * rr(.2, .6), 0]; }
    if (f < .68) { const q = R() < .6 ? polyEdge(STAR) : polyFill(STAR); return [q[0], q[1], rr(-.05, .05), 1]; }
    if (f < .9) { const a = R() * Math.PI * 2; if ((a * 8 / Math.PI) % 2 > 1.3) return [rr(-6, 6), rr(-4, 4), rr(-6, 0), 7]; const p = [Math.cos(a) * 1.75, 0, Math.sin(a) * 1.75]; return [p[0], .45 + p[2] * .28, p[2], 1]; }
    return dust(8, 4.5, 6);
  }));
  FORMS.push(build((i, f) => { /* Contactos con contexto: tarjeta digital, etiquetas y ondas NFC */
    if (f < .26) { const q = polyEdge(rectP(-1.35, 1.35, -.82, .82)); return [q[0], q[1], 0, 0]; }
    if (f < .38) { const q = R() < .45 ? circ(-.78, .22, .3) : [rr(-1.05, -.5), rr(-.4, -.08)]; return [q[0], q[1], 0, 0]; }
    if (f < .52) { const row = Math.floor(R() * 3), len = [1.15, .9, .7][row]; return [rr(-.2, -.2 + len), .42 - row * .24 + rr(-.02, .02), 0, 0]; }
    if (f < .64) { const k = Math.floor(R() * 2), x0 = [-1.1, -.25][k], q = R() < .6 ? polyEdge(rectP(x0, x0 + .7, -.66, -.42)) : [rr(x0 + .1, x0 + .6), -.54]; return [q[0], q[1], 0, 1]; }
    if (f < .8) { const r = [.32, .58, .84][Math.floor(R() * 3)], q = circ(1.55, 0, r, -.75, .75); return [q[0], q[1], rr(-.03, .03), 1]; }
    if (f < .9) { const q = polyEdge(rectP(-1.35, 1.35, -.82, .82)); return [q[0] - .35, q[1] + .35, -.7, 2]; }
    return dust(8, 4.5, 6);
  }));
  FORMS.push(build((i, f) => { /* Dossier post-Summit: documento con ideas, contactos y plan de 30 días */
    if (f < .3) { const k = Math.floor(R() * 3), q = polyEdge(rectP(-.85, .85, -1.1, 1.1)); return [q[0] + k * .2, q[1] - k * .2, -k * .35, k === 0 ? 0 : 2]; }
    if (f < .42) return [rr(-.7, .7), rr(.78, .95), 0, 0];
    if (f < .7) { const row = Math.floor(R() * 6), y = .5 - row * .24, len = [1.1, .9, 1.0, .75, 1.05, .6][row]; return [rr(-.38, -.38 + len), y + rr(-.015, .015), 0, 0]; }
    if (f < .86) { const row = Math.floor(R() * 6), y = .5 - row * .24; const q = R() < .55 ? polyEdge(rectP(-.66, -.5, y - .08, y + .08)) : [rr(-.64, -.52), y + rr(-.04, .04)]; return [q[0], q[1], 0, 1]; }
    return dust(8, 4.5, 6);
  }));

  /* ---------- líneas (x,y,z,alfa) atadas a una formación ---------- */
  const LINES = {};
  { const a = []; for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 6; k++) { const x0 = s * (5.6 - k * .4), x1 = s * (3.4 - k * .55); a.push(x0, 5.6, -2.4, .55, x1, -1.5, -4.9, 0); } LINES.aud = a; }
  { const a = []; sphSurf.forEach((p, i) => { const d = sphSurf.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2]).sort((x, y) => x[1] - y[1]); for (let n = 1; n <= 2; n++) { const q = sphSurf[d[n][0]]; if (d[n][1] < 1.4) a.push(...p, .7, ...q, .7); } }); LINES.sphere = a; }
  { const a = []; for (let k = 0; k < 128; k++) { const a0 = k / 128 * Math.PI * 2, a1 = (k + 1) / 128 * Math.PI * 2; a.push(Math.cos(a0) * CYC_R, 0, -Math.sin(a0) * CYC_R, .8, Math.cos(a1) * CYC_R, 0, -Math.sin(a1) * CYC_R, .8); } LINES.cycle = a; }
  { const a = []; for (let s = 0; s < 3; s++) for (const dy of [-.09, .09]) a.push(ARX[s] + .95, dy, 0, .9, ARX[s + 1] - .95, dy, 0, .9); LINES.arch = a; }
  { const a = []; geo.e.forEach(([x, y]) => { if (geo.v[x][2] + geo.v[y][2] > -.25) a.push(...geo.v[x].map(c => c * SH_R), .5, ...geo.v[y].map(c => c * SH_R), .5); }); LINES.shield = a; }
  const LINE_FORM = { aud: F.aud, sphere: F.sphere, cycle: F.cycle, arch: F.arch, shield: F.shield };

  /* ---------- mallas: icosfera y caja ---------- */
  function icoMesh(det) { let v = geo.v.slice(0, 12).map(p => p.slice()); const t = (1 + Math.sqrt(5)) / 2; v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => { const l = Math.hypot(...p); return p.map(c => c / l); });
    let fcs = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (let s = 0; s < det; s++) { const nf = [], mid = {}; const m = (a, b) => { const k = a < b ? a + "_" + b : b + "_" + a; if (mid[k] != null) return mid[k]; const p = v[a].map((c, i) => (c + v[b][i]) / 2), l = Math.hypot(...p); v.push(p.map(c => c / l)); return mid[k] = v.length - 1; };
      fcs.forEach(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); }); fcs = nf; }
    const out = []; fcs.forEach(f => f.forEach(i => out.push(...v[i], ...v[i]))); return new Float32Array(out); }
  function boxMesh() { const o = []; const q = (n, a, b, c, d) => [a, b, c, a, c, d].forEach(p => o.push(...p, ...n));
    q([0, 0, 1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]); q([0, 0, -1], [1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]);
    q([1, 0, 0], [1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]); q([-1, 0, 0], [-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]);
    q([0, 1, 0], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]); q([0, -1, 0], [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]); return new Float32Array(o); }

  /* ---------- shaders ---------- */
  const VS_P = `
attribute vec4 aA; attribute vec4 aB; attribute float aSeed;
uniform mat4 uVP; uniform vec4 uTA; uniform vec4 uTB; uniform float uRA; uniform float uRB; uniform float uMix; uniform float uTime;
uniform vec4 uH0; uniform vec4 uH1; uniform float uAlA; uniform float uAlB; uniform float uSize; uniform float uPx;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uHot; uniform float uLightV;
varying vec4 vC;
vec3 ry(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
float hiOf(float g){ return g < .5 ? uH0.x : g < 1.5 ? uH0.y : g < 2.5 ? uH0.z : g < 3.5 ? uH0.w : g < 4.5 ? uH1.x : g < 5.5 ? uH1.y : g < 6.5 ? uH1.z : uH1.w; }
void main(){
  float m = clamp(uMix*1.55 - aSeed*.55, 0.0, 1.0); m = m*m*(3.0 - 2.0*m);
  vec3 pa = ry(aA.xyz*uTA.w, uRA) + uTA.xyz;
  vec3 pb = ry(aB.xyz*uTB.w, uRB) + uTB.xyz;
  vec3 p = mix(pa, pb, m);
  float arc = m*(1.0 - m)*4.0;
  p += vec3(sin(aSeed*91.7 + uTime*.55), cos(aSeed*53.1 + uTime*.47), sin(aSeed*27.3 - uTime*.41))*(arc*1.5 + .03);
  float hi = mix(hiOf(aA.w), hiOf(aB.w), m);
  vec4 cp = uVP*vec4(p, 1.0); gl_Position = cp;
  float dst = mix(step(6.5, aA.w), step(6.5, aB.w), m)*uLightV;
  float sz = uSize*(.55 + fract(aSeed*13.7)*.9)*(1.0 + hi*.28)*(1.0 - dst*.45);
  gl_PointSize = clamp(sz*uPx/max(cp.w, .1), 1.0, 70.0);
  float tw = .78 + .22*sin(uTime*1.6 + aSeed*40.0);
  vec3 col = mix(uC1, uC2, smoothstep(.15, .85, fract(aSeed*7.31)));
  if (fract(aSeed*3.17) > .86) col = uC3;
  if (aSeed < .045) col = uC4;
  col = mix(col, uHot, hi*.2);
  float fog = (1.0 - smoothstep(10.0, 42.0, cp.w));
  vC = vec4(col, mix(uAlA, uAlB, m)*tw*fog*(.72 + .14*hi)*(1.0 - dst*.6));
}`;
  const FS_P = `precision mediump float; varying vec4 vC; uniform float uLight;
void main(){ vec2 d = gl_PointCoord - .5; float r = length(d); if (r > .5) discard;
  float a = uLight > .5 ? (1.0 - smoothstep(.3, .5, r)) : pow(1.0 - smoothstep(0.0, .5, r), 1.7) + (1.0 - smoothstep(0.0, .16, r))*.55;
  gl_FragColor = vec4(vC.rgb, vC.a*a); }`;
  const VS_L = `attribute vec4 aL; uniform mat4 uVP; uniform vec4 uT; uniform float uR; varying float vA;
vec3 ry(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
void main(){ vec3 p = ry(aL.xyz*uT.w, uR) + uT.xyz; vA = aL.w; gl_Position = uVP*vec4(p, 1.0); }`;
  const FS_L = `precision mediump float; varying float vA; uniform vec3 uCol; uniform float uA; void main(){ gl_FragColor = vec4(uCol, vA*uA); }`;
  const VS_M = `attribute vec3 aP; attribute vec3 aN; uniform mat4 uVP; uniform mat4 uM; varying vec3 vN; varying vec3 vW;
void main(){ vec4 w = uM*vec4(aP, 1.0); vW = w.xyz; vN = mat3(uM)*aN; gl_Position = uVP*w; }`;
  const FS_M = `precision mediump float; varying vec3 vN; varying vec3 vW; uniform vec3 uEye; uniform vec3 uIn; uniform vec3 uRim; uniform float uA; uniform float uLight; uniform float uTime; uniform float uScan;
void main(){ vec3 n = normalize(vN), v = normalize(uEye - vW); float f = pow(1.0 - abs(dot(n, v)), 2.2);
  vec3 L = normalize(uLight > .5 ? vec3(-.45, .9, .55) : vec3(.35, .55, .75)); float dif = max(dot(n, L), 0.0);
  vec3 c = mix(uIn*(.4 + .6*dif), uRim, f);
  float scan = uScan*step(.93, fract(vW.y*5.0 - uTime*.5));
  c += uRim*scan*.35;
  gl_FragColor = vec4(c, uA*(.18 + f*.95 + scan*.25)); }`;
  const VS_D = `attribute vec3 aP; attribute vec4 aC; attribute float aS; uniform mat4 uVP; uniform float uPx; varying vec4 vC;
void main(){ vec4 cp = uVP*vec4(aP, 1.0); gl_Position = cp; gl_PointSize = clamp(aS*uPx/max(cp.w, .1), 1.0, 80.0); vC = aC; }`;
  function prog(vs, fs) { const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ""); u[nm] = gl.getUniformLocation(p, nm); }
    const a = {}, na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i = 0; i < na; i++) { const nm = gl.getActiveAttrib(p, i).name; a[nm] = gl.getAttribLocation(p, nm); }
    return { p, u, a }; }
  let PP, PL, PM, PD;
  try { PP = prog(VS_P, FS_P); PL = prog(VS_L, FS_L); PM = prog(VS_M, FS_M); PD = prog(VS_D, FS_P.replace("uniform float uLight;", "uniform float uLight;")); }
  catch (e) { console.warn("KNET cine:", e); root.classList.remove("has-cine", "cine-still"); root.classList.add("no-cine"); return; }
  const buf = (data) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
  const FB = FORMS.map(buf);
  const seeds = new Float32Array(N); for (let i = 0; i < N; i++) seeds[i] = R(); const SB = buf(seeds);
  const LB = {}; Object.keys(LINES).forEach(k => LB[k] = { b: buf(new Float32Array(LINES[k])), n: LINES[k].length / 4 });
  const ICO = icoMesh(3), ICOB = buf(ICO), ICON = ICO.length / 6, BOX = boxMesh(), BOXB = buf(BOX), BOXN = BOX.length / 6;
  const DMAX = 420, DYN = new Float32Array(DMAX * 8), DB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, DB); gl.bufferData(gl.ARRAY_BUFFER, DYN.byteLength, gl.DYNAMIC_DRAW);

  /* ---------- matrices ---------- */
  const persp = (fy, as, n, f) => { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return [t / as, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; };
  const look = (e, c, up) => { let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; let l = Math.hypot(...z); z = z.map(v => v / l);
    let x = [up[1] * z[2] - up[2] * z[1], up[2] * z[0] - up[0] * z[2], up[0] * z[1] - up[1] * z[0]]; l = Math.hypot(...x); x = x.map(v => v / l);
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]; };
  const mul = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
  const model = (t, rot, sx, sy, sz) => { const c = Math.cos(rot), s = Math.sin(rot); return [c * sx, 0, -s * sx, 0, 0, sy, 0, 0, s * sz, 0, c * sz, 0, t[0], t[1], t[2], 1]; };

  /* ---------- paletas por tema ---------- */
  const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const PAL = {
    dark: { c1: hex("#A100FF"), c2: hex("#E43DD6"), c3: hex("#E9D8FF"), c4: hex("#00F2FE"), hot: hex("#FFFFFF"), line: hex("#C77DFF"), coreIn: hex("#3A0A63"), coreRim: hex("#E07BFF"), roomIn: hex("#24113A"), roomRim: hex("#B65CFF"), alpha: 1, size: 0.15 },
    light: { c1: hex("#7500C0"), c2: hex("#B0149A"), c3: hex("#3D3547"), c4: hex("#0E8FA8"), hot: hex("#A100FF"), line: hex("#7500C0"), coreIn: hex("#FFFFFF"), coreRim: hex("#A100FF"), roomIn: hex("#FFFDF9"), roomRim: hex("#7500C0"), alpha: 1.35, size: 0.08 }
  };

  /* ---------- guion: paradas atadas al DOM ---------- */
  const $ = (s) => document.querySelector(s);
  const pinEls = { know: $("#chKnow"), cycle: $("#chCycle"), venue: $("#chVenue"), shield: $("#chShield") };
  let STOPS = [], W = 1, H = 1, WIDE = true;
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  /* colocación de cada formación según el ancho: [x,y,z,escala] */
  function place(f) {
    const w = WIDE;
    switch (f) {
      case F.logo: return [0, w ? .4 : 1.2, 0, w ? 1 : .62];
      case F.aud: return [0, 0, 0, 1];
      case F.chaos: return [0, 0, 0, 1];
      case F.match: case F.trophy: case F.card: case F.doc: return w ? [-3.4, -.75, 0, 1.05] : [0, 2.55, 0, .6];
      case F.sphere: return w ? [-3.5, .1, 0, .82] : [0, 1.7, 0, .62];
      case F.cycle: return w ? [0, .35, 0, .78] : [0, 2.2, 0, .52];
      case F.orbit: return w ? [4.6, .2, -2, 1] : [0, 1.8, -2, .7];
      case F.floor: return [0, 0, 0, 1];
      case F.venue: return w ? [2.9, -.2, 0, .82] : [0, 1.35, 0, .52];
      case F.arch: return w ? [0, 0, 0, .83] : [0, .2, 0, .42];
      case F.shield: return w ? [-3.1, .1, 0, .7] : [0, 1.6, 0, .55];
      case F.final: return w ? [3.1, .2, -1, 1.35] : [0, 1.9, 0, .7];
    }
    return [0, 0, 0, 1];
  }
  const CAM = {
    hero0: [[0, 2.6, 10.5], [0, 1.1, -5]], hero1: [[0, 1.5, 5.2], [0, 1.6, -6.2]],
    know0: [[0, 0, 13], [0, 0, 0]], know1: [[.8, .5, 10.5], [0, 0, 0]], know2: [[-.4, .9, 10.5], [0, 0, 0]],
    cyc0: [[0, 6.4, 10.5], [0, -.2, 0]], cyc1: [[3.4, 5.2, 10], [0, -.2, 0]],
    orbit: [[0, .6, 10], [0, 0, 0]], floor: [[0, 1.4, 10], [0, -.6, -2]],
    ven0: [[-1, 10, 10], [1.4, -.8, 0]], ven1: [[1.5, 6, 9], [2, -1, -.3]], ven2: [[4.4, 4.8, 8.4], [2.3, -1, -.4]],
    arch: [[0, .6, 10.5], [0, 0, 0]], sh0: [[0, .6, 11], [0, 0, 0]], sh1: [[-1.5, .4, 9.2], [0, 0, 0]], fin: [[0, .4, 10.5], [0, 0, 0]]
  };
  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, SMALL ? 1.25 : 1.6) * QUALITY;
    W = window.innerWidth; H = window.innerHeight; WIDE = W >= 960;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); gl.viewport(0, 0, cv.width, cv.height);
    const vh = H, hero = $("#top > section"), S = [];
    const add = (y, f, cam, rot, extra) => S.push(Object.assign({ y, f, cam, rot: rot || 0 }, extra || {}));
    const pinRange = (el) => { const t = absTop(el), len = Math.max(1, el.offsetHeight - vh); return [t, len]; };
    add(0, F.aud, CAM.hero0); if (hero) add(absTop(hero) + hero.offsetHeight * .55, F.aud, CAM.hero1);
    if (pinEls.know) { const [t, l] = pinRange(pinEls.know), a = .22, q = (.96 - .22) / 4; add(t - vh * .25, F.chaos, CAM.know0);
      [F.match, F.trophy, F.card, F.doc].forEach((f, k) => { const c = k % 2 ? CAM.know2 : CAM.know1; add(t + l * (a + (k + .3) * q), f, c); add(t + l * (a + (k + .78) * q), f, c); }); }
    if (pinEls.cycle) { const [t, l] = pinRange(pinEls.cycle); add(t - vh * .1, F.cycle, CAM.cyc0); add(t + l, F.cycle, CAM.cyc1, -.4); }
    const feat = $("#caracteristicas"); if (feat) { add(absTop(feat) - vh * .15, F.orbit, CAM.orbit); add(absTop(feat) + Math.max(vh * .2, feat.offsetHeight - vh * 1.1), F.orbit, CAM.orbit); }
    const demo = $("#demo"); if (demo) { add(absTop(demo) + vh * .1, F.floor, CAM.floor); add(absTop(demo) + demo.offsetHeight - vh * .9, F.floor, CAM.floor); }
    if (pinEls.venue) { const [t, l] = pinRange(pinEls.venue); add(t - vh * .15, F.venue, CAM.ven0); add(t + l * .5, F.venue, CAM.ven1); add(t + l, F.venue, CAM.ven2); }
    const arch = $("#arquitectura"), ast = $("#arStage"); if (arch) { const c = ast ? absTop(ast) + ast.offsetHeight / 2 - vh / 2 : absTop(arch); add(c - vh * .35, F.arch, CAM.arch); add(c + vh * .45, F.arch, CAM.arch); }
    if (pinEls.shield) { const [t, l] = pinRange(pinEls.shield); add(t - vh * .1, F.shield, CAM.sh0); add(t + l, F.shield, CAM.sh1, .6); }
    const cta = $(".footer-cta"); if (cta) add(absTop(cta) + cta.offsetHeight * .5 - vh * .5, F.final, CAM.fin);
    const team = $(".team-sec"); if (team) add(absTop(team) - vh * .35, F.final, CAM.fin, 0, { fade: .1 });
    S.sort((a, b) => a.y - b.y); for (let i = 1; i < S.length; i++) if (S[i].y <= S[i - 1].y) S[i].y = S[i - 1].y + 1;
    STOPS = S; dirty = true;
  }

  /* ---------- pasos de texto en las secciones fijadas ---------- */
  const steps = {
    know: { el: pinEls.know, items: pinEls.know ? [...pinEls.know.querySelectorAll(".tx")] : [], a: .22, b: .96 },
    cycle: { el: pinEls.cycle, items: pinEls.cycle ? [...pinEls.cycle.querySelectorAll(".cyc-step")] : [], a: .08, b: .92 },
    venue: { el: pinEls.venue, items: pinEls.venue ? [...pinEls.venue.querySelectorAll(".stp")] : [], a: .05, b: .9 },
    shield: { el: pinEls.shield, items: pinEls.shield ? [...pinEls.shield.querySelectorAll(".cf-i")] : [], a: .1, b: .85 }
  };
  const progOf = (el, sy) => { if (!el) return -1; const t = absTopCache.get(el), len = Math.max(1, el.offsetHeight - H); return (sy - t) / len; };
  const absTopCache = new Map();
  function cacheTops() { Object.values(pinEls).forEach(el => el && absTopCache.set(el, absTop(el))); }
  const active = { know: -1, cycle: -1, venue: -1, shield: -1 }, pinP = { know: 0, cycle: 0, venue: 0, shield: 0 };
  function syncSteps(sy) {
    Object.keys(steps).forEach(k => { const s = steps[k]; if (!s.el || !s.items.length) return; const p = progOf(s.el, sy); pinP[k] = p;
      const n = s.items.length; let idx = RM ? n - 1 : Math.floor(clamp((p - s.a) / (s.b - s.a), 0, .999) * n); if (p < s.a - .05 && !RM) idx = 0;
      s.el.style.setProperty("--p", clamp(p, 0, 1).toFixed(3));
      if (idx !== active[k]) { active[k] = idx; s.items.forEach((it, i) => { it.classList.toggle("is-on", RM ? true : i === idx); it.classList.toggle("is-past", !RM && i < idx); }); s.el.dataset.step = idx; }
    });
  }

  /* ---------- etiquetas HTML proyectadas sobre el recinto ---------- */
  const cLabels = pinEls.cycle ? [...pinEls.cycle.querySelectorAll("[data-cl]")] : [];
  const vLabels = pinEls.venue ? [...pinEls.venue.querySelectorAll("[data-vl]")] : [];
  const VL_POS = { aud: [-3, FLOOR_Y + 1.5, -1.5], salas: [.7, FLOOR_Y + 1.1, -2], labs: [3.7, FLOOR_Y + 1.25, -1.5], lounge: [-3.2, FLOOR_Y + .8, 2.5], route: [3.7, FLOOR_Y + .6, 1.0] };

  /* ---------- estado ---------- */
  let QUALITY = 1, dirty = true, smoothY = window.scrollY, last = performance.now(), t0 = last, intro = RM ? 1 : 0, mx = 0, my = 0, tmx = 0, tmy = 0, slowFrames = 0, running = true;
  const people = Array.from({ length: SMALL ? 22 : 38 }, () => { const r = ROOMS[Math.floor(R() * ROOMS.length)]; return { p: [rr(r[1], r[2]), rr(r[3], r[4])], t: null, sp: rr(.35, .7) }; });
  const ROUTE = [[.3, 3.6], [.3, 1.0], [3.7, 1.0], [3.7, .35]]; const routeLen = ROUTE.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]), 0);
  const routeAt = (d) => { for (let i = 1; i < ROUTE.length; i++) { const a = ROUTE[i - 1], b = ROUTE[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d <= l) return [a[0] + (b[0] - a[0]) * d / l, a[1] + (b[1] - a[1]) * d / l]; d -= l; } return ROUTE[ROUTE.length - 1]; };

  window.addEventListener("pointermove", (e) => { tmx = e.clientX / W * 2 - 1; tmy = e.clientY / H * 2 - 1; }, { passive: true });
  window.addEventListener("scroll", () => { dirty = true; if (intro < 1 && window.scrollY > 40) intro = Math.max(intro, .999); }, { passive: true });
  let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { layout(); cacheTops(); }, 120); });
  new ResizeObserver(() => { clearTimeout(rT); rT = setTimeout(() => { layout(); cacheTops(); }, 150); }).observe(document.body);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { last = performance.now(); kick(); } });

  function frameAt(sy) {
    const S = STOPS; if (!S.length) return null;
    if (sy <= S[0].y) return { a: S[0], b: S[0], t: 0 };
    for (let i = 1; i < S.length; i++) if (sy < S[i].y) return { a: S[i - 1], b: S[i], t: (sy - S[i - 1].y) / (S[i].y - S[i - 1].y) };
    const z = S[S.length - 1]; return { a: z, b: z, t: 0 };
  }
  const OSC = { [F.match]: 1, [F.trophy]: 1, [F.card]: 1, [F.doc]: 1 };
  const osc = (f, tm) => (OSC[f] ? .42 * Math.sin(tm * .45) : 0);
  const SPIN = { [F.sphere]: .06, [F.orbit]: .09, [F.cycle]: .025, [F.shield]: .03, [F.final]: .12, [F.logo]: 0 };
  function hiFor(f) { const h = [0, 0, 0, 0, 0, 0, 0, 0];
    const set = (k, v) => { if (k >= 0 && k < 4) h[k] = v; };
    if (f === F.sphere) set(active.know, 1);
    else if (OSC[f]) { h[1] = .35; }
    else if (f === F.cycle) set(active.cycle, .6);
    else if (f === F.orbit) { const tabs = document.querySelectorAll('#xpTabs [role="tab"]'); tabs.forEach((t, i) => { if (t.getAttribute("aria-selected") === "true") set(i, 1); }); }
    else if (f === F.venue) { if (active.venue === 0) h[0] = h[1] = h[2] = h[3] = .45; if (active.venue >= 1) h[2] = 1; if (active.venue === 2) h[6] = 1; }
    else if (f === F.arch) { const k = Math.floor((now() * .45) % 4); set(k, .9); }
    else if (f === F.shield) { set(active.shield, 1); h[4] = .25; }
    else if (f === F.logo) h[0] = .2;
    return h; }
  const now = () => (RM ? 0 : (performance.now() - t0) / 1000);

  function render() {
    const tm = now(), light = root.classList.contains("theme-light"), P = light ? PAL.light : PAL.dark;
    const fr = frameAt(smoothY); if (!fr) return;
    const fadeK = lerp(fr.a.fade == null ? 1 : fr.a.fade, fr.b.fade == null ? 1 : fr.b.fade, ease(fr.t));
    const te = ease(fr.t), cam = { e: lerp3(fr.a.cam[0], fr.b.cam[0], te), c: lerp3(fr.a.cam[1], fr.b.cam[1], te) };
    let fa = fr.a.f, fb = fr.b.f, mix = fa === fb ? 0 : fr.t;
    const pa = place(fa), pb = place(fb);
    let rotA = fr.a.rot + (SPIN[fa] || 0) * tm + osc(fa, tm), rotB = fr.b.rot + (SPIN[fb] || 0) * tm + osc(fb, tm);
    let TA = pa, TB = pb;
    if (fa === fb) { const r = lerp(fr.a.rot, fr.b.rot, te) + (SPIN[fa] || 0) * tm + osc(fa, tm); rotA = rotB = r; }
    /* intro: el logo KNET se disuelve en el auditorio */
    if (intro < 1 && fa === F.aud && fb === F.aud) { fa = F.logo; TA = place(F.logo); rotA = 0; mix = ease((intro - .32) / .68); cam.e = lerp3([0, .6, 13], cam.e, ease(intro)); cam.c = lerp3([0, .4, 0], cam.c, ease(intro)); }
    if (!WIDE) { cam.e = [cam.e[0] * .6, cam.e[1], cam.e[2] * 1.18]; cam.c = [cam.c[0] * .6, cam.c[1], cam.c[2]]; }
    cam.e[0] += mx * .5; cam.e[1] -= my * .3;
    const proj = persp((WIDE ? 42 : 52) * Math.PI / 180, cv.width / cv.height, .1, 80), view = look(cam.e, cam.c, [0, 1, 0]), VP = mul(proj, view);
    const px = cv.height * .9;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
    const add = () => gl.blendFunc(gl.SRC_ALPHA, light ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE);
    add();
    const wOf = (f) => (fa === f ? 1 - (fa === fb ? 0 : ease(mix)) : 0) + (fb === f && fa !== fb ? ease(mix) : 0);
    const TF = (f) => (f === fa ? [TA, rotA] : [TB, rotB]);
    /* líneas */
    gl.useProgram(PL.p); gl.uniformMatrix4fv(PL.u.uVP, false, VP); gl.uniform3fv(PL.u.uCol, P.line);
    Object.keys(LB).forEach(k => { const f = LINE_FORM[k], w = wOf(f); if (w < .01) return; const [T, r] = TF(f);
      gl.uniform4f(PL.u.uT, T[0], T[1], T[2], T[3]); gl.uniform1f(PL.u.uR, r); gl.uniform1f(PL.u.uA, w * (light ? .35 : .32) * (k === "aud" ? .7 + .3 * Math.sin(tm * .8) : 1));
      gl.bindBuffer(gl.ARRAY_BUFFER, LB[k].b); gl.enableVertexAttribArray(PL.a.aL); gl.vertexAttribPointer(PL.a.aL, 4, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.LINES, 0, LB[k].n); });
    gl.disableVertexAttribArray(PL.a.aL);
    /* mallas */
    gl.useProgram(PM.p); gl.uniformMatrix4fv(PM.u.uVP, false, VP); gl.uniform3fv(PM.u.uEye, cam.e); gl.uniform1f(PM.u.uLight, light ? 1 : 0); gl.uniform1f(PM.u.uTime, tm);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const drawMesh = (b, n, M, inC, rim, a, scan) => { gl.uniformMatrix4fv(PM.u.uM, false, M); gl.uniform3fv(PM.u.uIn, inC); gl.uniform3fv(PM.u.uRim, rim); gl.uniform1f(PM.u.uA, a); gl.uniform1f(PM.u.uScan, scan || 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(PM.a.aP); gl.vertexAttribPointer(PM.a.aP, 3, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(PM.a.aN); gl.vertexAttribPointer(PM.a.aN, 3, gl.FLOAT, false, 24, 12); gl.drawArrays(gl.TRIANGLES, 0, n); };
    const CORE = { [F.sphere]: .95, [F.orbit]: .8, [F.shield]: .7, [F.final]: 1.05 };
    Object.keys(CORE).forEach(fk => { const f = +fk, w = wOf(f); if (w < .01) return; const [T, r] = TF(f), s = CORE[f] * T[3] * (1 + .04 * Math.sin(tm * 1.8));
      drawMesh(ICOB, ICON, model([T[0], T[1], T[2]], r, s, s, s), P.coreIn, P.coreRim, w * fadeK * (light ? .75 : .55), light ? 0 : 1);
      if (f === F.sphere && !light) drawMesh(ICOB, ICON, model([T[0], T[1], T[2]], -r, SPH_R * T[3] * 1.02, SPH_R * T[3] * 1.02, SPH_R * T[3] * 1.02), P.coreIn, P.coreRim, w * .12, 0); });
    { const w = wOf(F.aud); if (w > .01) { const T = TF(F.aud)[0];
      drawMesh(BOXB, BOXN, model([T[0], T[1] + 1.65, T[2] - 6.55], 0, 3.3, 1.4, .02), light ? P.roomIn : [.32, .05, .55], P.coreRim, w * (light ? .5 : .55), light ? 0 : 1);
      drawMesh(ICOB, ICON, model([T[0], T[1] - 1.66, T[2] - 4.9], 0, 3.7, .04, 1.25), P.coreIn, P.coreRim, w * (light ? .45 : .5), 0); } }
    { const w = wOf(F.shield); if (w > .01) { const [T, r] = TF(F.shield), s = SH_R * T[3] * 1.01, pulse = .5 + .5 * Math.sin(tm * 1.4); drawMesh(ICOB, ICON, model([T[0], T[1], T[2]], r, s, s, s), P.roomIn, P.coreRim, w * (light ? .32 : .2 + .08 * pulse), light ? 0 : 1); } }
    { const w = wOf(F.venue); if (w > .01) { const [T, r] = TF(F.venue), s = T[3];
      const at = (x, y, z) => { const c = Math.cos(r), sn = Math.sin(r); return [T[0] + (c * x + sn * z) * s, T[1] + y * s, T[2] + (-sn * x + c * z) * s]; };
      drawMesh(BOXB, BOXN, model(at(0, FLOOR_Y - .07, 0), r, 5.4 * s, .06 * s, 3.9 * s), P.roomIn, P.roomRim, w * (light ? .55 : .35), 0);
      ROOMS.forEach(rm => { const cx = (rm[1] + rm[2]) / 2, cz = (rm[3] + rm[4]) / 2, hh = rm[5] / 2, hi = rm[6] === 2 && active.venue >= 1 ? 1 : 0;
        drawMesh(BOXB, BOXN, model(at(cx, FLOOR_Y + hh, cz), r, (rm[2] - rm[1]) / 2 * s, hh * s, (rm[4] - rm[3]) / 2 * s), P.roomIn, hi ? P.hot : P.roomRim, w * (light ? .42 : .3) * (1 + hi * .6), hi && !light ? 1 : 0); }); } }
    gl.disableVertexAttribArray(PM.a.aP); gl.disableVertexAttribArray(PM.a.aN); gl.disable(gl.CULL_FACE);
    /* partículas */
    add(); gl.useProgram(PP.p); const u = PP.u;
    gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniform4f(u.uTA, TA[0], TA[1], TA[2], TA[3]); gl.uniform4f(u.uTB, TB[0], TB[1], TB[2], TB[3]);
    gl.uniform1f(u.uRA, rotA); gl.uniform1f(u.uRB, rotB); gl.uniform1f(u.uMix, fa === fb ? 0 : mix); gl.uniform1f(u.uTime, tm);
    const hA = hiFor(fa), hB = hiFor(fb), HI = hA.map((v, i) => fa === fb ? v : Math.max(v * (1 - mix), hB[i] * mix)); gl.uniform4f(u.uH0, HI[0], HI[1], HI[2], HI[3]); gl.uniform4f(u.uH1, HI[4], HI[5], HI[6], HI[7]);
    const alOf = (f) => (f === F.floor ? .5 : f === F.chaos ? .85 : OSC[f] ? (light ? 1 : .78) : f === F.cycle ? (light ? .9 : .72) : 1) * P.alpha;
    gl.uniform1f(u.uAlA, alOf(fa) * fadeK); gl.uniform1f(u.uAlB, alOf(fb) * fadeK); gl.uniform1f(u.uSize, P.size * (SMALL ? 1.15 : 1)); gl.uniform1f(u.uPx, px);
    gl.uniform3fv(u.uC1, P.c1); gl.uniform3fv(u.uC2, P.c2); gl.uniform3fv(u.uC3, P.c3); gl.uniform3fv(u.uC4, P.c4); gl.uniform3fv(u.uHot, P.hot); gl.uniform1f(u.uLight, light ? 1 : 0); gl.uniform1f(u.uLightV, light ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, FB[fa]); gl.enableVertexAttribArray(PP.a.aA); gl.vertexAttribPointer(PP.a.aA, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, FB[fb]); gl.enableVertexAttribArray(PP.a.aB); gl.vertexAttribPointer(PP.a.aB, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, SB); gl.enableVertexAttribArray(PP.a.aSeed); gl.vertexAttribPointer(PP.a.aSeed, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, N);
    gl.disableVertexAttribArray(PP.a.aA); gl.disableVertexAttribArray(PP.a.aB); gl.disableVertexAttribArray(PP.a.aSeed);
    /* recinto vivo: ruta luminosa, asistentes y tótems */
    const wv = wOf(F.venue); let nd = 0;
    if (wv > .01) { const [T, r] = TF(F.venue), s = T[3], c = Math.cos(r), sn = Math.sin(r);
      const at = (x, y, z) => [T[0] + (c * x + sn * z) * s, T[1] + y * s, T[2] + (-sn * x + c * z) * s];
      const push = (p, col, a, size) => { if (nd >= DMAX) return; DYN.set([p[0], p[1], p[2], col[0], col[1], col[2], a * wv, size], nd * 8); nd++; };
      const rp = clamp((pinP.venue - .3) / .3, 0, 1) || (RM ? 1 : 0), dTot = routeLen * rp;
      for (let d = 0; d <= dTot; d += .09) { const q = routeAt(d); push(at(q[0], FLOOR_Y + .05, q[1]), P.c4, light ? .9 : .95, .11); }
      if (rp > 0) { const q = routeAt(dTot), pul = .5 + .5 * Math.sin(tm * 5); push(at(q[0], FLOOR_Y + .1, q[1]), P.hot, .9, .32 + pul * .2); }
      const dt = Math.min(.05, (performance.now() - last) / 1000);
      people.forEach(pp => { if (!pp.t || Math.hypot(pp.t[0] - pp.p[0], pp.t[1] - pp.p[1]) < .05) { const rm = ROOMS[Math.floor(R() * ROOMS.length)]; pp.t = R() < .35 ? [rr(-4.8, 4.8), rr(.6, 1.4)] : [rr(rm[1] + .2, rm[2] - .2), rr(rm[3] + .2, rm[4] - .2)]; }
        if (!RM) { const dx = pp.t[0] - pp.p[0], dz = pp.t[1] - pp.p[1], l = Math.hypot(dx, dz) || 1; pp.p[0] += dx / l * pp.sp * dt; pp.p[1] += dz / l * pp.sp * dt; }
        push(at(pp.p[0], FLOOR_Y + .08, pp.p[1]), light ? P.c3 : P.c3, .85, .1); });
      TOTEMS.forEach((tt, i) => { const ph = (tm * .8 + i * .37) % 1; push(at(tt[0], FLOOR_Y + .62, tt[1]), P.c4, (active.venue === 2 ? 1 : .6) * (1 - ph), .25 + ph * (active.venue === 2 ? .9 : .4)); });
      /* etiquetas */
      if (vLabels.length) { const box = pinEls.venue.querySelector(".cine-sticky").getBoundingClientRect();
        vLabels.forEach(el => { const k = el.dataset.vl, p = VL_POS[k]; if (!p) return; const w = at(p[0], p[1], p[2]), cp = [0, 0, 0, 0];
          for (let r2 = 0; r2 < 4; r2++) cp[r2] = VP[r2] * w[0] + VP[4 + r2] * w[1] + VP[8 + r2] * w[2] + VP[12 + r2];
          const x = (cp[0] / cp[3] * .5 + .5) * W, y = (1 - (cp[1] / cp[3] * .5 + .5)) * H - box.top;
          const vis = k === "route" ? (rp > .98 ? 1 : 0) : (active.venue === 0 || (k === "labs") ? 1 : .35);
          el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; el.style.opacity = (wv > .6 ? vis : 0).toFixed(2); }); }
    } else if (vLabels.length) vLabels.forEach(el => el.style.opacity = "0");
    const wa = wOf(F.arch);
    if (wa > .01) { const [T, r] = TF(F.arch), s = T[3];
      const push = (p, col, a, size) => { if (nd >= DMAX) return; DYN.set([p[0], p[1], p[2], col[0], col[1], col[2], a * wa, size], nd * 8); nd++; };
      for (let k = 0; k < 14; k++) { const ok = k % 3 !== 0, ph = ((RM ? .5 : tm) * .16 + k / 14) % 1; let x = lerp(ARX[0] + .9, ARX[3] - .9, ph), a = 1;
        if (!ok && x > ARX[1] - .7) { a = Math.max(0, 1 - (x - (ARX[1] - .7)) / .35); x = ARX[1] - .7; }
        if (a <= 0) continue; const y = ((k * 37) % 5 - 2) * .045;
        push([T[0] + x * s, T[1] + y * s, T[2]], ok ? P.c4 : P.c3, (light ? .85 : .75) * a, .15); } }
    const wc = wOf(F.cycle);
    if (wc > .01) { const [T, r] = TF(F.cycle), s = T[3], c = Math.cos(r), sn = Math.sin(r);
      const at = (x, y, z) => [T[0] + (c * x + sn * z) * s, T[1] + y * s, T[2] + (-sn * x + c * z) * s];
      const push = (p, col, a, size) => { if (nd >= DMAX) return; DYN.set([p[0], p[1], p[2], col[0], col[1], col[2], a * wc, size], nd * 8); nd++; };
      const sp = RM ? 3 : clamp((pinP.cycle - .08) / .84, 0, 1) * 3.7;
      for (let k = 0; k < 34; k++) { const aa = Math.PI + (sp - k * .045) * Math.PI / 2; if (sp - k * .045 < -.05) break; const fade = 1 - k / 34;
        push(at(Math.cos(aa) * CYC_R, 0, -Math.sin(aa) * CYC_R), k === 0 ? P.c2 : P.c4, (light ? .7 : .6) * fade, k === 0 ? .26 + .05 * Math.sin(tm * 6) : .11 * fade + .04); }
      if (cLabels.length) { const box = pinEls.cycle.querySelector(".cine-sticky").getBoundingClientRect();
        cLabels.forEach(el => { const k = +el.dataset.cl, n = cycNode(k), w = at(n[0], n[1] + 1.05, n[2]), cp = [0, 0, 0, 0];
          for (let r2 = 0; r2 < 4; r2++) cp[r2] = VP[r2] * w[0] + VP[4 + r2] * w[1] + VP[8 + r2] * w[2] + VP[12 + r2];
          el.style.transform = `translate(${((cp[0] / cp[3] * .5 + .5) * W).toFixed(1)}px,${((1 - (cp[1] / cp[3] * .5 + .5)) * H - box.top).toFixed(1)}px)`;
          el.style.opacity = wc > .6 ? (k <= active.cycle ? 1 : .45) : 0; el.classList.toggle("vl-hot", k === active.cycle); }); }
    } else if (cLabels.length) cLabels.forEach(el => el.style.opacity = "0");
    if (nd) { gl.useProgram(PD.p); gl.uniformMatrix4fv(PD.u.uVP, false, VP); gl.uniform1f(PD.u.uPx, px); gl.uniform1f(PD.u.uLight, light ? 1 : 0);
      gl.blendFunc(gl.SRC_ALPHA, light ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE);
      gl.bindBuffer(gl.ARRAY_BUFFER, DB); gl.bufferSubData(gl.ARRAY_BUFFER, 0, DYN.subarray(0, nd * 8));
      gl.enableVertexAttribArray(PD.a.aP); gl.vertexAttribPointer(PD.a.aP, 3, gl.FLOAT, false, 32, 0); gl.enableVertexAttribArray(PD.a.aC); gl.vertexAttribPointer(PD.a.aC, 4, gl.FLOAT, false, 32, 12); gl.enableVertexAttribArray(PD.a.aS); gl.vertexAttribPointer(PD.a.aS, 1, gl.FLOAT, false, 32, 28);
      gl.drawArrays(gl.POINTS, 0, nd); gl.disableVertexAttribArray(PD.a.aP); gl.disableVertexAttribArray(PD.a.aC); gl.disableVertexAttribArray(PD.a.aS); }
  }

  let raf = 0;
  function loop(ts) {
    raf = 0; if (!running) return;
    if (document.hidden || document.body.classList.contains("is-app")) { last = ts; return; }
    const dt = Math.min(.1, (ts - last) / 1000);
    const target = window.scrollY; smoothY = RM ? target : smoothY + (target - smoothY) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - smoothY) < .3) smoothY = target;
    mx += (tmx - mx) * (1 - Math.exp(-dt * 2.5)); my += (tmy - my) * (1 - Math.exp(-dt * 2.5));
    if (intro < 1) intro = Math.min(1, intro + dt / 3.2);
    syncSteps(smoothY); render(); last = ts; dirty = false;
    /* control de FPS: baja la resolución si el equipo va justo */
    if (!RM) { if (dt > .028) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1); if (slowFrames > 45 && QUALITY > .6) { QUALITY *= .8; slowFrames = 0; layout(); } }
    if (!RM || dirty || Math.abs(target - smoothY) > .3) kick();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  if (RM) { window.addEventListener("scroll", kick, { passive: true }); new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ["class"] }); }
  new MutationObserver(() => { if (!document.body.classList.contains("is-app")) { layout(); cacheTops(); kick(); } }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const start = () => { layout(); cacheTops(); kick(); };
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
  start();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const tp = textPts("KNET"); const a = FORMS[0]; for (let i = 0; i < N; i++) { if (i / N > .9) continue; const p = tp[Math.floor(R() * tp.length)]; a[i * 4] = p[0] + rr(-.02, .02); a[i * 4 + 1] = p[1] + rr(-.02, .02); a[i * 4 + 3] = p[2]; } gl.bindBuffer(gl.ARRAY_BUFFER, FB[0]); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW); kick(); });
  /* 4 experiencias: el scroll cambia de pestaña */
  (function xpScroll() {
    const pin = document.getElementById("chXp"), tl = document.getElementById("xpTabs"); if (!pin || !tl || RM) return;
    let lastIdx = -1, q = 0;
    const tick = () => { q = 0; const vh = window.innerHeight, len = pin.offsetHeight - vh; if (len < vh * .8) { lastIdx = -1; return; }
      const p = clamp((-pin.getBoundingClientRect().top) / len, 0, .9999), tabs = tl.querySelectorAll(".xp-tab"); if (!tabs.length) return;
      const idx = Math.floor(p * tabs.length); tl.style.setProperty("--xpp", (((p * tabs.length) % 1) * 100).toFixed(1) + "%");
      if (idx !== lastIdx) { lastIdx = idx; if (tabs[idx].getAttribute("aria-selected") !== "true") tabs[idx].click(); } };
    window.addEventListener("scroll", () => { if (!q) q = requestAnimationFrame(tick); }, { passive: true }); tick();
  })();
  /* Logo del footer: reutiliza el de la barra superior */
  (function ftLogo() { const src = document.querySelector("img.nav-logo"), dst = document.querySelector("img.ft-logo"); if (src && dst) { dst.src = src.src; dst.hidden = false; } })();
  /* Ajuste automático: que el simulador y las 4 experiencias quepan en la pantalla del portátil */
  (function autoFit() {
    const items = [
      { el: document.querySelector("#chXp .wrap"), watch: document.getElementById("xpStage"), avail: () => window.innerHeight - (window.innerWidth >= 960 ? 64 : 0) - 24, max: .92 },
      { el: document.querySelector("#demo > .wrap"), watch: document.getElementById("app"), avail: () => window.innerHeight - ((document.getElementById("nav") || {}).offsetHeight || 80) - 28, max: .92, min: .7 }
    ].filter(x => x.el);
    items.forEach(it => { it.z = it.max; });
    const fit = (it, reset) => {
      if (window.innerWidth < 1024) { it.el.style.zoom = ""; return; }
      if (reset) it.z = it.max;
      it.el.style.zoom = it.z; const h = it.el.getBoundingClientRect().height; if (!h) return;
      const z = clamp(it.z * it.avail() / h, it.min || .6, it.max); if (z < it.z - .005) { it.z = z; it.el.style.zoom = z.toFixed(3); }
    };
    let t; const all = (reset) => { clearTimeout(t); t = setTimeout(() => { items.forEach(it => fit(it, reset)); if (window.KNET_CINE) window.KNET_CINE.relayout(); }, 60); };
    items.forEach(it => { if (it.watch) new MutationObserver(() => all(false)).observe(it.watch, { childList: true, subtree: true }); });
    window.addEventListener("resize", () => all(true)); all(true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => all(true));
    window.addEventListener("load", () => { all(true); setTimeout(() => all(true), 900); });
  })();
  window.KNET_CINE = { dbg: () => ({ intro, smoothY, W, H, cw: cv.width, stops: STOPS.map(s => [Math.round(s.y), FN[s.f]]) }), relayout: () => { layout(); cacheTops(); kick(); } };
}
