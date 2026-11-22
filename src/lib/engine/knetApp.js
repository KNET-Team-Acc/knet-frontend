/* KNET · motor de la app (panel SPA, simulador, experiencias, equipo, PDF del Dossier, etc.).
   Toma el DOM que React ya montó y lo hace interactivo. Sus datos viven en src/data. */
import { VIDEO_URL, DUR, KEY, EXP_XP, LEGAL, APP_VERSION, SIC_URL, DOC_HASH, CONSENT_KEY, PREF_KEY } from "@/data/config.js";
import { TEAM } from "@/data/team.js";
import { P } from "@/data/icons.js";
import { IND, OBJ, PERSONAS, MATCH_INFO, OTHERS, SENIORITY } from "@/data/industries.js";
import { LEVELS, LVL_META, BADGES, XPS, ACTIONS, COMMON_M, FRAMES, GROUP_M, EXPS } from "@/data/gamification.js";
import { AI_ANS, INSIGHTS, STEP_C, SRC_INFO, G_ROLES, G_SING, G_SUGGEST, G_WHY, HX_TYPE, TAG_IDEA, SUM_INFO } from "@/data/insights.js";
import { SCENES, VENUES, GROUND } from "@/data/venues.js";
import { SUMMIT_POOL, EVENTS, EV_DAYS, COL_OUTLINE, CO_CITIES, SPEAKER_NAMES, EV_SPEAKERS, EV_INFO, NE_TYPES, NE_CITIES } from "@/data/events.js";
import { TABS, TAB_DESC, PILLS, I18N, DM_PILLS, TOUR, NOTIF_T } from "@/data/navigation.js";
import { P_FIELDS, evtTypeLbl, LI_FIELDS, LI_AUTH_TXT, PERM_SCOPES } from "@/data/privacy.js";
import { COFFEE_SLOTS, QR_PLACES } from "@/data/networking.js";
import { AV_SKIN, AV_HAIRC, AV_OUT, AV_HAIR, AV_ACC, AV_XHAIR, AV_XACC, AV_GENDER } from "@/data/avatar.js";
import { SV_ASPECTS, SV_BEST, SV_FACES } from "@/data/survey.js";
import { PDF_MAP, PDF_FONTS } from "@/data/pdf-fonts.js";
import { api, ApiError, isOffline, getUserId } from "@/services/api.js";

/**
 * Arranca KNET sobre el DOM renderizado por React. Llamar una sola vez.
 */
export function bootKnetApp() {
  /* ---------- Config editable ---------- */
   // Pega aquí el enlace (YouTube, Drive…) del video del Reto 03.
  

  /* ---------- Icons ---------- */
  
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n] || P.spark}"/></svg>`;
  const hydrate = (root = document) => root.querySelectorAll("i[data-i]").forEach(el => { if (!el.dataset.done) { el.innerHTML = svg(el.dataset.i); el.dataset.done = 1; el.setAttribute("aria-hidden", "true"); } });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => n.toLocaleString("es-CO");
  const sleep = (ms) => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menuBtn = $("#menuBtn"), mobileMenu = $("#mobileMenu");
  menuBtn.addEventListener("click", () => { const open = mobileMenu.hidden; mobileMenu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); });
  $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => { mobileMenu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }));

  /* ---------- Hero: lights flicker + network ---------- */
  const heroTitle = $("#heroTitle");
  if (!reduce) setTimeout(() => { heroTitle.classList.replace("lights-on", "lights-out"); }, 1400);

  const cv = $("#net");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d"); let W, H, pts = [], raf;
    const resize = () => { const r = cv.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(Math.min(70, W * H / 16000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, c: Math.random() < .15 ? "6,182,212" : Math.random() < .3 ? "16,185,129" : "167,139,250" })); };
    const tick = () => { ctx.clearRect(0, 0, W, H);
      for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 15000) { ctx.strokeStyle = `rgba(161,0,255,${.16 * (1 - d / 15000)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      for (const p of pts) { ctx.fillStyle = `rgba(${p.c},.7)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(tick); };
    resize(); tick(); window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); tick(); });
  }

  /* ---------- Toasts ---------- */
  const toast = (html, icon = "check") => {
    const t = document.createElement("div"); t.className = "toast";
    t.innerHTML = `<span class="ico-tile" style="width:32px;height:32px;border-radius:10px;background:rgba(16,185,129,.18);color:var(--t-emerald)">${svg(icon)}</span><div>${html}</div>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, 2800);
  };

  /* ---------- Data ---------- */
  
  
  
  /* Insignias de nivel estilo videojuego: escudo con material por rango, estrella central, alas y cinta en los rangos altos */
  
  let lbN = 0;
  const starPts = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`; }).join(" ");
  function lvlBadge(n, size = 48, locked = false) {
    const k = Math.min(Math.max(n, 1), LVL_META.length), m = LVL_META[k - 1], id = "lb" + (lbN++);
    const SH = "M50 12 L77 21 Q80 49 72 65 Q63 81 50 89 Q37 81 28 65 Q20 49 23 21 Z";
    const g = (gid, [c1, c2], vert) => `<linearGradient id="${id}${gid}" x1="0" y1="0" x2="${vert ? 0 : 1}" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
    const feathers = (side) => [[48, 31, 30], [32, 36, 27], [16, 42, 23], [2, 48, 19]].map(([ang, ay, len]) => { const ax = side < 0 ? 33 : 67;
      return `<ellipse cx="${ax + side * len * .5}" cy="${ay}" rx="${len * .52}" ry="4.4" transform="rotate(${side < 0 ? ang : -ang} ${ax} ${ay})" fill="url(#${id}w)" stroke="rgba(10,7,16,.35)" stroke-width=".8"/>`; }).reverse().join("");
    const st = starPts(50, 49, 15.5, 6.6), half = starPts(50, 49, 15.5, 6.6).split(" ");
    const facets = half.filter((_, i) => i % 2 === 0).map((pt, i) => { const [x, y] = pt.split(","); const nx = half[(i * 2 + 1) % 10].split(","); return `<path d="M50 49 L${x} ${y} L${nx[0]} ${nx[1]} Z" fill="rgba(0,0,0,.18)"/>`; }).join("");
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="lvl-badge ${locked ? "locked" : ""}" role="img" aria-label="Insignia de nivel ${k}: ${LEVELS[k - 1]}">
      <defs>${g("f", m.face)}${g("r", m.rim)}${g("s", m.star, true)}${m.wings ? g("w", m.wings) : ""}${m.ribbon ? g("b", m.ribbon, true) : ""}
        <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <clipPath id="${id}c"><path d="${SH}" transform="translate(50 50) scale(.84) translate(-50 -50)"/></clipPath>
        ${m.glow ? `<radialGradient id="${id}g"><stop stop-color="${m.glow}" stop-opacity=".55"/><stop offset="1" stop-color="${m.glow}" stop-opacity="0"/></radialGradient>` : ""}</defs>
      ${m.glow ? `<circle cx="50" cy="50" r="46" fill="url(#${id}g)"/>` : ""}
      ${m.ribbon ? `<path d="M38 70 L62 70 L62 99 L50 92 L38 99 Z" fill="url(#${id}b)" stroke="${m.rim[1]}" stroke-width="1.5" stroke-linejoin="round"/><path d="M38 91 L50 84 L62 91" fill="none" stroke="${m.rim[0]}" stroke-width="2"/>` : ""}
      ${m.wings ? `<g>${feathers(-1)}${feathers(1)}</g>` : ""}
      ${m.side ? `<path d="M23 50 L15 56 L25 59 Z M77 50 L85 56 L75 59 Z" fill="url(#${id}r)" stroke="rgba(10,7,16,.4)" stroke-width=".8"/>` : ""}
      ${m.spike ? `<path d="M50 3 L56 13 L44 13 Z" fill="url(#${id}r)" stroke="rgba(10,7,16,.4)" stroke-width=".8"/>` : ""}
      <path d="${SH}" fill="url(#${id}r)" stroke="rgba(10,7,16,.55)" stroke-width="1.2"/>
      <g clip-path="url(#${id}c)">
        <rect width="100" height="100" fill="url(#${id}f)"/>
        ${m.grain ? `<g fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.1"><path d="M30 24 Q38 40 32 58 Q28 72 36 84"/><path d="M62 18 Q56 34 64 48 Q72 62 62 82"/><ellipse cx="66" cy="62" rx="5" ry="8"/><path d="M44 18 Q48 30 44 40"/></g>` : ""}
        <rect x="50" width="50" height="100" fill="rgba(0,0,0,.16)"/>
        <rect width="100" height="100" fill="url(#${id}h)"/>
      </g>
      ${m.ring ? `<circle cx="50" cy="49" r="16.5" fill="none" stroke="url(#${id}s)" stroke-width="2.6"/>` : ""}
      <polygon points="${st}" fill="url(#${id}s)" stroke="rgba(10,7,16,.45)" stroke-width="1" stroke-linejoin="round"/>${facets}
      ${m.gems ? `<path d="M50 9 L53 13 L50 17 L47 13 Z M26 64 L29 67 L26 70 L23 67 Z M74 64 L77 67 L74 70 L71 67 Z" fill="#9DB4FF" stroke="#fff" stroke-width=".7"/>` : ""}
    </svg>`;
  }
  

  /* ---------- 4 Experiences ---------- */
  
  const stageHTML = {
    onb: () => `
      <div class="flex items-center justify-between gap-3 flex-wrap"><span class="chip chip-cyan">${svg("link")}Paso 1 de 3 · Perfil</span><span class="mono text-[12px] text-mute">linkedin-mcp · profile.read</span></div>
      <div class="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div class="lm-card rounded-2xl p-5 bg-white/[.04] border border-white/10">
          <div class="lm-cover" aria-hidden="true"></div><div class="flex gap-3 items-center"><div class="lm-av" aria-hidden="true"><svg viewBox="0 0 64 64" width="56" height="56"><defs><linearGradient id="lmBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C77DFF"/><stop offset="1" stop-color="#5B1FA6"/></linearGradient><clipPath id="lmClip"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#lmClip)"><rect width="64" height="64" fill="url(#lmBg)"/><path d="M17 33c0-12 6-20 15-20s15 8 15 20v14H17z" fill="#2B1630"/><path d="M27 41h10v8H27z" fill="#D9A07F"/><path d="M8 64c2-11 11-16 24-16s22 5 24 16z" fill="#2E1550"/><path d="M26 48l6 9 6-9" fill="#F5F1FA"/><ellipse cx="32" cy="31" rx="10" ry="12" fill="#E8B796"/><path d="M21 30c1-10 6-14 12-14 6 0 10 4 11 11-5-1-9-4-11-8-2 5-6 9-12 11z" fill="#2B1630"/><circle cx="28" cy="32" r="1.2" fill="#2B1630"/><circle cx="36" cy="32" r="1.2" fill="#2B1630"/><path d="M29.5 37.5c1.6 1.2 3.4 1.2 5 0" stroke="#A0524B" stroke-width="1.3" fill="none" stroke-linecap="round"/></g></svg><span class="lm-in">in</span></div><div><div class="font-semibold flex items-center gap-1.5">Laura Méndez<span class="lm-ok" aria-label="Perfil verificado">${svg("check")}</span></div><div class="text-mute text-[13px]">VP de Plataforma en Retail Andino</div></div></div>
          <div class="mt-4 grid gap-1.5 text-[13px] text-mute"><div class="h-2 rounded bg-white/10 w-11/12"></div><div class="h-2 rounded bg-white/10 w-9/12"></div><div class="h-2 rounded bg-white/10 w-10/12"></div></div>
          <div class="flex flex-wrap gap-1.5 mt-4"><span class="chip">Kubernetes</span><span class="chip">ML Ops</span><span class="chip">Liderazgo</span></div>
        </div>
        <div class="flex md:flex-col items-center justify-center gap-2 text-accentsoft"><span class="mono text-[11px] text-mute">MCP</span><span class="ico" style="width:28px;height:28px">${svg("arrow")}</span></div>
        <div class="grid gap-2">
          <div class="field"><span class="text-mute">Rol</span><b>VP de Plataforma</b></div>
          <div class="field"><span class="text-mute">Industria</span><b>Retail</b></div>
          <div class="field"><span class="text-mute">Seniority</span><b>Directivo</b></div>
          <div class="field"><span class="text-mute">Intereses</span><b>Agentes · RAG · Datos</b></div>
        </div>
      </div>
      <div class="rounded-2xl p-4 flex gap-3 items-start" style="background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.3)"><span class="ico" style="color:var(--t-emerald)">${svg("check")}</span><div class="text-[14px]"><b>Perfil listo en 2,1 s.</b> <span class="text-mute">4 campos autorizados, 0 escritos a mano. La red de contactos quedó sin compartir por decisión del asistente.</span></div></div>`,
    gam: () => `
      <div class="flex items-center justify-between gap-3 flex-wrap"><span class="chip chip-emerald">${svg("trophy")}Quest Profile</span><span class="mono text-[12px] text-mute">Temporada: Summit 2026</span></div>
      <div class="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <div class="relative mx-auto" style="width:132px;height:132px">
          <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden="true"><circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/><circle cx="60" cy="60" r="52" stroke="url(#rg)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="117.6" transform="rotate(-90 60 60)"/><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10B981"/><stop offset="1" stop-color="#3D6BFF"/></linearGradient></defs></svg>
          <div class="absolute inset-0 grid place-items-center text-center"><div><div class="font-display font-extrabold text-3xl">4</div><div class="mono text-[11px] text-mute">NIVEL</div></div></div>
        </div>
        <div class="grid gap-2 min-w-0">
          <div class="flex justify-between"><span class="font-semibold">Nivel 4 · Arquitecto</span><span class="mono text-[color:var(--t-emerald)] tabular">1.640 / 2.000 XP</span></div>
          <div class="mission done"><span class="ico-tile" style="width:40px;height:40px;background:rgba(16,185,129,.18);color:var(--t-emerald)">${svg("check")}</span><div class="min-w-0"><div class="font-semibold text-[14px]">Check-in NFC en Keynote</div><div class="text-[12px] text-[color:var(--t-emerald)]">Completada</div></div><span class="mono text-[13px] text-[color:var(--t-emerald)]">+120</span></div>
          <div class="mission"><span class="ico-tile" style="width:40px;height:40px;background:rgba(61,107,255,.1);color:var(--t-blue)">${svg("quiz")}</span><div class="min-w-0"><div class="font-semibold text-[14px]">Quiz en vivo: RAG</div><div class="text-[12px] text-mute">Abierta · Sala Quantum</div></div><span class="mono text-[13px] text-mute">+80</span></div>
        </div>
      </div>
      <div class="lp-lvls" aria-label="Ruta de niveles">
        ${LEVELS.map((n, i) => { const got = i < 4, cur = i === 3; return `<div class="lp-lvl ${got ? "" : "locked"} ${cur ? "cur" : ""}">${lvlBadge(i + 1, 40, !got)}<div class="font-semibold leading-tight">${i + 1}. ${n}</div><div class="text-[11px] ${cur ? "" : "text-mute"}" ${cur ? 'style="color:var(--t-emerald)"' : ""}>${cur ? "Tu nivel actual" : got ? "Desbloqueado" : "Desde 2.000 XP · te faltan 360 XP"}</div></div>`; }).join("")}
      </div>`,
    ai: () => `
      <div class="flex items-center justify-between gap-3 flex-wrap"><span class="chip chip-accent">${svg("bot")}AI Concierge</span><span class="mono text-[12px] text-mute">RAG · 148 sesiones indexadas</span></div>
      <div class="grid gap-3" id="chatBox">
        <div class="bubble me">Tengo 40 minutos libres. ¿Qué me conviene?</div>
        <div class="bubble ai">Dos opciones: <b>“RAG que sí escala”</b> empieza en 8 min en Lab 3 (encaja con ML Ops), o un café con <b>Santiago A.</b> (Head de Data, 87% afinidad), que está libre hasta las 11:30.</div>
      </div>
      <div class="flex flex-wrap gap-2" id="aiPills">
        <button class="pill-btn" data-q="0">¿Quién está en la sala de al lado?</button>
        <button class="pill-btn" data-q="1">Resume el último keynote</button>
        <button class="pill-btn" data-q="2">Agenda el café con Santiago</button>
      </div>`,
    dos: () => `
      <div class="flex items-center justify-between gap-3 flex-wrap"><span class="chip" style="color:var(--t-lilac);border-color:rgba(117,0,192,.45);background:rgba(117,0,192,.12)">${svg("file")}Generado al cierre del Summit</span><span class="mono text-[12px] text-mute">Dossier · Laura Méndez</span></div>
      <div class="rounded-2xl p-5 sm:p-6 bg-white/[.035] border border-white/10 grid gap-5">
        <div><div class="mono text-[11px] text-mute uppercase tracking-[.12em]">Top aprendizajes</div>
          <ol class="mt-2 grid gap-1.5 text-[14px] list-decimal pl-5">
            <li>Evaluar agentes por tarea completada, no por precisión aislada. <span class="mono text-[11px] text-mute">Keynote · min 14</span></li>
            <li>MCP reduce integraciones punto a punto a un contrato por herramienta. <span class="mono text-[11px] text-mute">Lab 1 · min 32</span></li>
            <li>El costo de RAG se controla en la recuperación, no en el modelo. <span class="mono text-[11px] text-mute">Lab 3 · min 21</span></li>
          </ol></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><div class="mono text-[11px] text-mute uppercase tracking-[.12em]">Contactos clave</div>
            <ul class="mt-2 grid gap-1.5 text-[14px]"><li class="flex gap-2 items-center"><span class="ico" style="width:16px;height:16px;color:var(--t-blue)">${svg("users")}</span>Santiago A. · seguimiento RAG</li><li class="flex gap-2 items-center"><span class="ico" style="width:16px;height:16px;color:var(--t-blue)">${svg("users")}</span>Camila P. · design partner</li></ul></div>
          <div><div class="mono text-[11px] text-mute uppercase tracking-[.12em]">Plan de 30 días</div>
            <ul class="mt-2 grid gap-1.5 text-[14px]"><li class="flex gap-2 items-center"><span class="ico" style="width:16px;height:16px;color:var(--t-emerald)">${svg("target")}</span>Piloto MCP con 2 herramientas</li><li class="flex gap-2 items-center"><span class="ico" style="width:16px;height:16px;color:var(--t-emerald)">${svg("target")}</span>Benchmark de costos de RAG</li></ul></div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2"><span class="chip">${svg("file")}Exportable a PDF y CRM</span><span class="chip">${svg("clock")}Listo 15 min tras el cierre</span><span class="chip">${svg("star")}1.640 XP · 4 insignias</span></div>`
  };
  
  const tabs = $("#xpTabs"), stage = $("#xpStage");
  tabs.innerHTML = XPS.map((x, i) => `
    <button class="xp-tab" role="tab" id="xt-${x.id}" aria-controls="xpStage" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-x="${x.id}">
      <span class="ico-tile" style="background:rgba(${x.color},.14);color:${x.fg}">${svg(x.icon)}</span>
      <span class="min-w-0"><span class="mono text-[11px] text-mute block">Experiencia 0${i + 1}</span><span class="ttl block">${x.ttl}</span><span class="sub block">${x.sub}</span></span>
    </button>`).join("");
  const showXp = (id, focus) => {
    $$(".xp-tab", tabs).forEach(b => { const on = b.dataset.x === id; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    stage.setAttribute("aria-labelledby", "xt-" + id);
    stage.innerHTML = `<div class="grid gap-5 reveal-in">${stageHTML[id]()}</div>`;
    if (id === "ai") bindAiPills();
  };
  const bindAiPills = () => $$("#aiPills .pill-btn").forEach(b => b.addEventListener("click", async () => {
    const box = $("#chatBox"); const q = document.createElement("div"); q.className = "bubble me"; q.textContent = b.textContent; box.appendChild(q);
    b.disabled = true; b.style.opacity = .5;
    const a = document.createElement("div"); a.className = "bubble ai"; a.innerHTML = '<span class="caret mono text-mute">Pensando</span>'; box.appendChild(a);
    await sleep(700); a.innerHTML = AI_ANS[+b.dataset.q];
  }));
  tabs.addEventListener("click", e => { const b = e.target.closest(".xp-tab"); if (b) showXp(b.dataset.x); });
  tabs.addEventListener("keydown", e => {
    const list = $$(".xp-tab", tabs); const i = list.findIndex(b => b.getAttribute("aria-selected") === "true");
    if (["ArrowDown", "ArrowRight"].includes(e.key)) { e.preventDefault(); showXp(list[(i + 1) % list.length].dataset.x, true); }
    if (["ArrowUp", "ArrowLeft"].includes(e.key)) { e.preventDefault(); showXp(list[(i - 1 + list.length) % list.length].dataset.x, true); }
  });
  showXp("onb");

  /* ---------- Simulator ---------- */
  const S = { ind: "tech", obj: "negocios", xp: 0, done: new Set(), view: "agenda", busy: false, badges: new Set() };
  const indGrid = $("#indGrid");
  indGrid.innerHTML = Object.entries(IND).map(([k, v]) => `<button class="ind-btn" aria-pressed="${k === S.ind}" data-ind="${k}"><span class="t">${v.label}</span><span class="d">${v.desc}</span></button>`).join("");
  indGrid.addEventListener("click", e => { const b = e.target.closest(".ind-btn"); if (!b || S.busy) return; S.ind = b.dataset.ind; $$(".ind-btn", indGrid).forEach(x => x.setAttribute("aria-pressed", x === b)); generate(); });
  $("#objSel").addEventListener("change", e => { S.obj = e.target.value; if (!S.busy) generate(); });
  $("#genBtn").addEventListener("click", () => generate());

  const level = (xp) => Math.floor(xp / 500) + 1;
  const renderXp = () => {
    const lv = level(S.xp), into = S.xp % 500, pct = Math.round(into / 500 * 100);
    $("#xpBar").style.width = pct + "%"; $("#xpBarWrap").setAttribute("aria-valuenow", pct);
    $("#xpLabel").textContent = fmt(S.xp) + " XP";
    $("#lvlLabel").textContent = `Nivel ${lv} · ${LEVELS[Math.min(lv - 1, LEVELS.length - 1)]}`;
    $("#xpNext").textContent = `${fmt(500 - into)} XP para Nivel ${lv + 1}`;
    $("#badges").innerHTML = BADGES.map(b => { const on = S.xp >= b.at || (b.at === 1); return `<div class="badge-tile ${on ? "" : "locked"}"><div class="ico-tile" style="background:${on ? "rgba(16,185,129,.16);color:var(--t-emerald)" : "rgba(var(--w-rgb),.06);color:var(--muted)"}">${svg(on ? b.icon : "lock")}</div><div class="font-semibold leading-tight">${b.name}</div><div class="text-[11px] text-mute">${on ? "Obtenida" : b.at + " XP"}</div></div>`; }).join("");
  };
  const renderViews = (skeleton) => {
    const d = IND[S.ind];
    $("#appRole").textContent = d.role;
    $("#appInd").textContent = `${d.label} · Objetivo: ${OBJ[S.obj]}`;
    if (skeleton) {
      const sk = '<div class="h-[68px] rounded-xl bg-white/[.04] border border-white/10 shimmer"></div>';
      ["agenda", "misiones", "matches"].forEach(v => $("#view-" + v).innerHTML = sk + sk + sk);
      return;
    }
    $("#view-agenda").innerHTML = d.agenda.map(([t, k, ttl, room, why]) => `
      <div class="agenda-item"><div class="time tabular">${t}</div><div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2"><span class="chip">${k}</span><span class="text-[12px] text-mute flex items-center gap-1"><span class="ico" style="width:12px;height:12px">${svg("pin")}</span>${room}</span></div>
        <div class="font-semibold mt-1.5 leading-snug">${ttl}</div>
        <div class="text-[13px] text-accentsoft mt-1 flex gap-1.5 items-start"><span class="ico flex-none" style="width:14px;height:14px;margin-top:3px">${svg("spark")}</span><span>${why}</span></div>
      </div></div>`).join("");
    $("#view-misiones").innerHTML = `<p class="text-[13px] text-mute">Máximo 3 misiones activas, priorizadas por tu ubicación y agenda.</p>` + d.missions.map(([ic, ttl, sub, xp], i) => {
      const id = S.ind + i, done = S.done.has(id);
      return `<div class="mission ${done ? "done" : ""}" data-m="${id}">
        <span class="ico-tile" style="width:40px;height:40px;background:${done ? "rgba(16,185,129,.18);color:var(--t-emerald)" : "rgba(61,107,255,.1);color:var(--t-blue)"}">${svg(done ? "check" : ic)}</span>
        <div class="min-w-0"><div class="font-semibold text-[14px] leading-snug">${ttl}</div><div class="text-[12px] ${done ? "text-[color:var(--t-emerald)]" : "text-mute"}">${done ? "Completada · +" + xp + " XP" : sub + " · +" + xp + " XP"}</div></div>
        ${done ? `<span class="chip chip-emerald">${svg("check")}Hecho</span>` : `<button class="btn btn-emerald btn-sm" data-xp="${xp}" data-id="${id}" data-t="${ttl.replace(/"/g, "&quot;")}">Completar</button>`}
      </div>`; }).join("");
    $("#view-matches").innerHTML = d.matches.map(([ini, n, r, sc, why], i) => `
      <div class="match"><div class="avatar" style="background:${["linear-gradient(135deg,#A100FF,#7500C0)", "linear-gradient(135deg,#2F55E0,#7500C0)", "linear-gradient(135deg,#10B981,#2F55E0)"][i]}">${ini}</div>
        <div class="min-w-0"><div class="font-semibold text-[14px]">${n} <span class="text-mute font-normal">· ${r}</span></div><div class="text-[12px] text-mute">${S.obj === "talento" ? "Posible aliado: " : S.obj === "aprender" ? "Puede enseñarte: " : "Oportunidad: "}${why}</div></div>
        <span class="mono text-[13px] tabular text-[color:var(--t-blue)]">${sc}%</span></div>`).join("");
    $("#view-concierge").innerHTML = `
      <div class="grid gap-3" id="simChat"><div class="bubble ai">Hola. Tu agenda de ${d.label.toLowerCase()} está lista. ¿En qué te ayudo?</div></div>
      <div class="flex flex-wrap gap-2">${["¿Quién está en la sala de al lado?", "¿Dónde es mi próxima sesión?", "¿Qué misión me da más XP ahora?"].map((q, i) => `<button class="pill-btn" data-sq="${i}">${q}</button>`).join("")}</div>`;
  };
  const simAnswer = (i) => { const d = IND[S.ind]; const m = d.matches[0]; const a = d.agenda[0];
    const best = d.missions.map((x, k) => [x, S.ind + k]).filter(([, id]) => !S.done.has(id)).sort((p, q) => q[0][3] - p[0][3])[0];
    return [
      `En <b>Sala Orbit</b> está <b>${m[1]}</b> (${m[2]}, ${m[3]}% afinidad). ${m[4]}. ¿Te presento?`,
      `<b>${a[2]}</b> a las ${a[0]} en <b>${a[3]}</b>. Estás a 3 minutos caminando.`,
      best ? `“${best[0][1]}” te da <b>+${best[0][3]} XP</b>. Está en tu ruta hacia la próxima sesión.` : `Completaste todas tus misiones. Nuevas misiones se abren en el siguiente bloque.`
    ][i]; };

  $("#app").addEventListener("click", async e => {
    const tab = e.target.closest(".sim-tab");
    if (tab) { S.view = tab.dataset.view; $$(".sim-tab").forEach(t => t.setAttribute("aria-selected", t === tab)); ["agenda", "misiones", "matches", "concierge"].forEach(v => $("#view-" + v).hidden = v !== S.view); return; }
    const mb = e.target.closest("button[data-xp]");
    if (mb) {
      const xp = +mb.dataset.xp, before = level(S.xp);
      const r = mb.getBoundingClientRect(), host = $("#app").getBoundingClientRect();
      const pop = document.createElement("span"); pop.className = "xp-pop"; pop.textContent = "+" + xp + " XP"; pop.style.left = (r.left - host.left) + "px"; pop.style.top = (r.top - host.top - 8) + "px"; $("#app").appendChild(pop); setTimeout(() => pop.remove(), 1200);
      const prevBadges = BADGES.filter(b => S.xp >= b.at).length;
      S.done.add(mb.dataset.id); S.xp += xp; renderViews(); renderXp();
      toast(`<b>Misión completada</b> · ${mb.dataset.t}<div class="mono text-[color:var(--t-emerald)] text-[13px]">+${xp} XP</div>`);
      if (level(S.xp) > before) setTimeout(() => toast(`<b>¡Subiste a Nivel ${level(S.xp)}!</b> · ${LEVELS[Math.min(level(S.xp) - 1, LEVELS.length - 1)]}`, "trophy"), 500);
      const nowBadges = BADGES.filter(b => S.xp >= b.at);
      if (nowBadges.length > prevBadges) setTimeout(() => toast(`<b>Insignia desbloqueada:</b> ${nowBadges[nowBadges.length - 1].name}`, "star"), 900);
      return;
    }
    const sq = e.target.closest("button[data-sq]");
    if (sq) { const box = $("#simChat"); const q = document.createElement("div"); q.className = "bubble me"; q.textContent = sq.textContent; box.appendChild(q);
      const a = document.createElement("div"); a.className = "bubble ai"; a.innerHTML = '<span class="caret mono text-mute">Pensando</span>'; box.appendChild(a); await sleep(600); a.innerHTML = simAnswer(+sq.dataset.sq); }
  });

  const con = $("#console"), stateChip = $("#agentState");
  const line = async (html, wait = 380) => { const l = document.createElement("div"); l.innerHTML = html; con.appendChild(l); await sleep(wait); };
  async function generate(instant) {
    if (S.busy) return; S.busy = true; const d = IND[S.ind];
    $("#genBtn").disabled = true; stateChip.className = "chip chip-accent"; stateChip.innerHTML = svg("spark") + "Trabajando";
    con.innerHTML = ""; const t0 = performance.now();
    if (!instant) renderViews(true);
    const w = instant ? 0 : 380;
    await line(`<span class="p">▸</span> MCP <span class="k">profile.read</span> → rol: <b>${d.role}</b>`, w);
    await line(`<span class="p">▸</span> Industria detectada: <b>${d.label}</b> · objetivo: ${OBJ[S.obj]}`, w);
    await line(`<span class="p">▸</span> RAG: 148 sesiones indexadas → <span class="k">4 relevantes</span> sobre ${d.topic}`, w);
    await line(`<span class="p">▸</span> Matchmaking: 1.240 asistentes → <span class="k">3 conexiones</span>`, w);
    await line(`<span class="p">▸</span> Misiones contextuales: <span class="k">3 activas</span> (máx. 3)`, w);
    const secs = instant ? "1,8" : ((performance.now() - t0) / 1000).toFixed(1).replace(".", ",");
    await line(`<span class="ok">✓ Agenda lista en ${secs} s</span><span class="caret"></span>`, 0);
    renderViews(); renderXp();
    stateChip.className = "chip chip-emerald"; stateChip.innerHTML = svg("check") + "Listo";
    $("#genBtn").disabled = false; S.busy = false;
  }
  renderXp(); generate(true);

  /* ---------- Dynamic QR (ilustrativo) ---------- */
  const qr = $("#qr"), qctx = qr.getContext("2d"); let ttl = 30;
  const finder = (x, y) => { qctx.fillStyle = "#0A0710"; qctx.fillRect(x, y, 7, 7); qctx.fillStyle = "#fff"; qctx.fillRect(x + 1, y + 1, 5, 5); qctx.fillStyle = "#0A0710"; qctx.fillRect(x + 2, y + 2, 3, 3); };
  const drawQr = () => { qctx.fillStyle = "#fff"; qctx.fillRect(0, 0, 29, 29);
    for (let y = 1; y < 28; y++) for (let x = 1; x < 28; x++) { const inF = (x < 9 && y < 9) || (x > 19 && y < 9) || (x < 9 && y > 19); if (!inF && Math.random() < .48) { qctx.fillStyle = Math.random() < .08 ? "#A100FF" : "#0A0710"; qctx.fillRect(x, y, 1, 1); } }
    finder(1, 1); finder(21, 1); finder(1, 21);
    $("#qrTok").textContent = "kn_" + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, "0")).join(""); };
  drawQr(); setInterval(() => { ttl--; if (ttl <= 0) { ttl = 30; drawQr(); } $("#qrTtl").textContent = ttl; }, 1000);

  /* ---------- Team ---------- */
  $("#team").insertAdjacentHTML("afterbegin", TEAM.map(m => `
    <article class="team-card2">
      ${m.linkedin ? `<a class="team-in" href="${m.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn de ${m.name}" title="LinkedIn">${svg("linkedin")}</a>` : ""}
      <div class="team-id">
        <div class="team-avatar${m.photo ? " has-photo" : ""}" aria-hidden="true">${m.photo ? `<img src="${m.photo}" alt="" width="48" height="48">` : m.initials}</div>
        <div class="min-w-0">
          <h3 class="font-display font-bold text-[17px] leading-snug text-white">${m.name}</h3>
          ${m.handle ? `<a class="team-gh" href="https://github.com/${m.handle.slice(1)}" target="_blank" rel="noopener">${svg("github")}<span>${m.handle}</span></a>` : `<span class="team-gh">${svg("users")}<span>Equipo transversal</span></span>`}
        </div>
      </div>
      <div class="team-role">${svg("briefcase")}<span>${m.position}</span></div>
      <span class="team-badge mt-auto">${svg("spark")}${m.focus}</span>
    </article>`).join(""));

  /* ---------- Modals ---------- */
  let lastFocus = null, sceneTimer = null;
  const openModal = (id) => { lastFocus = document.activeElement; const m = $("#m-" + id); m.hidden = false; document.body.style.overflow = "hidden"; setTimeout(() => (m.querySelector("[data-close]") || m).focus(), 30); if (id === "video") startScenes(); };
  const closeModal = (m) => { m.hidden = true; document.body.style.overflow = ""; if (m.id === "m-video") stopScenes(); lastFocus && lastFocus.focus(); };
  $$("[data-open]").forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); openModal(b.dataset.open); }));
  $$(".modal").forEach(m => { m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".modal").forEach(m => { if (!m.hidden) closeModal(m); }); });

  /* Video storyboard */
  
  let sIdx = 0, sT = 0, paused = false; 
  const prog = $("#sceneProg"); prog.innerHTML = SCENES.map(() => "<span><i></i></span>").join("");
  const drawScene = () => { const s = SCENES[sIdx];
    $("#scene").innerHTML = `<div class="reveal-in grid gap-3 justify-items-center max-w-xl"><span class="ico-tile" style="width:64px;height:64px;border-radius:20px;background:rgba(161,0,255,.2);color:var(--t-lilac)">${svg(s.i)}</span><span class="eyebrow">${s.k}</span><div class="font-display font-extrabold" style="font-size:clamp(1.3rem,3.4vw,2.2rem);line-height:1.1">${s.t}</div><div class="text-mute">${s.s}</div></div>`;
    $$("i", prog).forEach((b, k) => b.style.width = k < sIdx ? "100%" : "0%"); };
  const startScenes = () => { sIdx = 0; sT = 0; paused = false; $("#scenePause").innerHTML = svg("pause") + "Pausar"; drawScene();
    if (VIDEO_URL) { $("#vidLink").href = VIDEO_URL; $("#vidLink").hidden = false; $("#vidNote").textContent = "Storyboard del pitch. El video completo se abre en una pestaña nueva."; }
    else $("#vidNote").textContent = "Storyboard animado del pitch. Añade el enlace del video en VIDEO_URL para mostrar el botón de reproducción.";
    stopScenes(); sceneTimer = setInterval(() => { if (paused) return; sT += 100; const bar = $$("i", prog)[sIdx]; if (bar) bar.style.width = Math.min(100, sT / DUR * 100) + "%"; if (sT >= DUR) { sT = 0; sIdx = (sIdx + 1) % SCENES.length; drawScene(); } }, 100); };
  const stopScenes = () => { clearInterval(sceneTimer); sceneTimer = null; };
  $("#scenePause").addEventListener("click", () => { paused = !paused; $("#scenePause").innerHTML = svg(paused ? "play" : "pause") + (paused ? "Reanudar" : "Pausar"); });

  /* =================== KNET APP · SPA =================== */
  
  
  
  
  
  
  /* Multievento: cada evento tiene sus días reales (ISO) */
  
  EVENTS.forEach(e => { e.days = EV_DAYS[e.id] || ["2026-12-10"]; });
  
  
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const kmBetween = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r; const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h)) / 10) * 10; };
  
  
  
  
  const TAB_IDS = TABS.map(t => t[0]).concat(["recinto"]);
  
  
  

  /* ---- Idioma (simulado) ---- */
  
  let LANG = "es";
  try { if (localStorage.getItem("knet-lang") === "en") LANG = "en"; } catch (e) {}
  const t = (k) => (I18N[LANG][k] !== undefined ? I18N[LANG][k] : I18N.es[k] !== undefined ? I18N.es[k] : k);
  function applyLang() {
    document.documentElement.lang = LANG;
    $$("[data-i18n],[data-i18n-html]").forEach(el => {
      const k = el.dataset.i18n || el.dataset.i18nHtml;
      if (el.dataset.es === undefined) el.dataset.es = el.innerHTML;
      el.innerHTML = LANG === "en" && I18N.en[k] ? I18N.en[k] : el.dataset.es;
    });
    $("#langCur").textContent = LANG.toUpperCase();
    if (window.KNET_I18N) window.KNET_I18N.apply(LANG);
    $$("#langMenu [data-lang]").forEach(b => b.setAttribute("aria-checked", String(b.dataset.lang === LANG)));
  }
  const langBtn = $("#langBtn"), langMenu = $("#langMenu");
  const closeLang = () => { langMenu.hidden = true; langBtn.setAttribute("aria-expanded", "false"); };
  langBtn.addEventListener("click", (e) => { e.stopPropagation(); const open = langMenu.hidden; langMenu.hidden = !open; langBtn.setAttribute("aria-expanded", String(open)); if (open) langMenu.querySelector(`[data-lang="${LANG}"]`).focus(); });
  langMenu.addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (!b) return; LANG = b.dataset.lang; if (typeof prefsAllowed === "function" && prefsAllowed()) { try { localStorage.setItem("knet-lang", LANG); } catch (err) {} } applyLang(); closeLang(); langBtn.focus(); toast(t("lang.toast"), "globe"); refresh(); });
  document.addEventListener("click", (e) => { if (!langMenu.hidden && !e.target.closest("#langWrap")) closeLang(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !langMenu.hidden) { closeLang(); langBtn.focus(); } });

  /* ---- Estado ---- */
  const esc = (x) => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fresh = (ind = "tech") => ({ connected: false, ind, xp: 0, done: [], connections: [], attended: [], actions: {}, scopes: { profile: true, industry: true, interests: true, network: true }, dossierAt: null, extra: [], chat: [], graph: false, events: ["bog"], mv1: true, sel: {}, avatar: null, profile: null, requests: {}, coffees: {}, dms: {}, qrConn: [], frames: [], frame: null, items: [], gf: null, exp: null, notifs: [], notifDue: [], soonSeeded: false });
  let A = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && IND[o.ind]) A = Object.assign(fresh(o.ind), o); } } catch (e) {}
  if (A.connected && PERSONAS[A.ind] === undefined) A = fresh();
  /* Limpieza de datos de versiones anteriores (se retiró el simulador Go Fest) */
  /* Migración a multievento: los check-ins pasan de índice a "evento:día:sesión" */
  if (!A.mv1) {
    A.attended = (A.attended || []).map(x => typeof x === "number" ? `bog:0:${x}` : x);
    if (A.ended) Object.keys(A.ended).forEach(k => { if (/^ses:\d+$/.test(k)) { A.ended["ses:bog:0:" + k.slice(4)] = A.ended[k]; delete A.ended[k]; } });
    (A.history || []).forEach(h => { if (/^ses:\d+$/.test(h.key)) h.key = "ses:bog:0:" + h.key.slice(4); });
    A.events = A.events || []; if (!A.events.includes("bog")) A.events.unshift("bog");
    A.sel = {}; A.mv1 = true;
    try { localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) {}
  }
  (() => { const gfTxt = /go ?fest/i;
    delete A.gf; delete A.autoEnd;
    A.notifs = (A.notifs || []).filter(n => !gfTxt.test(`${n.title} ${n.sub}`) && !/^Modo (propuesta|asistencia)/.test(n.title) && !/^\+\d+ XP · Modo (propuesta|asistencia)/.test(n.title));
    A.notifDue = (A.notifDue || []).filter(d => !/^ag\d/.test(d.key));
    A.extra = (A.extra || []).filter(x => !x.startsWith("Propuesta “"));
    (A.history || []).forEach(h => { if (h.s) { ["kind", "meta"].forEach(k => { if (typeof h.s[k] === "string") h.s[k] = h.s[k].replace(/\s*·?\s*Go Fest 2026\s*·?\s*/g, " · ").replace(/^ · | · $/g, ""); }); } });
    try { localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) {}
  })();
  /* ---- Perfil: automático (LinkedIn MCP) o manual, editable con lápiz ---- */
  const BASE_P = JSON.parse(JSON.stringify(PERSONAS));
  const BASE_ROLE = Object.fromEntries(Object.keys(IND).map(k => [k, IND[k].role]));
  
  const INTEREST_POOL = [...new Set([].concat(...Object.values(BASE_P).map(x => x.interests), ["Datos", "Ciberseguridad", "Experiencia de cliente", "Sostenibilidad"]))];
  
  const initialsOf = (n) => (String(n).trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("") || "TÚ").toUpperCase();
  const profileFromPersona = (ind) => ({ name: BASE_P[ind].name, role: BASE_ROLE[ind], company: BASE_P[ind].company, seniority: BASE_P[ind].seniority, interests: BASE_P[ind].interests.slice(), location: BASE_P[ind].location, src: Object.fromEntries(P_FIELDS.map(f => [f, "mcp"])) });
  function applyProfile() {
    Object.keys(BASE_P).forEach(k => { PERSONAS[k] = { ...BASE_P[k], interests: BASE_P[k].interests.slice() }; IND[k].role = BASE_ROLE[k]; });
    const pr = A.connected && A.profile; if (!pr || !PERSONAS[A.ind]) return;
    Object.assign(PERSONAS[A.ind], { name: pr.name, company: pr.company, seniority: pr.seniority, interests: pr.interests.slice(), location: pr.location, initials: initialsOf(pr.name) });
    IND[A.ind].role = pr.role;
  }
  const profileMode = () => { const v = Object.values((A.profile && A.profile.src) || {}); return v.length && v.every(x => x === "manual") ? "manual" : v.some(x => x !== "mcp") ? "mixed" : "mcp"; };
  if (A.connected && !A.profile) A.profile = profileFromPersona(A.ind);
  applyProfile();
  let editField = null;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) {} };
  const lvl = (x = A.xp) => Math.floor(x / 500) + 1;
  const lvlName = (x = A.xp) => LEVELS[Math.min(lvl(x) - 1, LEVELS.length - 1)];
  const lvlMax = () => lvl() >= LEVELS.length;
  const first = (n) => n.split(" ")[0];
  const missionPool = () => IND[A.ind].missions.map((m, i) => ({ id: A.ind + "-m" + i, icon: m[0], title: m[1], sub: m[2], xp: m[3] }))
    .concat(COMMON_M.map((m, i) => ({ id: "c" + i, icon: m[0], title: m[1], sub: m[2], xp: m[3] })));
  const activeMissions = () => missionPool().filter(m => !A.done.includes(m.id)).slice(0, 3);

  /* ---- Backend (API): sincronización progresiva con fallback silencioso a lo local ----
     - XP híbrida: A.xp = XP del servidor + A.xpLocal (XP de flujos que la API aún no conoce:
       grafo, cafés, experiencias, onboarding…). Cuando la API confirma una misión, un check-in o
       una conexión aceptada, su XP pasa de A.xpLocal al servidor; el total visible no cambia.
     - A.xpSynced: claves ("mission:c3", "checkin:bog:0:2", "conn:Laura M.") cuya XP ya cuenta el
       servidor (evita restarla dos veces).
     - A.outbox: acciones hechas sin conexión; se reenvían en orden al volver la API.
     - A.apiLinked: false = el navegador manda en el próximo sync (sube perfil, inscripciones,
       misiones, check-ins, conexiones y dossier locales); true = el servidor manda al arrancar.
     - A.regLocal: inscripciones que el servidor aún rechaza por nivel (su XP es menor); se conservan. */
  const API_FIELD = { name: "name", role: "role", company: "company", ind: "industry", seniority: "seniority", interests: "interests", location: "location" };
  const API_SRC = ["mcp", "manual", "edited"];
  const CHECKIN_XP = 40, CONN_XP = 100; // iguales a XP_REWARDS del backend
  if (typeof A.xpLocal !== "number") A.xpLocal = A.xp || 0;
  if (!Array.isArray(A.xpSynced)) A.xpSynced = (A.doneSynced || []).map(c => "mission:" + c); // migra el formato anterior
  delete A.doneSynced;
  let apiSyncing = null, apiSyncAgain = false;
  let connIndex = null; // nombre del contacto → { id, status } en el servidor (solo en memoria)
  const apiLog = (msg, e) => { try { console.info(`[KNET API] ${msg}`, (e && e.message) || ""); } catch (err) {} };
  const outbox = () => (A.outbox ||= []);
  const uniq = (arr) => [...new Set(arr)];
  const synced = (key) => (A.xpSynced ||= []).includes(key);
  function queueOp(op) { A.outbox = outbox().filter(o => !(o.t === op.t && o.id === op.id)).concat([op]); save(); }

  function profileToApi(fields) {
    const pr = A.profile; if (!pr) return null;
    const body = {}, src = {};
    (fields || Object.keys(API_FIELD)).forEach(f => {
      const v = f === "ind" ? A.ind : pr[f];
      if (v === undefined || v === null || v === "") return;
      body[API_FIELD[f]] = Array.isArray(v) ? v.slice(0, 12) : v;
      if (pr.src && API_SRC.includes(pr.src[f])) src[f] = pr.src[f];
    });
    if (Object.keys(src).length) body.fieldSources = src;
    return Object.keys(body).length ? body : null;
  }
  /* Cambia de industria conservando perfil, avatar, XP, inscripciones, check-ins y el estado de sincronización
     (el servidor los guarda igual; los matches, la red y las misiones sí se rehacen para la nueva industria) */
  function switchIndustry(ni) {
    const keep = { profile: { ...A.profile, src: { ...A.profile.src } }, avatar: A.avatar, scopes: A.scopes, xp: A.xp, xpLocal: A.xpLocal, events: A.events,
      attended: A.attended, outbox: A.outbox, apiLinked: A.apiLinked, xpSynced: A.xpSynced, regLocal: A.regLocal };
    A = Object.assign(fresh(ni), { connected: true }, keep); selEvent = null; graphIntro = true; editField = null;
  }
  function applyServerUser(u) {
    if (!A.profile || !u) return;
    if (u.industry && u.industry !== A.ind && IND[u.industry]) switchIndustry(u.industry);
    const pr = A.profile;
    ["name", "role", "company", "seniority", "location"].forEach(f => { if (typeof u[f] === "string" && u[f]) pr[f] = u[f]; });
    if (Array.isArray(u.interests) && u.interests.length) pr.interests = u.interests.slice();
    if (u.fieldSources) pr.src = { ...pr.src, ...u.fieldSources };
  }
  /* Actualiza en su sitio los eventos conocidos (el mapa y el recinto 3D guardan referencias a estos objetos) */
  function mergeEvents(list) {
    (list || []).forEach(s => {
      const ev = EVENTS.find(e => e.id === s.id); if (!ev) return; // eventos sin recinto/ficha local: más adelante
      Object.assign(ev, { name: s.name || ev.name, city: s.city || ev.city, venue: s.venueName || ev.venue, date: s.dateLabel || ev.date,
        lat: s.lat ?? ev.lat, lon: s.lon ?? ev.lon, tags: s.tags && s.tags.length ? s.tags : ev.tags, ind: s.industries && s.industries.length ? s.industries : ev.ind, desc: s.description || ev.desc });
      if (s.days && s.days.length) ev.days = s.days.slice();
      if (s.minLevel > 1) ev.lvl = s.minLevel; else delete ev.lvl;
      if (s.kind === "real") Object.assign(ev, { real: true, org: s.organizer || ev.org, url: s.sourceUrl || ev.url });
    });
  }
  /* La acción `key` ya cuenta en el servidor: sus `amount` XP salen de xpLocal (una sola vez).
     serverXp = total real del servidor si se conoce; si no, el próximo sync lo corrige. */
  function moveXp(key, amount, serverXp) {
    if (!synced(key)) { A.xpSynced.push(key); A.xpLocal = Math.max(0, A.xpLocal - amount); }
    if (typeof serverXp === "number") A.xp = serverXp + A.xpLocal;
  }
  /* El servidor ya tenía la acción: si también es local, su XP local sobra; si no, solo se marca */
  function adoptServerAction(key, amount, isLocal) { if (isLocal) moveXp(key, amount, null); else if (!synced(key)) A.xpSynced.push(key); }
  const missionXp = (code) => { const m = missionPool().find(x => x.id === code); return m ? m.xp : 0; };
  async function sendMission(code) {
    try { const r = await api.completeMission(code); moveXp("mission:" + code, missionXp(code), r.xp); return "ok"; }
    catch (e) { if (e instanceof ApiError && e.status === 409) { moveXp("mission:" + code, missionXp(code), null); return "resync"; } throw e; }
  }
  async function sendCheckin(code) {
    try { const r = await api.checkin(code, "qr"); moveXp("checkin:" + code, CHECKIN_XP, r.xp); return "ok"; }
    catch (e) {
      if (e instanceof ApiError && e.status === 409) { moveXp("checkin:" + code, CHECKIN_XP, null); return "resync"; }
      if (e instanceof ApiError && e.status === 403) { apiLog(`el check-in ${code} queda local: el servidor no tiene tu inscripción a ese evento`, e); return "ok"; }
      throw e;
    }
  }
  async function loadConnIndex() {
    const r = await api.listConnections();
    connIndex = new Map((r.connections || []).map(c => [c.contact.name, { id: c.id, status: c.status }]));
    return connIndex;
  }
  /* Lleva la conexión con `op.id` (nombre) al estado `op.state`: pending | accepted | removed */
  async function sendConnection(op, retried = false) {
    const idx = connIndex || await loadConnIndex();
    let cur = idx.get(op.id);
    if (op.state === "removed") {
      if (cur) { try { await api.deleteConnection(cur.id); } catch (e) { if (!(e instanceof ApiError && e.status === 404)) throw e; } idx.delete(op.id); }
      return "ok";
    }
    let serverXp = null;
    if (!cur) {
      try {
        const r = await api.createConnection({ name: op.id, source: op.source || "request", context: op.context || undefined, eventId: op.eventId || undefined });
        cur = { id: r.connection.id, status: r.connection.status }; idx.set(op.id, cur); serverXp = r.xp;
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && !retried) { await loadConnIndex(); return sendConnection(op, true); }
        throw e;
      }
    }
    if (op.state === "accepted") {
      if (cur.status !== "accepted") { const r = await api.acceptConnection(cur.id); cur.status = "accepted"; serverXp = r.xp; }
      moveXp("conn:" + op.id, CONN_XP, serverXp);
    }
    return "ok";
  }
  async function sendDossier(eventId, body) {
    try { await api.saveDossier(eventId, body); }
    catch (e) { if (e instanceof ApiError && (e.status === 403 || e.status === 404)) { apiLog(`el dossier de ${eventId} queda local`, e); return "ok"; } throw e; }
    return "ok";
  }
  async function sendRegistration(id, on) {
    if (!on) {
      A.regLocal = (A.regLocal || []).filter(x => x !== id);
      try { await api.unregister(id); } catch (e) { if (!(e instanceof ApiError && e.status === 404)) throw e; }
      return "ok";
    }
    try { await api.register(id); A.regLocal = (A.regLocal || []).filter(x => x !== id); }
    catch (e) {
      if (!(e instanceof ApiError && e.status === 403)) throw e;
      A.regLocal = uniq((A.regLocal || []).concat(id)); apiLog(`el servidor aún no habilita ${id} por nivel; la inscripción queda local`, e);
    }
    return "ok";
  }
  const SEND = {
    mission: (op) => sendMission(op.id),
    reg: (op) => sendRegistration(op.id, op.on),
    checkin: (op) => sendCheckin(op.id),
    conn: (op) => sendConnection(op),
    dossier: (op) => sendDossier(op.id, op.body),
  };
  const sendOp = (op) => (SEND[op.t] ? SEND[op.t](op) : Promise.resolve("ok"));
  async function flushOutbox() {
    for (const op of outbox().slice()) {
      try { await sendOp(op); }
      catch (e) { if (isOffline(e)) throw e; apiLog(`operación descartada (${op.t} ${op.id})`, e); }
      A.outbox = outbox().filter(o => o !== op); save();
    }
  }
  /* Primera vinculación de esta sesión local con la API: el navegador manda */
  async function linkLocalToApi() {
    const body = profileToApi();
    if (body) { try { await api.updateMe(body); } catch (e) { if (isOffline(e)) throw e; apiLog("el servidor rechazó el perfil local", e); } }
    const me = await api.getMe(), srv = new Set(me.registrations || []);
    for (const id of A.events) if (!srv.has(id)) queueOp({ t: "reg", id, on: true });
    for (const id of srv) if (!A.events.includes(id)) queueOp({ t: "reg", id, on: false });
    for (const code of A.done) if (!synced("mission:" + code)) queueOp({ t: "mission", id: code });
    for (const code of A.attended) if (!synced("checkin:" + code)) queueOp({ t: "checkin", id: code });
    Object.entries(A.requests || {}).forEach(([n, r]) => { if (r.status === "pending" && !A.connections.includes(n)) queueOp({ t: "conn", id: n, state: "pending", source: "request" }); });
    for (const n of A.connections) if (!synced("conn:" + n)) queueOp({ t: "conn", id: n, state: "accepted", source: qrPerson(n) ? "qr" : "request" });
    if (A.dossierAt) { const body = dossierPayload(); for (const id of myEvIds()) queueOp({ t: "dossier", id, body }); }
    await flushOutbox();
    A.apiLinked = true; save();
  }
  /* Sincronización completa. Sin backend no muestra nada: el panel sigue con los datos locales. */
  function syncFromApi() {
    if (apiSyncing) { apiSyncAgain = true; return apiSyncing; } // ya hay uno en curso: repetir al terminar
    apiSyncing = (async () => {
      try {
        const evs = await api.listEvents(); mergeEvents(evs.events);
        flushConsents(); // la API respondió: sube los consentimientos que quedaron pendientes
        if (A.connected && A.profile) {
          if (!A.apiLinked) await linkLocalToApi(); else await flushOutbox();
          const [me, ms, ck, cn, ds] = await Promise.all([api.getMe(), api.listMissions(), api.listCheckins(), api.listConnections(), api.listDossiers()]);
          applyServerUser(me.user); applyProfile();
          const regs = (me.registrations || []).filter(id => EVENTS.some(e => e.id === id));
          A.events = uniq(regs.concat(A.regLocal || []));
          // Misiones y check-ins: unión de lo local y lo del servidor, sin contar dos veces la XP
          (ms.missions || []).filter(m => m.completed).forEach(m => {
            adoptServerAction("mission:" + m.code, m.xp, A.done.includes(m.code)); if (!A.done.includes(m.code)) A.done.push(m.code); });
          (ck.checkins || []).forEach(c => {
            adoptServerAction("checkin:" + c.sessionCode, CHECKIN_XP, A.attended.includes(c.sessionCode)); if (!A.attended.includes(c.sessionCode)) A.attended.push(c.sessionCode); });
          // Conexiones aceptadas en el servidor: solo se suman las que esta industria sabe mostrar
          connIndex = new Map((cn.connections || []).map(c => [c.contact.name, { id: c.id, status: c.status }]));
          (cn.connections || []).filter(c => c.status === "accepted").forEach(c => {
            const n = c.contact.name, local = A.connections.includes(n);
            if (!local && !IND[A.ind].matches.some(m => m[1] === n) && !qrPerson(n)) return;
            adoptServerAction("conn:" + n, CONN_XP, local); if (!local) A.connections.push(n); });
          // Dossier: recupera la fecha si este navegador la perdió
          const lastDossier = (ds.dossiers || []).map(d => d.generatedAt).sort().pop();
          if (!A.dossierAt && lastDossier) A.dossierAt = lastDossier;
          A.xp = me.user.xp + A.xpLocal;
        }
        save(); refresh();
      } catch (e) { apiLog(isOffline(e) ? "sin backend; se usan los datos locales" : "no se pudo sincronizar", e); }
      finally { apiSyncing = null; if (apiSyncAgain) { apiSyncAgain = false; syncFromApi(); } }
    })();
    return apiSyncing;
  }
  /* Envía una acción del usuario; si la API no responde, queda en la cola */
  function apiRun(op) {
    if (!A.connected) return;
    // Sin vincular: se encola (así no se pierden las eliminaciones) y la vinculación sube el resto del estado local
    if (!A.apiLinked) { queueOp(op); syncFromApi(); return; }
    const xpBefore = A.xp;
    sendOp(op)
      .then((r) => { save(); if (r === "resync" || outbox().length) syncFromApi(); else if (A.xp !== xpBefore) refresh(); })
      .catch((e) => { if (isOffline(e)) { queueOp(op); apiLog(`sin backend; ${op.t} ${op.id} se enviará al reconectar`, e); } else apiLog(`el servidor rechazó ${op.t} ${op.id}`, e); });
  }
  function apiPatchProfile(fields) {
    if (!A.connected) return;
    if (!A.apiLinked) { syncFromApi(); return; }
    const body = profileToApi(fields); if (!body) return;
    api.updateMe(body).catch((e) => {
      if (isOffline(e)) { A.apiLinked = false; save(); apiLog("perfil guardado solo en local; se subirá al reconectar", e); }
      else apiLog("el servidor rechazó el cambio de perfil", e);
    });
  }
  function toggleRegistration(ev) {
    const id = ev.id, on = !A.events.includes(id);
    if (on) { A.events.push(id); notify("event", `Te inscribiste en ${ev.name}`, `${ev.city} · ${ev.when}`); toast(`<b>Te inscribiste en ${ev.name}</b><div class="text-[13px] text-mute">Lo encuentras en Mis eventos.</div>`, "calendar"); }
    else { A.events = A.events.filter(x => x !== id); toast(`<b>Cancelaste tu inscripción</b> · ${ev.name}`, "calendar"); }
    save(); apiRun({ t: "reg", id, on });
  }
  /* Conexión quitada o solicitud cancelada: si se vuelve a conectar, su XP local se vuelve a reconciliar */
  function apiConnRemoved(n) { A.xpSynced = (A.xpSynced || []).filter(k => k !== "conn:" + n); save(); apiRun({ t: "conn", id: n, state: "removed" }); }
  /* Lo que se guarda del dossier en el servidor, por evento */
  function dossierPayload() {
    const s = dossierData(), clip = (arr, max, len) => (arr || []).map(x => String(x).trim()).filter(Boolean).slice(0, max).map(x => x.slice(0, len));
    return { ideas: clip(s.puntos, 20, 500), plan: clip(s.acciones, 30, 300), notes: String(s.resumen || "").slice(0, 5000) };
  }
  function apiSaveDossier() {
    const rs = getSel("res"), ids = rs.ev === "all" ? myEvIds() : [rs.ev], body = dossierPayload();
    ids.forEach(id => apiRun({ t: "dossier", id, body }));
  }
  const board = () => OTHERS.map(([n, x]) => ({ n, x })).concat([{ n: first(PERSONAS[A.ind].name) + " (tú)", x: A.xp, me: true }]).sort((a, b) => b.x - a.x);
  const rank = () => board().findIndex(r => r.me) + 1;
  const insights = (sess) => { const out = [], seen = new Set();
    (sess || A.attended.map(id => sessionById(id)).filter(Boolean)).forEach(s => { const x = s.insight; if (!seen.has(x)) { seen.add(x); out.push({ text: x, src: `${s.ttl} · ${evById(s.ev).city}, Día ${s.day + 1}` }); } });
    A.extra.forEach(x => { if (!seen.has(x)) { seen.add(x); out.push({ text: x, src: "AI Concierge" }); } });
    return out; };
  const actions = () => ACTIONS[A.ind].map((x, i) => ({ id: A.ind + "-a" + i, text: x }))
    .concat(A.connections.map(n => ({ id: "f-" + n, text: `Agendar seguimiento con ${n} (semana 1)` })))
    .concat(Object.entries(A.coffees || {}).filter(([, c]) => c.status === "accepted").map(([n, c]) => ({ id: "cafe-" + n, text: `Café de 15 min con ${n} · ${c.slot}` })))
    .concat(A.events.map(id => { const ev = EVENTS.find(e => e.id === id); return { id: "ev-" + id, text: `Asistir a ${ev.name}, ${ev.city} (${ev.date})` }; }));
  const badges = () => {
    const b = board().filter(r => !r.me), third = b[2];
    const left = Math.max(0, 2 - A.attended.length);
    return [
      { i: "compass", n: "Explorador", ok: A.connected, got: "Conectaste tu perfil vía MCP.", need: "Conecta tu perfil con LinkedIn MCP." },
      { i: "users", n: "Primer match", ok: A.connections.length >= 1, got: `Conectaste con ${A.connections[0] || "tu primer match"}.`, need: "Conecta con 1 match en el AI Concierge." },
      { i: "check", n: "Asistente fiel", ok: A.attended.length >= 2, got: "Hiciste check-in en 2 charlas.", need: `Haz check-in en ${left} charla${left === 1 ? "" : "s"} más de tu agenda.` },
      { i: "star", n: "Mente activa", ok: A.xp >= 500 || A.done.length >= 3, got: A.xp >= 500 ? "Superaste los 500 XP." : "Completaste 3 misiones.", need: `Te faltan ${fmt(Math.max(0, 500 - A.xp))} XP o completar ${Math.max(0, 3 - A.done.length)} ${3 - A.done.length === 1 ? "misión" : "misiones"}.` },
      { i: "trophy", n: "Top 3", ok: rank() <= 3, got: "Estás en el top 3 del Summit.", need: `Faltan ${fmt(Math.max(1, third.x - A.xp + 1))} XP para superar a ${third.n}.` },
      { i: "file", n: "Dossier listo", ok: !!A.dossierAt, got: "Generaste tu Dossier post-Summit.", need: "Genera tu resumen en la pestaña Mi perfil." },
      { i: "spark", n: "Avatar listo", ok: !!A.avatar, got: "Creaste tu avatar del Summit.", need: "Crea tu avatar desde el banner del panel." }];
  };
  const badgeNames = () => badges().filter(b => b.ok).map(b => b.n);
  const xpLine = (n) => `<div class="mono text-[13px]" style="color:var(--t-emerald)">+${n} XP</div>`;
  const act = (a, v, label, cls = "pill-btn") => `<button type="button" class="${cls}" data-act="${a}" data-v="${esc(v)}">${label}</button>`;
  const avatarBg = (i) => ["linear-gradient(135deg,#A100FF,#7500C0)", "linear-gradient(135deg,#2F55E0,#7500C0)", "linear-gradient(135deg,#10B981,#2F55E0)"][i % 3];

  const landingView = $("#top"), appView = $("#appView"), panel = $("#appPanel");
  let curTab = "perfil", inApp = false, pendingTarget = null;

  function award(mut, xp, msg, icon = "check", kind = "xp") {
    const before = badgeNames(), lv = lvl();
    mut(); A.xp += xp; A.xpLocal = (A.xpLocal || 0) + xp; // XP híbrida: queda local hasta que la API la confirme
    if (kind === "conn") notify("conn", msg.replace(/<[^>]+>/g, ""), xp ? `Nueva conexión · +${xp} XP` : "Nueva conexión");
    else if (xp) notify("xp", `+${xp} XP · ${msg.replace(/<[^>]+>/g, "")}`, "Puntos sumados a tu marcador");
    if (lvl() > lv) { notify("level", `¡Subiste a nivel ${lvl()}!`, `Ahora eres ${lvlName()}`);
      EVENTS.filter(e => e.lvl && e.lvl > lv && e.lvl <= lvl()).forEach(e => { notify("event", `Desbloqueaste un evento exclusivo: ${e.name}`, `${e.city} · ${e.date} · Inscríbete en Próximos eventos`); setTimeout(() => toast(`<b>¡Evento exclusivo desbloqueado!</b><div class="text-[13px] text-mute">${e.name}</div>`, "star"), 1400); }); }
    save();
    toast(`<b>${msg}</b>${xp ? xpLine(xp) : ""}`, icon);
    if (lvl() > lv) setTimeout(() => toast(`<b>¡Subiste a Nivel ${lvl()}!</b> · ${lvlName()}`, "trophy"), 450);
    badgeNames().filter(n => !before.includes(n)).forEach((n, k) => setTimeout(() => toast(`<b>Insignia desbloqueada:</b> ${n}`, "star"), 900 + k * 450));
    refresh();
  }
  const isDesk = () => window.matchMedia("(min-width: 1024px)").matches;
  const offsetTop = () => { const nav = $("#nav").offsetHeight, tabs = !isDesk() && inApp ? $("#appSide").offsetHeight : 0; return nav + tabs + 12; };
  function scrollToEl(el) { const y = el.getBoundingClientRect().top + window.scrollY - offsetTop(); window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" }); }
  function flash(el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); }
  function goTo(v) { const [tab, target] = String(v).split(":"); showTab(tab, target); }

  /* ---- Header / banner / tabs ---- */
  function renderHeader() {
    const chip = $("#userChip");
    chip.hidden = !A.connected; $("#logoutBtn").hidden = !A.connected; $("#notifWrap").hidden = !A.connected; if (!A.connected) closeNotif(); renderNotifCount();
    $("#navConnect").hidden = inApp || A.connected;
    const saved = !A.connected && A.profile;
    $("#navLblL").textContent = A.connected ? t("mine.l") : saved ? `${LANG === "en" ? "Continue as" : "Continuar como"} ${first(A.profile.name)}` : t("connect.l");
    $("#navLblS").textContent = A.connected ? t("mine.s") : saved ? t("resume.s") : t("connect.s");
    const lo = $("#logoutBtn span"); if (lo) lo.textContent = t("logout");
    requestAnimationFrame(() => typeof fitNav === "function" && fitNav());
    $$(".cta-connect-lbl").forEach(e => e.textContent = A.connected ? t("mine.l") : saved ? `Continuar como ${first(A.profile.name)}` : t("connect.l"));
    if (A.connected) { const p = PERSONAS[A.ind];
      chip.innerHTML = `${A.avatar ? `<span class="chip-av${frameCls()}">${avatarSVG(A.avatar, 32)}</span>` : `<span class="avatar" style="width:32px;height:32px;font-size:12px;background:linear-gradient(135deg,#A100FF,#7500C0)">${p.initials}</span>`}<span class="uc-txt"><b>${first(p.name)}</b><span class="mono tabular">Nv ${lvl()} · ${fmt(A.xp)} XP</span></span>`; }
  }
  /* Tarjeta compacta del asistente (barra lateral) y cabecera de cada pestaña */
  const meAvatar = (size) => { const p = PERSONAS[A.ind]; return `<span class="me-av${frameCls()}">${A.avatar ? avatarSVG(A.avatar, size) : `<span class="team-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .32)}px">${p.initials}</span>`}</span>`; };
  function renderBanner() {
    const p = PERSONAS[A.ind], into = A.xp % 500, max = lvlMax();
    $("#sideMe").innerHTML = `<button type="button" class="side-me" data-goprofile aria-label="Ir a Mi perfil">${meAvatar(48)}<span class="min-w-0"><b>${esc(p.name)}</b><span class="side-role">${esc(IND[A.ind].role)}</span><span class="side-lvl">${lvlBadge(lvl(), 18)}Nv ${lvl()} · ${lvlName()}</span><span class="side-xp"><i style="width:${max ? 100 : into / 5}%"></i></span><span class="side-xp-t tabular">${fmt(A.xp)} XP${max ? "" : ` · faltan ${fmt(500 - into)}`}</span></span></button>`;
  }
  function tabHead(tab) {
    const p = PERSONAS[A.ind], d = IND[A.ind], into = A.xp % 500, max = lvlMax(), [title, desc] = TAB_DESC[tab], num = (TABS.find(x => x[0] === tab) || [])[1];
    return `<header class="th">
      <div class="th-me-wrap"><button type="button" class="th-me" data-goprofile aria-label="Ir a Mi perfil">${meAvatar(58)}<span class="th-id"><b>${esc(p.name)}</b><span class="th-role">${esc(d.role)} · ${esc(p.company)}</span><span class="th-lvl">${lvlBadge(lvl(), 20)}Nivel ${lvl()} · ${lvlName()}<span class="th-xp-t tabular">${fmt(A.xp)} XP</span></span><span class="th-xp"><i style="width:${max ? 100 : into / 5}%"></i></span></span></button>${tab === "perfil" ? `<button type="button" class="btn btn-ghost btn-sm" data-avedit>${svg(A.avatar ? "spark" : "users")}${A.avatar ? "Editar avatar" : "Crear avatar"}</button>` : ""}</div>
      <div class="th-tab"><span class="th-n mono">${num}</span><div class="min-w-0"><h1 class="th-t">${title}</h1><p class="th-d">${desc}</p></div>${tab === "red" ? `<button type="button" class="btn btn-primary btn-sm th-act" data-act="qrscan" data-v="">${svg("qr")}Escanear credencial</button>` : ""}${tab === "perfil" ? `<button type="button" class="btn btn-ghost btn-sm th-edit-desk" data-avedit>${svg(A.avatar ? "spark" : "users")}${A.avatar ? "Editar avatar" : "Crear avatar"}</button>` : ""}</div>
    </header>`;
  }
  function renderTabs() {
    const n = activeMissions().length, rw = FRAMES.filter(f => A.xp >= f.xp && !(A.frames || []).includes(f.id)).length + AV_XHAIR.concat(AV_XACC).filter(x => A.xp >= x[2] && !ownsItem(x[0])).length;
    const badge = { quests: n, red: A.connections.length, recompensas: rw };
    { const cur = TABS.find(x => x[0] === curTab) || TABS[0], tg = $("#sideToggle");
      if (tg) tg.innerHTML = `<span class="st-n">${cur[1]}</span><span class="st-l">${t(cur[2])}</span><span class="st-m">Menú</span><span class="st-i" aria-hidden="true"><i></i><i></i><i></i></span>`; }
    $("#appTabs").innerHTML = TABS.map(([id, num, key, ic]) => `<button type="button" class="app-tab" data-tab="${id}" ${id === curTab ? 'aria-current="page"' : ""}><span class="app-tab-n">${num}</span>${svg(ic)}<span class="app-tab-l">${t(key)}</span>${badge[id] ? `<span class="app-tab-dot ${id === "recompensas" ? "gold" : id === "red" ? "cyan" : ""}" aria-label="${badge[id]}">${badge[id]}</span>` : ""}</button>`).join("");
  }

  /* ---- Exp 01 · Perfil + grafo ---- */
  
  function perfilParts() {
    const p = PERSONAS[A.ind], d = IND[A.ind], sc = A.scopes; let k = 0;
    const srcOf = (f) => (A.profile && A.profile.src && A.profile.src[f]) || "mcp";
    const kv = (field, label, v, mcpTag, hidden) => {
      if (editField === field) return kvEditor(field, label);
      const id = "kvd" + (k++), own = srcOf(field), s = hidden ? "off" : own === "mcp" ? mcpTag : own;
      const tag = s === "off" ? "Sin permiso" : s === "manual" ? "Manual" : s === "edited" ? "Editado" : s.replace("+", "");
      const ic = s === "off" ? "lock" : s === "manual" || s === "edited" ? "pen" : "info";
      return `<div class="kv-wrap"><div class="kv"><span class="kv-k">${label}</span><span class="kv-v">${hidden ? "Oculto por ti" : esc(v)}</span><span class="kv-act"><button type="button" class="kv-pen" data-act="pfedit" data-v="${field}" aria-label="Editar ${label}" title="Editar ${label}">${svg("pen")}</button></span></div></div>`; };
    const mode = profileMode();
    const scopes = [["profile", "Titular y rol actual", "Obligatorio para usar KNET"], ["industry", "Industria y seniority", "Mejora el matchmaking"], ["interests", "Habilidades e intereses", "Sugerencias de charlas y misiones"], ["network", "Red de contactos", "Activa el grafo de contactos del Summit"]];
    let net;
    if (!sc.network) net = `<article class="pcard pcard-locked" id="networkCard"><div class="locked-row"><span class="ico-tile" style="background:rgba(var(--w-rgb),.06);color:var(--muted)">${svg("lock")}</span><div><h2 class="pcard-t" style="margin:0">Grafo de contactos</h2><p class="text-mute text-[14px]">Activa <b>Red de contactos</b> en Permisos MCP para ver quién conoce a quién en el Summit.</p></div></div></article>`;
    else net = `<article class="pcard" id="networkCard"><header class="pcard-h"><div><span class="pcard-k">Red de contactos</span><h2 class="pcard-t">Tu red dentro del Summit</h2></div><span class="chip chip-emerald" id="graphStats">${svg("users")}Grafo listo</span></header>
        ${graphRolesHTML()}
        <div class="graph-wrap"><canvas id="netGraph" role="img" aria-label="Grafo de contactos: tú en el centro, tus matches alrededor y sus contactos en el Summit"></canvas><div class="graph-tip" id="graphTip" hidden></div></div>
        <div class="graph-legend"><span><i style="background:#A100FF"></i>Tú</span><span><i style="background:#10B981"></i>Conectado</span><span><i style="background:#3D6BFF"></i>Match sugerido</span><span><i style="background:#8B86A8"></i>2º grado</span><span class="gr-leg-sep">Borde = rol:</span>${G_ROLES.map(([, l, , c]) => `<span><i style="background:transparent;box-shadow:inset 0 0 0 2.5px rgb(${c})"></i>${l}</span>`).join("")}</div>
        <div class="graph-info" id="graphInfo" aria-live="polite">Toca o pasa el cursor sobre un nodo para ver cómo llegas a esa persona.</div></article>`;
    return {
      data: `<article class="pcard">
          <header class="pcard-h"><div><span class="pcard-k">Experiencia 01</span><h2 class="pcard-t">Mis datos personales</h2></div>${mode === "mcp" ? `<span class="chip chip-emerald">${svg("check")}Sincronizado</span>` : mode === "manual" ? `<span class="chip chip-accent">${svg("pen")}Perfil manual</span>` : `<span class="chip chip-accent">${svg("pen")}LinkedIn + manual</span>`}</header>
          <div class="kv-list">
            ${kv("name", "Nombre", p.name, "profile.read")}${kv("role", "Rol", d.role, "profile.read")}${kv("company", "Empresa", p.company || "No indicada", "profile.read")}
            ${kv("ind", "Industria", d.label, "profile.read+", !sc.industry)}
            ${kv("seniority", "Seniority", p.seniority, "profile.read+", !sc.industry)}
            ${kv("interests", "Intereses", p.interests.join(" · "), "interests.infer", !sc.interests)}
            ${kv("location", "Ciudad", p.location || "No indicada", "profile.read")}
          </div>
        </article>`,
      net, qr: qrCardHTML()
    };
  }
  let graphRaf = 0, graphIntro = true, graphRO = null;
  function seeded(seed) { let x = seed % 2147483647; if (x <= 0) x += 2147483646; return () => (x = x * 16807 % 2147483647, (x - 1) / 2147483646); }
  /* Roles del grafo: quién soy y a quién quiero ver */
  
  
  const G_ROLE = Object.fromEntries(G_ROLES.map(r => [r[0], r]));
  
  
  
  function roleOf(name, sub) {
    if (SPEAKER_NAMES.includes(name)) return "speaker";
    if (/founder|fundador|startup|consultor/i.test(sub)) return "partner";
    if (/cto|head de data|head de ia|data scientist|arquitect|investigador|ciberseguridad|datos ·/i.test(sub)) return "experto";
    return "cliente";
  }
  const defaultMyRole = () => ({ banca: "cliente", tech: "experto", consultoria: "partner", energia: "cliente" })[A.ind] || "cliente";
  const myRole = () => A.graphRole || defaultMyRole();
  const seeRoles = () => A.graphSee || G_SUGGEST[myRole()].slice();
  function graphRolesHTML() {
    const me = myRole(), see = seeRoles(), { nodes } = graphData(), cnt = (r) => nodes.filter((n, i) => i && n.role === r).length;
    const sug = G_SUGGEST[me], isSug = sug.length === see.length && sug.every(r => see.includes(r));
    return `<div class="gr-ctl">
      <div><div class="gr-k">Soy</div><div class="gr-seg" role="radiogroup" aria-label="Tu rol en el Summit">${G_ROLES.map(([id, l, ic, c]) => `<button type="button" class="gr-btn ${me === id ? "on" : ""}" role="radio" aria-checked="${me === id}" data-grme="${id}" style="--c:${c}">${svg(ic)}${G_SING[id]}</button>`).join("")}</div></div>
      <div><div class="gr-k">Quiero ver</div><div class="gr-seg" role="group" aria-label="Roles que quieres ver en el grafo">${G_ROLES.map(([id, l, ic, c]) => `<button type="button" class="gr-btn chk ${see.includes(id) ? "on" : ""}" aria-pressed="${see.includes(id)}" data-grsee="${id}" style="--c:${c}"><i class="gr-dot"></i>${l} <span class="gr-n tabular">${cnt(id)}</span></button>`).join("")}<button type="button" class="gr-btn ghost" data-grall>${see.length === G_ROLES.length ? "Ninguno" : "Todos"}</button></div></div>
      <div class="gr-sug">${svg("spark")}<span>${G_WHY[me]}</span>${isSug ? `<span class="chip chip-emerald">${svg("check")}Vista recomendada</span>` : `<button type="button" class="pill-btn" data-grsug>Aplicar recomendación</button>`}</div>
    </div>`;
  }
  panel.addEventListener("click", (e) => {
    const m = e.target.closest("[data-grme]"); if (m) { A.graphRole = m.dataset.grme; A.graphSee = G_SUGGEST[A.graphRole].slice(); save(); toast(`<b>Tu rol: ${G_ROLE[A.graphRole][1]}</b><div class="text-[13px] text-mute">Ajustamos el grafo a lo que te conviene ver.</div>`, "users"); refresh(); return; }
    const v = e.target.closest("[data-grsee]"); if (v) { const r = v.dataset.grsee, cur = seeRoles(); A.graphSee = cur.includes(r) ? cur.filter(x => x !== r) : cur.concat(r); save(); refresh(); return; }
    if (e.target.closest("[data-grall]")) { A.graphSee = seeRoles().length === G_ROLES.length ? [] : G_ROLES.map(r => r[0]); save(); refresh(); return; }
    if (e.target.closest("[data-grsug]")) { A.graphSee = G_SUGGEST[myRole()].slice(); save(); refresh(); return; }
  });
  function graphData() {
    const d = IND[A.ind], p = PERSONAS[A.ind];
    const rnd = seeded([...A.ind].reduce((a, c) => a + c.charCodeAt(0), 0) * 97 + 11);
    const nodes = [{ label: first(p.name) + " (tú)", sub: `${d.role} · ${p.company}`, type: "me", role: myRole() }];
    d.matches.forEach(m => nodes.push({ label: m[1], sub: m[2], type: A.connections.includes(m[1]) ? "conn" : "match", role: roleOf(m[1], m[2]) }));
    const pool = SUMMIT_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    pool.slice(0, 12).forEach(([n, r]) => nodes.push({ label: n, sub: r, type: "summit", role: roleOf(n, r) }));
    const edges = [];
    for (let i = 1; i <= 3; i++) edges.push([0, i]);
    for (let k = 4; k < nodes.length; k++) { const a = 1 + Math.floor(rnd() * 3); edges.push([a, k]); if (rnd() < .45) edges.push([1 + (a % 3), k]); }
    for (let k = 0; k < 7; k++) { const a = 4 + Math.floor(rnd() * 12), b = 4 + Math.floor(rnd() * 12); if (a !== b && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) edges.push([a, b]); }
    nodes.forEach(n => { n.ph = rnd() * 6.283; n.j = rnd(); });
    return { nodes, edges };
  }
  function startGraph() {
    cancelAnimationFrame(graphRaf); if (graphRO) graphRO.disconnect();
    const cv = $("#netGraph"); if (!cv) return;
    const ctx = cv.getContext("2d"), { nodes, edges } = graphData(), tip = $("#graphTip"), info = $("#graphInfo");
    const see = seeRoles(), sel0 = (i) => i === 0 || see.includes(nodes[i].role), vis = (i) => i <= 3 || sel0(i);
    const nb = (i) => edges.filter(e => (e[0] === i || e[1] === i) && vis(e[0]) && vis(e[1])).map(e => e[0] === i ? e[1] : e[0]);
    const COL = { me: "139,92,246", conn: "16,185,129", match: "6,182,212", summit: "139,134,168" };
    const R = { me: 15, conn: 10, match: 10, summit: 6 };
    let W = 0, H = 0, hover = -1, sel = -1, t0 = performance.now();
    const intro = graphIntro && !reduce; graphIntro = false;
    const size = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); layout(); };
    const layout = () => { const cx = W / 2, cy = H / 2, m = Math.min(W, H), sx = Math.min(1.6, W / H);
      nodes.forEach((n, i) => {
        if (n.type === "me") { n.bx = cx; n.by = cy; return; }
        if (i <= 3) { const a = -Math.PI / 2 + (i - 1) * 2 * Math.PI / 3; n.bx = cx + Math.cos(a) * m * .24 * sx; n.by = cy + Math.sin(a) * m * .24; return; }
        const a = (i - 4) / 12 * 2 * Math.PI + .26, rr = m * (.39 + n.j * .05);
        n.bx = Math.max(18, Math.min(W - 18, cx + Math.cos(a) * rr * sx)); n.by = Math.max(18, Math.min(H - 18, cy + Math.sin(a) * rr));
      }); };
    const pos = (n, t) => reduce ? [n.bx, n.by] : [n.bx + Math.sin(t * .0007 + n.ph) * 3, n.by + Math.cos(t * .0009 + n.ph) * 3];
    const draw = (now) => {
      if (!cv.isConnected) { if (graphRO) graphRO.disconnect(); return; }
      const t = now - t0, k = intro ? Math.min(1, t / 1100) : 1, ease = 1 - Math.pow(1 - k, 3);
      ctx.clearRect(0, 0, W, H);
      const focus = sel >= 0 ? sel : hover, near = focus >= 0 ? new Set([focus, ...nb(focus)]) : null;
      const P = nodes.map(n => pos(n, now));
      edges.forEach(([a, b]) => {
        if (!vis(a) || !vis(b)) return;
        const direct = a === 0 || b === 0, on = (!near || (near.has(a) && near.has(b))) && (sel0(a) || sel0(b));
        const conn = direct && nodes[b].type === "conn";
        const LT = document.documentElement.classList.contains("theme-light");
        ctx.strokeStyle = direct ? `rgba(${conn ? (LT ? "4,120,87" : "16,185,129") : (LT ? "117,0,192" : "167,139,250")},${(on ? (LT ? .85 : .75) : .12) * ease})` : (LT ? `rgba(60,50,80,${(on ? .4 : .08) * ease})` : `rgba(160,170,200,${(on ? .32 : .06) * ease})`);
        ctx.lineWidth = direct ? 1.8 : 1; ctx.setLineDash(direct && !conn ? [4, 4] : []);
        ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke();
      });
      ctx.setLineDash([]);
      nodes.forEach((n, i) => {
        if (!vis(i)) return;
        const [x, y] = P[i], on = (!near || near.has(i)) && sel0(i), c = COL[n.type], r = R[n.type] * (intro ? Math.min(1, Math.max(0, (k * 1.6) - (i / nodes.length) * .6)) : 1);
        if (r <= 0) return;
        if (n.type !== "summit" || i === focus) { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, `rgba(${c},${on ? .35 : .08})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = `rgba(${c},${on ? 1 : .25})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        ctx.strokeStyle = `rgba(${G_ROLE[n.role][3]},${on ? .95 : .25})`; ctx.lineWidth = n.type === "summit" ? 2 : 2.6; ctx.beginPath(); ctx.arc(x, y, r + 2.2, 0, 6.283); ctx.stroke();
        if (i === focus) { ctx.strokeStyle = document.documentElement.classList.contains("theme-light") ? "#0A0710" : "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 5.5, 0, 6.283); ctx.stroke(); }
        if ((n.type !== "summit" || i === focus) && on && ease > .6) { ctx.font = `${n.type === "me" ? 700 : 600} 12px Inter, system-ui, sans-serif`; ctx.textAlign = "center"; const lbl = window.KNET_I18N && window.KNET_I18N.lang === "en" ? String(n.label).replace("(tú)", "(you)") : n.label; if (document.documentElement.classList.contains("theme-light")) { ctx.lineWidth = 3.5; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(251,249,244,.95)"; ctx.strokeText(lbl, x, y + r + 15); ctx.fillStyle = "rgba(10,7,16,.92)"; } else ctx.fillStyle = "rgba(245,241,250,.92)"; ctx.fillText(lbl, x, y + r + 15); }
      });
      graphRaf = requestAnimationFrame(draw);
    };
    const pick = (ev) => { const r = cv.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top, now = performance.now(); let best = -1, bd = 1e9;
      nodes.forEach((n, i) => { if (!vis(i)) return; const [x, y] = pos(n, now), dd = Math.hypot(x - mx, y - my); if (dd < R[n.type] + 10 && dd < bd) { bd = dd; best = i; } }); return [best, mx, my]; };
    const shown = nodes.filter((n, i) => i > 3 && sel0(i)).length, direct = nb(0).filter(sel0).length;
    const describe = (i) => { const n = nodes[i]; if (n.type === "me") return `<b>${n.label}</b> · ${n.sub} · <b>${G_SING[n.role]}</b>. Ves ${direct} contactos directos y ${shown} de segundo grado con los roles elegidos.`;
      const via = nb(i).filter(j => j >= 1 && j <= 3).map(j => nodes[j].label);
      const rl = `<span class="gr-tag" style="--c:${G_ROLE[n.role][3]}">${G_ROLE[n.role][1]}</span>`;
      if (i <= 3) return `${rl} <b>${n.label}</b> · ${n.sub}. ${n.type === "conn" ? "Conexión directa confirmada." : "Match sugerido: aún no conectan."} Conoce a ${nb(i).filter(j => j > 3).length} personas más del Summit.`;
      return `${rl} <b>${n.label}</b> · ${n.sub}. Contacto de 2º grado, a través de ${via.join(" y ") || "otros asistentes"}.`; };
    cv.addEventListener("mousemove", (ev) => { const [i, mx, my] = pick(ev); hover = i; cv.style.cursor = i >= 0 ? "pointer" : "default";
      if (i >= 0) { tip.hidden = false; tip.innerHTML = `<b>${nodes[i].label}</b><span>${nodes[i].sub}</span><span style="color:rgb(${G_ROLE[nodes[i].role][3]})">${i === 0 ? "Tú · " : ""}${G_ROLE[nodes[i].role][1]}</span>`; tip.style.left = Math.min(mx + 12, W - 180) + "px"; tip.style.top = (my + 12) + "px"; } else tip.hidden = true; });
    cv.addEventListener("mouseleave", () => { hover = -1; tip.hidden = true; });
    cv.addEventListener("click", (ev) => { const [i] = pick(ev); sel = i === sel ? -1 : i; info.innerHTML = sel >= 0 ? describe(sel) : "Toca o pasa el cursor sobre un nodo para ver cómo llegas a esa persona."; });
    $("#graphStats").innerHTML = `${svg("users")}${direct} directos · ${shown} de 2º grado`;
    if (!see.length) info.innerHTML = "Elige al menos un rol en <b>Quiero ver</b> para mostrar personas en el grafo.";
    size(); graphRO = new ResizeObserver(() => size()); graphRO.observe(cv);
    graphRaf = requestAnimationFrame(draw);
  }

  /* ---- Recompensas: marcos exclusivos para el avatar ---- */
  
  const frameCls = () => (A.frame && (A.frames || []).includes(A.frame)) ? ` av-frame frame-${A.frame}` : "";
  /* ---- Misiones grupales: sugieren la mejor conexión para cada una ---- */
  
  const groupState = () => (A.groupM ||= {});
  function gmCandidates(g) {
    const d = IND[A.ind], mine = PERSONAS[A.ind].interests, pool = A.connections.length ? A.connections : d.matches.map(m => m[1]);
    return pool.map(n => { const m = d.matches.find(x => x[1] === n), info = MATCH_INFO[n] || { int: [] };
      const shared = info.int.filter(t => g.tags.includes(t) || mine.includes(t));
      const fit = info.int.filter(t => g.tags.includes(t));
      return { n, initials: m ? m[0] : n.split(" ").map(w => w[0]).join("").slice(0, 2), role: m ? m[2] : (connInfo(n).role), aff: m ? m[3] : 70, shared, fit, conn: isConn(n),
        score: (m ? m[3] : 70) + fit.length * 9 + shared.length * 3, why: fit.length ? `Comparte el tema de la misión: ${fit.slice(0, 2).join(" y ")}` : shared.length ? `Tienen en común ${shared.slice(0, 2).join(" y ")}` : m ? m[4] : "Ya forma parte de tu red" }; })
      .sort((a, b) => b.score - a.score);
  }
  function groupMissionsHTML() {
    const st = groupState(), now = Date.now(), noConn = !A.connections.length;
    let changed = false;
    Object.values(st).forEach(x => { if (x.status === "invited" && x.due <= now) { x.status = "active"; changed = true; } });
    if (changed) save();
    return `<article class="pcard" id="groupCard">
      <header class="pcard-h"><div><span class="pcard-k">Juega en equipo</span><h2 class="pcard-t">Misiones grupales</h2></div><span class="chip chip-cyan tabular">${svg("users")}${Object.values(st).filter(x => x.status === "done").length}/${GROUP_M.length}</span></header>
      ${noConn ? `<div class="gm-note">${svg("info")}<span>Aún no tienes conexiones. Te sugerimos con quién conectar primero para cada misión.</span></div>` : ""}
      <div class="gm-wrap"><ul class="gm-grid">${GROUP_M.map(g => { const x = st[g.id] || {}, cands = gmCandidates(g), alt = (x.alt || 0) % Math.max(1, cands.length), c = x.with ? cands.find(k => k.n === x.with) || cands[alt] : cands[alt];
        if (!c) return "";
        const other = cands.length > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-gm="next" data-v="${g.id}">${svg("shuffle")}Otra sugerencia</button>` : "";
        const status = x.status === "done" ? `<span class="chip chip-emerald">${svg("check")}Completada con ${esc(first(x.with))}</span>`
          : x.status === "active" ? `<span class="chip chip-cyan">${svg("users")}En curso con ${esc(first(x.with))}</span>`
          : x.status === "invited" ? `<span class="chip">${svg("clock")}Esperando a ${esc(first(x.with))}…</span>` : "";
        const actions = x.status === "done" ? ""
          : x.status === "active" ? `<button type="button" class="btn btn-emerald btn-sm" data-gm="done" data-v="${g.id}">${svg("check")}Marcar completada · +${g.xp} XP</button>`
          : x.status === "invited" ? `<button type="button" class="btn btn-ghost btn-sm" data-gm="cancel" data-v="${g.id}">Cancelar invitación</button>`
          : c.conn ? `<button type="button" class="btn btn-primary btn-sm" data-gm="invite" data-v="${g.id}" data-n="${esc(c.n)}">${svg("users")}Invitar a ${esc(first(c.n))}</button>${other}`
          : isPending(c.n) ? `<span class="chip gm-pend">${svg("clock")}Solicitud enviada a ${esc(first(c.n))}</span>${other}`
          : `<button type="button" class="btn btn-primary btn-sm" data-gm="connect" data-n="${esc(c.n)}">${svg("handshake")}Conectar con ${esc(first(c.n))}</button>${other}`;
        return `<li class="gm2 ${x.status === "done" ? "done" : ""}">
          <div class="gm2-head"><span class="gm2-ic">${svg(g.ico)}</span><div class="gm2-meta"><span>${g.sub}</span><span class="gm2-xp tabular">+${g.xp} XP</span></div></div>
          <h3 class="gm2-title">${g.title}</h3>
          ${status ? `<div>${status}</div>` : ""}
          ${x.status === "done" ? `<p class="gm2-done">${svg("trophy")}Misión cumplida. Sumaste +${g.xp} XP con ${esc(x.with)}.</p>` : `<div class="gm-sug">
            <span class="gm-k">${x.with ? "Tu compañero" : c.conn ? "Mejor conexión para esta misión" : "Te sugerimos conectar con"}</span>
            <div class="gm-p"><span class="gf-av" style="--h:${hashStr(c.n) % 360}">${esc(c.initials)}</span><div class="min-w-0"><div class="gm-name"><span>${esc(c.n)}</span><span class="gf-aff">${c.aff}%</span></div><div class="gm-role">${esc(c.role)}</div></div></div>
            <p class="gm-why">${svg("spark")}<span>${esc(c.why)}</span></p>
          </div>`}
          ${actions ? `<div class="gm-actions">${actions}</div>` : ""}
        </li>`; }).join("")}</ul></div>
    </article>`;
  }
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-gm]"); if (!b) return;
    const st = groupState(), id = b.dataset.v, g = GROUP_M.find(x => x.id === id), k = b.dataset.gm;
    if (k === "next") { st[id] = { ...(st[id] || {}), alt: ((st[id] || {}).alt || 0) + 1 }; save(); refresh(); return; }
    if (k === "connect") { connectMatch(b.dataset.n); return; }
    if (k === "invite") { const n = b.dataset.n; st[id] = { ...(st[id] || {}), with: n, status: "invited", due: Date.now() + 5000 }; save();
      toast(`<b>Invitación enviada a ${esc(n)}</b><div class="text-[13px] text-mute">${g.title}</div>`, "users"); refresh();
      setTimeout(() => { const x = groupState()[id]; if (x && x.status === "invited" && x.with === n) { x.status = "active"; save(); notify("conn", `${n} aceptó la misión grupal`, g.title); toast(`<b>${esc(n)} aceptó la misión</b><div class="text-[13px] text-mute">${g.title}</div>`, "users"); refresh(); } }, 5100); return; }
    if (k === "cancel") { delete st[id]; save(); refresh(); return; }
    if (k === "done") { const n = st[id].with; award(() => { st[id] = { with: n, status: "done", at: Date.now() }; }, g.xp, `Misión grupal completada con ${n}`, "users"); return; }
  });

  /* ---- Misión especial: experiencia presencial (arte, cocina, deporte) ---- */
  /* Las experiencias presenciales pertenecen al AI & Business Summit (bog) y a un día concreto */
  
  
  let expPick = false, expAsk = null;
  const expConfirmHTML = () => { if (!expAsk || !A.exp) return ""; const from = EXPS.find(e => e.id === A.exp.id), to = EXPS.find(e => e.id === expAsk);
    return `<div class="exp-confirm" role="alertdialog" aria-label="Confirmar cambio de actividad">${svg("info")}<span>¿Estás seguro de cambiar <b>${from.name}</b> por <b>${to.name}</b>? Liberarás tu cupo en la actividad actual.</span><span class="exp-confirm-btns"><button type="button" class="btn btn-ghost btn-sm" data-act="expno">Cancelar</button><button type="button" class="btn btn-primary btn-sm" data-act="expjoin" data-v="${to.id}" data-confirm="1">Sí, cambiar</button></span></div>`; };
  function expMissionHTML() {
    const cur = A.exp && EXPS.find(e => e.id === A.exp.id);
    return `<div class="mission special exp-mission ${cur ? "done" : ""}"><span class="ico-tile" style="width:40px;height:40px;background:rgba(251,146,60,.14);color:var(--t-orange);font-size:19px">${svg(cur ? cur.ic : "ticket")}</span>
      <div class="min-w-0"><div class="font-semibold text-[14px] leading-snug">Inscríbete en una experiencia presencial (arte, cocina, deporte)</div><div class="text-[12px] ${cur ? "" : "text-mute"}" ${cur ? 'style="color:var(--t-emerald)"' : ""}>${cur ? `Inscrito: ${cur.name} · ${cur.time}` : `Elige una actividad · +${EXP_XP} XP`}</div></div>
      ${act("goto", "quests:expCard", cur ? "Ver" : "Elegir", cur ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm")}
    </div>`;
  }
  /* Experiencias presenciales: tarjetas modulares, reutilizadas en Misiones y en Mis eventos */
  function expGridHTML(cur) {
    return `<div class="xp-wrap"><ul class="xp-grid">${EXPS.map(e => { const on = !!(cur && cur.id === e.id), ask = expAsk === e.id;
      return `<li class="xp-card ${on ? "on" : ""} ${ask ? "ask" : ""}">
        <div class="xp-head"><span class="xp-ic" aria-hidden="true">${svg(e.ic)}</span>${on ? `<span class="chip chip-emerald">${svg("check")}Inscrito</span>` : A.exp ? "" : `<span class="chip chip-accent">+${EXP_XP} XP</span>`}</div>
        <h3 class="xp-title">${e.name}</h3>
        <p class="xp-desc">${e.desc}</p>
        <ul class="xp-meta"><li>${svg("clock")}<span>${e.time}</span></li><li>${svg("pin")}<span>${e.where}</span></li></ul>
        <div class="xp-foot">${on ? `<span class="xp-mine">${svg("check")}Es tu actividad</span>`
          : `<button type="button" class="btn ${cur ? "btn-ghost" : "btn-primary"} btn-sm" data-act="expjoin" data-v="${e.id}">${svg(cur ? "shuffle" : "arrow")}${cur ? "Cambiar a esta" : "Inscribirme"}</button>`}</div>
      </li>`; }).join("")}</ul>${expConfirmHTML()}</div>`;
  }
  function expCardHTML() {
    const cur = A.exp && EXPS.find(e => e.id === A.exp.id);
    return `<article class="pcard" id="expCard">
      <header class="pcard-h"><div><span class="pcard-k">Misión especial · AI &amp; Business Summit</span><h2 class="pcard-t">Experiencias presenciales</h2><div class="text-mute text-[14px]">${cur ? `Estás inscrito en <b>${cur.name}</b>. Puedes cambiarla cuando quieras.` : `Elige una actividad de arte, cocina o deporte y suma +${EXP_XP} XP.`}</div></div><span class="chip ${cur ? "chip-emerald" : ""} tabular">${svg("users")}${cur ? 1 : 0}/1</span></header>
      ${expGridHTML(cur)}
    </article>`;
  }

  function rewardsHTML(full) {
    const me = PERSONAS[A.ind];
    const face = (f) => `<span class="rw-av av-frame frame-${f.id}">${A.avatar ? avatarSVG(A.avatar, 64) : `<span class="team-avatar" style="width:64px;height:64px;font-size:20px">${me.initials}</span>`}</span>`;
    return `<article class="pcard" id="rewardsCard">
      <header class="pcard-h"><div><span class="pcard-k">Recompensas desbloqueables</span><h2 class="pcard-t">Marcos y estilos exclusivos para tu avatar</h2></div><span class="chip chip-accent tabular">${svg("trophy")}${(A.frames || []).length + (A.items || []).length}/${FRAMES.length + AV_XHAIR.length + AV_XACC.length} reclamados</span></header>
      <p class="text-mute text-[14px]" style="margin-top:-6px">Acumula XP para reclamar marcos, peinados y accesorios que cambian tu avatar en todo KNET. Reclamar no gasta tu XP.</p>
      <div class="rw-grid">${FRAMES.map(f => { const got = (A.frames || []).includes(f.id), can = A.xp >= f.xp, on = A.frame === f.id && got, pct = Math.min(100, Math.round(A.xp / f.xp * 100));
        return `<div class="rw ${got ? "got" : can ? "ready" : "locked"} ${on ? "on" : ""}" tabindex="0" aria-label="${f.name}: ${got ? "reclamado" : can ? "listo para reclamar" : `te faltan ${f.xp - A.xp} XP`}">
          ${face(f)}
          <div class="rw-name">${f.name}</div>
          <div class="rw-meta">${got ? (on ? "Equipado" : "Reclamado") : can ? "¡Listo para reclamar!" : `${fmt(f.xp)} XP`}</div>
          ${got ? "" : `<div class="xpbar" style="height:6px;width:100%"><span style="width:${pct}%"></span></div>`}
          <div class="rw-tip" role="tooltip">${got ? f.desc : can ? `Ya tienes ${fmt(A.xp)} XP. ${f.desc}` : `Te faltan <b>${fmt(f.xp - A.xp)} XP</b>. Completa misiones, inscríbete en eventos o conecta por QR.`}</div>
          ${got ? (on ? act("frameoff", f.id, "Quitar", "btn btn-ghost btn-sm") : act("frameon", f.id, "Equipar", "btn btn-primary btn-sm")) : can ? act("frameclaim", f.id, `${svg("star")}Reclamar`, "btn btn-emerald btn-sm") : `<button type="button" class="btn btn-ghost btn-sm" disabled>${svg("lock")}Bloqueado</button>`}
        </div>`; }).join("")}</div>
      ${full || rwMore ? rewardsMoreHTML() : ""}
      ${full ? "" : `<button type="button" class="rw-more" data-act="rwmore" aria-expanded="${rwMore}" aria-controls="rwMore">${rwMore ? "Ver menos" : "Ver más recompensas"}<span class="rw-more-ic">${svg("chev")}</span></button>`}
    </article>`;
  }
  let rwMore = false;
  function rewardsMoreHTML() {
    const base = A.avatar || avDefault("neutro");
    const card = (kind, [id, name, xp, desc]) => {
      const got = ownsItem(id), can = A.xp >= xp, key = kind === "hair" ? "hair" : "acc", on = got && A.avatar && A.avatar[key] === id, pct = Math.min(100, Math.round(A.xp / xp * 100));
      const prev = { ...base, [key]: id }; if (kind === "hair") prev.beard = false;
      return `<div class="rw ${got ? "got" : can ? "ready" : "locked"} ${on ? "on" : ""}" tabindex="0" aria-label="${name}: ${got ? "reclamado" : can ? "listo para reclamar" : `te faltan ${xp - A.xp} XP`}">
        <span class="rw-av rw-item">${avatarSVG(prev, 64)}</span>
        <div class="rw-name">${name}</div>
        <div class="rw-meta">${got ? (on ? "Equipado" : "Reclamado") : can ? "¡Listo para reclamar!" : `${fmt(xp)} XP`}</div>
        ${got ? "" : `<div class="xpbar" style="height:6px;width:100%"><span style="width:${pct}%"></span></div>`}
        <div class="rw-tip" role="tooltip">${got ? desc : can ? `Ya tienes ${fmt(A.xp)} XP. ${desc}` : `Te faltan <b>${fmt(xp - A.xp)} XP</b>. ${desc}`}</div>
        ${got ? (on ? act("itemoff", id, "Quitar", "btn btn-ghost btn-sm") : act("itemon", id, "Usar", "btn btn-primary btn-sm")) : can ? act("itemclaim", id, `${svg("star")}Reclamar`, "btn btn-emerald btn-sm") : `<button type="button" class="btn btn-ghost btn-sm" disabled>${svg("lock")}Bloqueado</button>`}
      </div>`; };
    return `<div class="rw-extra" id="rwMore">
      <div><div class="rw-sec">${svg("spark")}Peinados exclusivos</div><div class="rw-grid">${AV_XHAIR.map(h => card("hair", h)).join("")}</div></div>
      <div><div class="rw-sec">${svg("star")}Accesorios exclusivos</div><div class="rw-grid">${AV_XACC.map(x => card("acc", x)).join("")}</div></div>
      <p class="text-[12.5px] text-mute">Lo que reclames también aparece en el editor de tu avatar, marcado con ★. ${A.avatar ? "" : "Crea tu avatar para poder usarlo."}</p>
    </div>`;
  }

  /* ---- Exp 02 · Quests ---- */
  function tabQuests() {
    const into = A.xp % 500, C = 326.7, am = activeMissions(), b = board(), me = b.findIndex(r => r.me);
    const rows = b.map((r, i) => ({ ...r, pos: i + 1 })).filter((r, i) => i < 5 || r.me);
    return `<div class="stack"><div class="app-grid-q">
      <div class="stack">
        <section class="level-hero" aria-label="Nivel actual">
          <span class="pcard-k">Experiencia 02 · Misiones</span>
          <div class="lvl-ring" tabindex="0" aria-describedby="lvlTip"><span class="lvl-tip" id="lvlTip" role="tooltip">${lvlMax() ? `Alcanzaste el nivel máximo: <b>${lvlName()}</b>` : `Te faltan <b>${fmt(500 - into)} XP</b> para el nivel ${lvl() + 1} · ${LEVELS[lvl()]}`}</span>
            <svg viewBox="0 0 120 120" width="168" height="168" aria-hidden="true"><defs><linearGradient id="ringApp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10B981"/><stop offset=".55" stop-color="#3D6BFF"/><stop offset="1" stop-color="#BE82FF"/></linearGradient></defs><circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.07)" stroke-width="9" fill="none"/><circle cx="60" cy="60" r="52" stroke="url(#ringApp)" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - into / 500)}" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)"/></svg>
            <div class="ring-c"><div class="font-display font-extrabold" style="font-size:40px;line-height:1">${lvl()}</div><div class="mono text-[11px] text-mute">NIVEL</div></div>
          </div>
          <div class="lvl-id">${lvlBadge(lvl(), 56)}<div class="min-w-0" style="text-align:left"><div class="font-display font-bold text-lg">${lvlName()}</div><div class="text-mute text-sm tabular">${fmt(A.xp)} XP · ${lvlMax() ? "nivel máximo" : `faltan ${fmt(500 - into)} para nivel ${lvl() + 1}`}</div></div></div>
          <ol class="lvl-path" aria-label="Ruta de niveles">${LEVELS.map((nm, i) => { const n = i + 1, got = lvl() >= n, cur = Math.min(lvl(), LEVELS.length) === n;
            return `<li class="${got ? "got" : ""} ${cur ? "cur" : ""}" tabindex="0">${lvlBadge(n, 40, !got)}<span>${nm}</span><span class="lvl-path-tip" role="tooltip">${got ? (cur ? "Tu nivel actual" : "Desbloqueado") : `Desde ${fmt(i * 500)} XP · te faltan ${fmt(i * 500 - A.xp)} XP`}</span></li>`; }).join("")}</ol>
          <button type="button" class="nfc-btn" data-act="nfc">${svg("nfc")}<span><b>Simular toque NFC</b><small>Tótem del pabellón · +25 XP</small></span></button>
        </section>
        <article class="pcard">
          <header class="pcard-h"><div><span class="pcard-k">Colección</span><h2 class="pcard-t">Insignias</h2></div><span class="mono text-[13px] text-mute tabular">${badgeNames().length}/${badges().length}</span></header>
          <p class="text-mute text-[13px]" style="margin-top:-8px">Pasa el cursor o toca una insignia para ver qué te falta.</p>
          <div class="flip-grid">${badges().map(x => `<button type="button" class="flip ${x.ok ? "is-ok" : "is-locked"}" data-act="flip" aria-label="${x.n}: ${x.ok ? "obtenida. " + x.got : "bloqueada. " + x.need}">
            <span class="flip-in" aria-hidden="true">
              <span class="flip-face flip-front"><span class="ico-tile" style="width:40px;height:40px;border-radius:50%;background:${x.ok ? "rgba(16,185,129,.16);color:var(--t-emerald)" : "rgba(var(--w-rgb),.06);color:var(--muted)"}">${svg(x.ok ? x.i : "lock")}</span><span class="font-semibold leading-tight">${x.n}</span><span class="text-[11px] ${x.ok ? "" : "text-mute"}" ${x.ok ? 'style="color:var(--t-emerald)"' : ""}>${x.ok ? "Obtenida" : "Bloqueada"}</span></span>
              <span class="flip-face flip-back"><span class="mono text-[10px] uppercase tracking-[.12em]" style="color:${x.ok ? "var(--t-emerald)" : "var(--t-lilac)"}">${x.ok ? "Cómo la ganaste" : "Te falta"}</span><span class="text-[12.5px] leading-snug">${x.ok ? x.got : x.need}</span></span>
            </span></button>`).join("")}</div>
        </article>
      </div>
      <div class="stack">
        <article class="pcard">
          <header class="pcard-h"><div><span class="pcard-k">En vivo</span><h2 class="pcard-t">Misiones activas</h2></div><span class="chip chip-emerald tabular">${A.done.length}/${missionPool().length} completadas</span></header>
          <div class="grid gap-3">${am.length ? am.map(m => `<div class="mission"><span class="ico-tile" style="width:40px;height:40px;background:rgba(61,107,255,.1);color:var(--t-blue)">${svg(m.icon)}</span><div class="min-w-0"><div class="font-semibold text-[14px] leading-snug">${m.title}</div><div class="text-[12px] text-mute">${m.sub} · +${m.xp} XP</div></div>${act("complete", m.id, "Completar", "btn btn-emerald btn-sm")}</div>`).join("")
            : `<div class="dempty">${svg("trophy")} Completaste todas las misiones de la temporada. Nuevas misiones se abren en el siguiente bloque.</div>`}</div>
          <div class="mono text-[11px] uppercase tracking-[.12em] text-mute" style="margin-top:4px">Misiones especiales</div>
          <div class="grid gap-3">
            <div class="mission special ${A.avatar ? "done" : ""}"><span class="ico-tile" style="width:40px;height:40px;background:rgba(161,0,255,.16);color:var(--t-lilac)">${A.avatar ? avatarSVG(A.avatar, 40) : svg("users")}</span><div class="min-w-0"><div class="font-semibold text-[14px] leading-snug">Crea tu avatar del Summit</div><div class="text-[12px] ${A.avatar ? "" : "text-mute"}" ${A.avatar ? 'style="color:var(--t-emerald)"' : ""}>${A.avatar ? "Completada · +50 XP" : "Personalización · +50 XP"}</div></div>${act("avedit", "", A.avatar ? "Editar" : "Crear", A.avatar ? "btn btn-ghost btn-sm" : "btn btn-emerald btn-sm")}</div>
            ${expMissionHTML()}
          </div>
        </article>
        <article class="pcard">
          <header class="pcard-h"><div><span class="pcard-k">Summit 2026</span><h2 class="pcard-t">Ranking de asistentes</h2></div><span class="chip chip-accent">#${me + 1} de ${b.length}</span></header>
          <div class="grid gap-1">${rows.map(r => `<div class="lb-row ${r.me ? "me" : ""}"><span class="lb-pos tabular">#${r.pos}</span><span class="min-w-0 ${r.me ? "font-semibold" : ""}">${r.n}</span><span class="mono tabular text-[13px] ${r.me ? "" : "text-mute"}">${fmt(r.x)} XP</span></div>`).join("")}</div>
        </article>
      </div>
    </div>
    ${expCardHTML()}
    ${groupMissionsHTML()}
    </div>`;
  }

  /* ---- Exp 03 · Concierge + perfil de match ---- */
  const bubble = (m) => `<div class="bubble ${m.who === "me" ? "me" : "ai"}">${m.html}</div>`;
  function tabConcierge() {
    const d = IND[A.ind];
    return `<div class="stack concierge-solo">
      <article class="pcard">
        <header class="pcard-h"><div><span class="pcard-k">Experiencia 05 · AI Concierge</span><h2 class="pcard-t">Tu asistente del Summit</h2></div><span class="chip chip-accent">${svg("bot")}RAG · 148 sesiones</span></header>
        <div class="chat-log" id="chatLog" aria-live="polite">${A.chat.map(bubble).join("")}</div>
        <div class="flex flex-wrap gap-2">${PILLS.map(q => act("ask", q, q)).join("")}</div>
        <form id="chatForm" class="chat-form" autocomplete="off"><label for="chatIn" class="sr-only">Pregunta al Concierge</label><input id="chatIn" class="select" placeholder="Pregunta por tu agenda, matches, misiones…" maxlength="160"><button class="btn btn-primary btn-sm" type="submit">${svg("arrow")}<span>Enviar</span></button></form>
        <p class="text-[12px] text-mute" style="margin-top:-8px">No compartas datos sensibles (salud, creencias, datos financieros) en el chat.</p>
      </article>
    </div>`;
  }
  function personHTML(n, state) {
    const d = IND[A.ind], p = PERSONAS[A.ind], m = d.matches.find(x => x[1] === n), info = MATCH_INFO[n] || { int: [], likes: [], goal: "" }, idx = d.matches.indexOf(m), sc = m[3];
    const common = info.int.filter(x => p.interests.includes(x));
    const shared = [idx, 3].filter((v, i, a) => a.indexOf(v) === i).map(i => d.agenda[i]);
    const parts = [["Intereses en común", 35, Math.round(sc * .35), common.length ? common.join(" · ") : "Temas cercanos a tus intereses"], ["Industria y mercado", 25, Math.round(sc * .25), `${d.label} · ${(m[2].split("·")[1] || "").trim() || "mismo sector"}`], ["Rol y seniority", 20, Math.round(sc * .2), `Ambos con rol de decisión (${p.seniority.toLowerCase()})`]];
    parts.push(["Agenda compartida", 20, sc - parts.reduce((a, x) => a + x[2], 0), `${shared.length} sesiones en común`]);
    const status = personStatusChip(n);
    const C = 289;
    return `<div class="flex items-start justify-between gap-4">
        <div class="person-id"><div class="avatar" style="width:60px;height:60px;font-size:20px;background:${avatarBg(idx)}">${m[0]}</div><div class="min-w-0"><span class="pcard-k">Perfil de match</span><h3 id="personName" class="font-display font-bold text-2xl leading-tight">${n}</h3><div class="text-mute text-[14px]">${m[2]}</div><div style="margin-top:8px">${status}</div></div></div>
        <button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar perfil">${svg("x")}</button>
      </div>
      <div class="person-grid">
        <div class="aff">
          <div class="aff-ring"><svg viewBox="0 0 110 110" width="120" height="120" aria-hidden="true"><circle cx="55" cy="55" r="46" stroke="rgba(255,255,255,.08)" stroke-width="8" fill="none"/><circle cx="55" cy="55" r="46" stroke="url(#ringApp2)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - sc / 100)}" transform="rotate(-90 55 55)"/><defs><linearGradient id="ringApp2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#A100FF"/><stop offset="1" stop-color="#3D6BFF"/></linearGradient></defs></svg><div class="ring-c"><div class="font-display font-extrabold text-[28px] leading-none tabular">${sc}%</div><div class="mono text-[10px] text-mute">AFINIDAD</div></div></div>
          <p class="text-[13px] text-mute" style="text-align:center">Busca ${info.goal}.</p>
        </div>
        <div class="grid gap-3 min-w-0">
          <div class="mono text-[11px] uppercase tracking-[.12em] text-mute">Por qué ${sc}%</div>
          ${parts.map(([l, max, pts, why]) => `<div class="aff-row"><div class="aff-top"><span class="font-semibold text-[14px]">${l}</span><span class="mono tabular text-[13px]" style="color:var(--t-blue)">+${pts} <span class="text-mute">/ ${max}</span></span></div><div class="scorebar"><span style="width:${pts / max * 100}%"></span></div><div class="text-[12.5px] text-mute">${why}</div></div>`).join("")}
          <div class="aff-total"><span>Total</span><span class="mono tabular">${parts.map(x => x[2]).join(" + ")} = <b>${sc}%</b></span></div>
        </div>
      </div>
      <div class="person-cols">
        <div><div class="mono text-[11px] uppercase tracking-[.12em] text-mute">Intereses</div><div class="flex flex-wrap gap-2" style="margin-top:8px">${info.int.map(x => `<span class="chip ${common.includes(x) ? "chip-accent" : ""}">${common.includes(x) ? svg("check") : ""}${x}</span>`).join("")}</div></div>
        <div><div class="mono text-[11px] uppercase tracking-[.12em] text-mute">Gustos</div><div class="flex flex-wrap gap-2" style="margin-top:8px">${info.likes.map(x => `<span class="chip">${svg("star")}${x}</span>`).join("")}</div></div>
        <div><div class="mono text-[11px] uppercase tracking-[.12em] text-mute">Sesiones que comparten</div><div class="grid gap-1.5" style="margin-top:8px">${shared.map(a => `<div class="text-[13px]"><span class="mono text-accentsoft">${a[0]}</span> ${a[2]}</div>`).join("")}</div></div>
      </div>
      <div class="person-actions">${personActions(n)}</div>`;
  }
  /* ---- Conexiones con aprobación, cafés y chat 1:1 (simulados) ---- */
  
  const reqOf = (n) => (A.requests || {})[n];
  const coffeeOf = (n) => (A.coffees || {})[n];
  const isConn = (n) => A.connections.includes(n);
  const isPending = (n) => !isConn(n) && reqOf(n) && reqOf(n).status === "pending";
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a));
  const timers = new Set();
  function scheduleResponses() {
    if (!A.connected) return;
    const now = Date.now();
    Object.entries(A.requests || {}).forEach(([n, r]) => { const k = "req:" + n + r.at; if (r.status !== "pending" || timers.has(k)) return; timers.add(k); setTimeout(() => { timers.delete(k); resolveRequest(n, r.at); }, Math.max(400, r.due - now)); });
    Object.entries(A.coffees || {}).forEach(([n, c]) => { const k = "cof:" + n + c.at; if (c.status !== "pending" || timers.has(k)) return; timers.add(k); setTimeout(() => { timers.delete(k); resolveCoffee(n, c.at); }, Math.max(400, c.due - now)); });
  }
  const personOpenFor = (n) => !$("#m-person").hidden && $("#personName") && $("#personName").textContent === n;
  function resolveRequest(n, at) {
    const r = reqOf(n); if (!A.connected || !r || r.at !== at || r.status !== "pending") return;
    award(() => { r.status = "accepted"; r.answered = Date.now(); if (!isConn(n)) A.connections.push(n); }, CONN_XP, `${n} aceptó tu solicitud de conexión`, "users", "conn");
    apiRun({ t: "conn", id: n, state: "accepted", source: "request" });
    if (personOpenFor(n)) openPerson(n);
    if (!$("#m-dm").hidden && dmFor === n) renderDm();
  }
  function resolveCoffee(n, at) {
    const c = coffeeOf(n); if (!A.connected || !c || c.at !== at || c.status !== "pending") return;
    award(() => { c.status = "accepted"; c.answered = Date.now(); }, 50, `${n} aceptó el café`, "coffee");
    setTimeout(() => toast(`<b>Café confirmado</b><div class="text-[13px] text-mute">${esc(c.slot)} · lo añadimos a tu plan</div>`, "calendar"), 500);
    if (personOpenFor(n)) openPerson(n);
  }
  function connectMatch(n) {
    if (isConn(n)) { openPerson(n); return; }
    if (isPending(n)) { toast(`<b>Ya enviaste la solicitud</b><div class="text-[13px] text-mute">Esperando que ${esc(first(n))} la apruebe.</div>`, "clock"); openPerson(n); return; }
    A.requests = A.requests || {}; const at = Date.now();
    A.requests[n] = { status: "pending", at, due: at + rnd(4500, 8000) };
    save(); toast(`<b>Solicitud enviada a ${esc(n)}</b><div class="text-[13px] text-mute">La conexión se crea cuando la apruebe. +100 XP al aceptar.</div>`, "users");
    refresh(); openPerson(n); scheduleResponses();
    apiRun({ t: "conn", id: n, state: "pending", source: "request" });
  }
  function cancelRequest(n) { if (!isPending(n)) return; delete A.requests[n]; save(); apiConnRemoved(n); toast(`<b>Solicitud cancelada</b>`, "x"); refresh(); if (personOpenFor(n)) openPerson(n); }
  function proposeCoffee(n) {
    if (!isConn(n)) { toast("<b>Primero conecten</b><div class='text-[13px] text-mute'>Puedes proponer un café cuando acepte tu solicitud.</div>", "info"); return; }
    const c = coffeeOf(n); if (c && (c.status === "pending" || c.status === "accepted")) return;
    A.coffees = A.coffees || {}; const at = Date.now(), idx = IND[A.ind].matches.findIndex(m => m[1] === n);
    A.coffees[n] = { status: "pending", at, due: at + rnd(5000, 9000), slot: COFFEE_SLOTS[(idx + Object.keys(A.coffees).length) % COFFEE_SLOTS.length] };
    save(); toast(`<b>Invitación a café enviada</b><div class="text-[13px] text-mute">${esc(A.coffees[n].slot)} · esperando que ${esc(first(n))} acepte.</div>`, "coffee");
    refresh(); if (personOpenFor(n)) openPerson(n); scheduleResponses();
  }
  function personStatusChip(n) {
    if (isConn(n)) return `<span class="chip chip-emerald" id="personStatus">${svg("check")}Conectados</span>`;
    if (isPending(n)) return `<span class="chip chip-cyan" id="personStatus"><span class="pend-dot"></span>Solicitud enviada · esperando aprobación</span>`;
    return `<span class="chip" id="personStatus">${svg("users")}Aún no conectan</span>`;
  }
  function personActions(n) {
    const c = coffeeOf(n);
    const coffeeBtn = !isConn(n) ? "" : c && c.status === "accepted" ? `<span class="chip chip-emerald">${svg("coffee")}Café confirmado · ${esc(c.slot)}</span>`
      : c && c.status === "pending" ? `<span class="chip chip-cyan"><span class="pend-dot"></span>Café propuesto · esperando respuesta</span>`
      : `<button type="button" class="btn btn-ghost btn-sm" data-pact="coffee" data-v="${esc(n)}">${svg("coffee")}Proponer café de 15 min</button>`;
    const main = isConn(n) ? `<button type="button" class="btn btn-primary btn-sm" data-pact="chat" data-v="${esc(n)}">${svg("msg")}Chatear con ${esc(first(n))}</button>`
      : isPending(n) ? `<button type="button" class="btn btn-ghost btn-sm" disabled>${svg("clock")}Esperando aprobación</button><button type="button" class="pill-btn" data-pact="cancel" data-v="${esc(n)}">Cancelar solicitud</button>`
      : `<button type="button" class="btn btn-primary btn-sm" data-pact="connect" data-v="${esc(n)}">${svg("handshake")}Enviar solicitud de conexión</button>`;
    return `${main}${coffeeBtn}<button type="button" class="btn btn-ghost btn-sm" data-pact="ask" data-v="${esc(n)}">${svg("bot")}¿Cómo me presento?</button>`;
  }
  function matchActions(n) {
    if (isConn(n)) return `<span class="chip chip-emerald">${svg("check")}Conectado</span>${act("chat", n, `${svg("msg")}Chatear`, "btn btn-primary btn-sm")}`;
    if (isPending(n)) return `<span class="chip chip-cyan"><span class="pend-dot"></span>Esperando aprobación</span>`;
    return act("connect", n, `${svg("handshake")}Conectar · +100 XP`, "btn btn-primary btn-sm");
  }
  function openPerson(n) { $("#personBody").innerHTML = personHTML(n); if ($("#m-person").hidden) openModal("person"); }
  $("#m-person").addEventListener("click", (e) => { const b = e.target.closest("[data-pact]"); if (!b) return; const n = b.dataset.v;
    if (b.dataset.pact === "connect") connectMatch(n);
    if (b.dataset.pact === "cancel") cancelRequest(n);
    if (b.dataset.pact === "coffee") proposeCoffee(n);
    if (b.dataset.pact === "chat") { closeModal($("#m-person")); openChat(n); }
    if (b.dataset.pact === "ask") { closeModal($("#m-person")); goTo("concierge"); setTimeout(() => ask(`¿Cómo me presento con ${n}?`), 350); }
  });

  /* Chat 1:1 con la persona conectada */
  let dmFor = null, dmBusy = false;
  
  function dmReply(n, q) {
    const t = norm(q), info = MATCH_INFO[n] || { int: ["innovación"], goal: "conocer gente" }, d = IND[A.ind], idx = d.matches.findIndex(m => m[1] === n), ses = d.agenda[Math.max(0, idx)], me = first(PERSONAS[A.ind].name);
    if (/cafe|tinto/.test(t)) { const c = coffeeOf(n); return c && c.status === "accepted" ? `¡Sí! Ya lo tenemos: ${c.slot}. Nos vemos allá.` : c && c.status === "pending" ? "Ya vi tu invitación, déjame revisar mi agenda y te confirmo." : "¡Me encantaría! Envíame la invitación desde mi perfil y la acepto."; }
    if (/hola|buen|que bueno|gusto/.test(t)) return `¡Hola, ${me}! El gusto es mío. Vine al Summit sobre todo por ${info.int[0].toLowerCase()}. ¿Tú qué estás buscando?`;
    if (/sesion|charla|tarde|agenda/.test(t)) return `Voy a «${ses[2]}» a las ${ses[0]} en ${ses[3]}. ¿Te veo allí?`;
    if (/trabaj|proyecto|haces/.test(t)) return `Ahora mismo trabajo en ${info.int[0].toLowerCase()} y ${info.int[1].toLowerCase()}. ¿Cómo lo están abordando en ${PERSONAS[A.ind].company || "tu equipo"}?`;
    return ["Interesante. Me gustaría saber más; ¿lo hablamos en persona?", "¡Totalmente de acuerdo! Después del próximo bloque te escribo.", `Eso conecta con lo que hago en ${info.int[0].toLowerCase()}. Te comparto mis notas al final del día.`][(A.dms[n] || []).length % 3];
  }
  function renderDm() {
    const n = dmFor, d = IND[A.ind], q = qrPerson(n), m = d.matches.find(x => x[1] === n) || [initialsOf(n), n, q ? q.role + " · conectado por QR" : ""], idx = Math.max(0, d.matches.indexOf(m)), msgs = (A.dms || {})[n] || [];
    $("#dmBody").innerHTML = `
      <div class="mh dm-head"><div class="person-id"><div class="avatar" style="width:44px;height:44px;background:${avatarBg(idx)}">${m[0]}</div><div class="min-w-0"><h3 id="dmTitle" class="font-display font-bold text-[18px] leading-tight">${esc(n)}</h3><div class="text-[12.5px] text-mute">${esc(m[2])}</div><div class="dm-online"><span></span>En el Summit ahora</div></div></div>
        <button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar chat">${svg("x")}</button></div>
      <div class="chat-log dm-log" id="dmLog" aria-live="polite">${msgs.length ? "" : `<div class="dm-empty">${svg("msg")}<span>Ya están conectados. Rompe el hielo con un mensaje.</span></div>`}${msgs.map(x => `<div class="bubble ${x.who === "me" ? "me" : "ai"}">${esc(x.text)}<span class="dm-time">${new Date(x.at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span></div>`).join("")}</div>
      <div class="flex flex-wrap gap-2">${DM_PILLS.map(q => `<button type="button" class="pill-btn" data-dmq="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      <form id="dmForm" class="chat-form" autocomplete="off"><label for="dmIn" class="sr-only">Mensaje para ${esc(n)}</label><input id="dmIn" class="select" maxlength="300" placeholder="Escribe un mensaje…"><button class="btn btn-primary btn-sm" type="submit">${svg("arrow")}<span>Enviar</span></button></form>
      <p class="text-[12px] text-mute">Conversación simulada para la demo. No compartas datos sensibles.</p>`;
    const log = $("#dmLog"); log.scrollTop = log.scrollHeight;
  }
  function openChat(n) {
    if (!isConn(n)) { toast("<b>Aún no están conectados</b><div class='text-[13px] text-mute'>El chat se habilita cuando acepte tu solicitud.</div>", "info"); return; }
    dmFor = n; A.dms = A.dms || {}; renderDm(); if ($("#m-dm").hidden) openModal("dm"); setTimeout(() => { const i = $("#dmIn"); if (i) i.focus(); }, 60);
  }
  async function sendDm(text) {
    text = String(text || "").trim(); const n = dmFor; if (!text || !n || dmBusy) return; dmBusy = true;
    (A.dms[n] = A.dms[n] || []).push({ who: "me", text, at: Date.now() }); save(); renderDm();
    const log = $("#dmLog"); log.insertAdjacentHTML("beforeend", `<div class="bubble ai typing" id="dmTyping" aria-label="${esc(first(n))} está escribiendo"><span></span><span></span><span></span></div>`); log.scrollTop = log.scrollHeight;
    await sleep(rnd(1100, 2000));
    A.dms[n].push({ who: "them", text: dmReply(n, text), at: Date.now() }); if (A.dms[n].length > 60) A.dms[n] = A.dms[n].slice(-60); save();
    dmBusy = false; if (!$("#m-dm").hidden && dmFor === n) { renderDm(); const i = $("#dmIn"); if (i) i.focus(); }
  }
  $("#m-dm").addEventListener("click", (e) => { const q = e.target.closest("[data-dmq]"); if (q) sendDm(q.dataset.dmq); });
  $("#m-dm").addEventListener("submit", (e) => { if (e.target.id !== "dmForm") return; e.preventDefault(); const i = $("#dmIn"); const v = i.value; i.value = ""; sendDm(v); });
  function reply(q) {
    const tq = q.toLowerCase(), d = IND[A.ind];
    const selM = myEvIds().length ? getSel("main") : null, todays = selM ? sessionsFor(selM.ev, selM.day) : [];
    const nextS = todays.find(x => !A.attended.includes(x.id));
    const free = d.matches.filter(m => !A.connections.includes(m[1]));
    const btn = (a, v, l) => `<div style="margin-top:8px">${act(a, v, l)}</div>`;
    const named = d.matches.find(m => tq.includes(m[1].toLowerCase()));
    if (named && /present|hablar|abord|romper/.test(tq)) { const info = MATCH_INFO[named[1]]; return `Con <b>${named[1]}</b> abre por su objetivo: ${info.goal}. Un buen arranque: “Vi que te interesa ${info.int[0].toLowerCase()}; en ${PERSONAS[A.ind].company} estamos trabajando en ${PERSONAS[A.ind].interests[0].toLowerCase()}.” Si fluye, propón un café de 15 min.`; }
    if (/sala|lado|cerca/.test(tq)) { const m = free[0] || d.matches[0]; return `En <b>Sala Orbit</b>, a 30 m, está <b>${m[1]}</b> (${m[2]}, ${m[3]}% afinidad). ${m[4]}.` + (free.length ? btn("connect", m[1], `Enviar solicitud a ${first(m[1])}`) : btn("person", m[1], "Ver perfil")); }
    if (/agenda|sesi|pr[oó]xim|charla/.test(tq)) { if (!selM) return "Aún no estás inscrito en ningún evento. Inscríbete y armo tu agenda por día." + btn("goto", "eventos", "Explorar eventos"); const evS = evById(selM.ev); if (!nextS) return `Ya hiciste check-in en todas tus sesiones del <b>Día ${selM.day + 1}</b> de ${evS.name}.` + btn("goto", "agenda", "Ver mi agenda"); return `Tu próxima sesión en <b>${evS.name}</b> (Día ${selM.day + 1}, ${dayTxt(evS.days[selM.day])}): <b>${nextS.ttl}</b>, a las ${nextS.tm} en <b>${nextS.room}</b>. ${nextS.why}.` + (isEnded("ev:" + evS.id) ? "" : btn("attend", nextS.id, "Hacer check-in · +40 XP")); }
    if (/match|conect|network|qui[eé]n|conocer/.test(tq)) { if (!free.length) return "Ya conectaste con tus 3 matches prioritarios. Te aviso si llega alguien con alta afinidad."; const m = free[0]; return `Te recomiendo a <b>${m[1]}</b>, ${m[2]} (${m[3]}% afinidad): ${m[4]}.` + btn("connect", m[1], "Enviar solicitud de conexión") + btn("person", m[1], "Ver perfil completo") + btn("goto", "red:matchesCard", "Ver todos en Mi red"); }
    if (/misi|xp|punto|nivel|insignia/.test(tq)) { const m = activeMissions().sort((a, b) => b.xp - a.xp)[0]; return m ? `La misión con más impacto ahora: <b>${m.title}</b> (+${m.xp} XP). Llevas ${fmt(A.xp)} XP.` + btn("goto", "quests", "Ver misiones") : "Completaste todas las misiones de la temporada."; }
    if (/resum|keynote|aprend|idea|insight/.test(tq)) { const ins = INSIGHTS[A.ind][0]; if (!A.extra.includes(ins)) A.extra.push(ins); return `Resumen del keynote: “${ins}” Lo guardé en tu Dossier.` + btn("goto", "dossier", "Ver Dossier"); }
    if (/evento|bogot|medell|barranq|pr[oó]ximo summit/.test(tq)) { const top = EVENTS.filter(e => !e.demo && (!e.lvl || lvl() >= e.lvl)).map(ev => [ev, evAffinity(ev).score]).sort((a, b) => b[1] - a[1])[0]; return `El evento más afín a tu perfil es <b>${top[0].name}</b> en ${top[0].city} (${top[0].date}), con ${top[1]}% de afinidad.` + btn("goto", "eventos", "Ver mapa de eventos"); }
    if (/dossier|reporte|informe/.test(tq)) return `Tu Dossier lleva ${A.attended.length} sesiones, ${insights().length} insights y ${A.connections.length} conexiones.` + btn("goto", "dossier", "Abrir Dossier");
    if (/caf|comer|almuerzo|hambre|comida/.test(tq)) return "El almuerzo es a las 12:45 en el Foyer Norte. Hay café de especialidad en el Lounge B, ideal para reuniones 1:1.";
    if (/hola|buen/.test(tq)) return `¡Hola, ${first(PERSONAS[A.ind].name)}! Puedo ayudarte con tu agenda, quién está cerca, matches, misiones, eventos o resúmenes de charlas.`;
    return "Puedo ayudarte con tu agenda, quién está cerca, matches, misiones, próximos eventos o un resumen de las charlas. Prueba con una de las sugerencias.";
  }
  let asking = false;
  async function ask(q) {
    q = String(q).trim(); const log = $("#chatLog"); if (!q || asking || !log) return; asking = true;
    A.chat.push({ who: "me", html: esc(q) });
    log.insertAdjacentHTML("beforeend", bubble(A.chat[A.chat.length - 1]));
    log.insertAdjacentHTML("beforeend", `<div class="bubble ai typing" id="typing" aria-label="El Concierge está escribiendo"><span></span><span></span><span></span></div>`);
    log.scrollTop = log.scrollHeight;
    await sleep(650);
    const html = reply(q); A.chat.push({ who: "ai", html }); if (A.chat.length > 40) A.chat = A.chat.slice(-40); save();
    const ty = $("#typing"); if (ty) ty.outerHTML = bubble({ who: "ai", html });
    const l2 = $("#chatLog"); if (l2) l2.scrollTop = l2.scrollHeight;
    asking = false;
  }

  /* ---- Exp 04 · Dossier ---- */
  function tabDossier() {
    const p = PERSONAS[A.ind], d = IND[A.ind], acts = actions();
    const rs = getSel("res"), sess = resSessions(), ins = insights(sess), scope = resScopeLabel(rs);
    const planned = rs.ev === "all" ? myEvIds().reduce((n, id) => n + evById(id).days.length * 4, 0) : rs.day === -1 ? evById(rs.ev).days.length * 4 : 4;
    const col = (key, icon, title, sub, body) => `<section class="dcol" style="--c:${STEP_C[key][0]};--fg:${STEP_C[key][1]}"><header class="dcol-h"><span class="cyc-ico" style="width:44px;height:44px;border-radius:14px">${svg(icon)}</span><div><div class="font-display font-extrabold text-[18px] leading-tight">${title}</div><div class="text-[12px] text-mute">${sub}</div></div></header><div class="grid gap-2">${body}</div></section>`;
    const empty = (txt, target, l) => `<div class="dempty">${txt}<div style="margin-top:8px">${act("goto", target, `${l} ${svg("arrow")}`)}</div></div>`;
    const done = acts.filter(a => A.actions[a.id]).length;
    const when = A.dossierAt ? new Date(A.dossierAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";
    return `<div class="stack">
      ${evDayBar("res")}
      <article class="pcard">
        <header class="pcard-h"><div><span class="pcard-k">Experiencia 08 · Dossier</span><h2 class="pcard-t">Dossier de ${p.name}</h2><div class="text-mute text-[14px]">${d.role} · ${p.company} · ${esc(scope)}</div></div>
          <div class="flex flex-wrap gap-2 items-center">${A.dossierAt ? `<span class="chip chip-emerald">${svg("check")}Generado · ${when}</span>` : `<span class="chip">${svg("clock")}Borrador en vivo</span>`}
          ${act("gen", "", `${svg("spark")}<span>${A.dossierAt ? "Regenerar" : "Generar Dossier final"}</span>`, A.dossierAt ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm")}${A.dossierAt ? act("dospdf", "", `${svg("file")}<span>Descargar PDF</span>`, "btn btn-primary btn-sm") : ""}${act("copy", "", `${svg("file")}Copiar resumen`, "btn btn-ghost btn-sm")}</div></header>
        <div class="stat-row">
          <div class="stat"><span class="stat-k">XP total</span><span class="stat-v tabular">${fmt(A.xp)}</span><span class="stat-s">Nivel ${lvl()} · ${lvlName()}</span></div>
          <div class="stat"><span class="stat-k">Sesiones</span><span class="stat-v tabular">${sess.length}<small>/${planned}</small></span><span class="stat-s">con check-in</span></div>
          <div class="stat"><span class="stat-k">Conexiones</span><span class="stat-v tabular">${A.connections.length}</span><span class="stat-s">con contexto</span></div>
          <div class="stat"><span class="stat-k">Plan</span><span class="stat-v tabular">${done}<small>/${acts.length}</small></span><span class="stat-s">acciones hechas</span></div>
        </div>
        <div id="copyFallback" hidden></div>
      </article>
      <div class="dgrid">
        ${col("evento", "calendar", "Evento", "Lo que viviste", sess.length ? sess.map(x => `<div class="ditem">${esc(x.ttl)}<small>${esc(evById(x.ev).city)} · Día ${x.day + 1} · ${x.tm} · ${esc(x.room)}</small></div>`).join("") : empty(`Aún no hay check-ins en ${esc(scope)}. Haz check-in desde tu Agenda IA.`, "agenda", "Ir a mi agenda"))}
        ${col("insight", "bulb", "Insight", "Lo que aprendiste", ins.length ? ins.map(x => `<div class="ditem">${x.text}<small>Fuente: ${x.src}</small></div>`).join("") : empty("Asiste a sesiones o pide un resumen al Concierge.", "concierge", "Abrir Concierge"))}
        ${col("conexion", "handshake", "Conexión", "A quién conociste", A.connections.length ? A.connections.map(n => { const m = d.matches.find(x => x[1] === n), q = qrPerson(n); return m ? `<button type="button" class="ditem ditem-btn" data-act="person" data-v="${esc(n)}">${n}<small>${m[2]} · ver perfil</small></button>` : `<button type="button" class="ditem ditem-btn" data-act="chat" data-v="${esc(n)}">${esc(n)}<small>${q ? esc(q.role) + " · por QR en " + esc(q.lugar) + ", " + esc(q.hora) : ""} · chatear</small></button>`; }).join("") : empty("Conecta con tus matches estratégicos.", "red:matchesCard", "Ver matches"))}
        ${col("accion", "bolt", "Acción", "Plan de 30 días", acts.map(a => `<label class="ditem dcheck" for="da-${esc(a.id)}"><input type="checkbox" id="da-${esc(a.id)}" data-action="${esc(a.id)}" ${A.actions[a.id] ? "checked" : ""}><span>${a.text}</span></label>`).join(""))}
      </div>
    </div>`;
  }
  const summaryText = () => {
    const p = PERSONAS[A.ind], d = IND[A.ind], L = [];
    L.push(`DOSSIER POST-SUMMIT · ${p.name} (${d.role}, ${p.company})`, `XP ${A.xp} · Nivel ${lvl()} · Misiones ${A.done.length} · Conexiones ${A.connections.length}`, "", "EVENTO");
    resSessions().forEach(x => L.push(`- ${evById(x.ev).name} · Día ${x.day + 1} · ${x.tm} ${x.ttl} (${x.room})`));
    L.push("", "INSIGHT"); insights().forEach(x => L.push(`- ${x.text} [${x.src}]`));
    L.push("", "CONEXIÓN"); A.connections.forEach(n => { const m = d.matches.find(x => x[1] === n); L.push(`- ${n}${m ? " · " + m[2] : ""}`); });
    L.push("", "ACCIÓN"); actions().forEach(a => L.push(`[${A.actions[a.id] ? "x" : " "}] ${a.text}`));
    L.push("", "Generado por KNET · Evento → Insight → Conexión → Acción");
    return L.join("\n");
  };

  /* ---- 05 · Próximos eventos (Colombia) ---- */
  function evAffinity(ev) { const p = PERSONAS[A.ind]; const overlap = ev.tags.filter(x => p.interests.includes(x)); const ind = ev.ind.includes(A.ind); return { score: Math.min(97, 52 + overlap.length * 14 + (ind ? 12 : 0)), overlap, ind }; }
  let selEvent = null;
  function tabEventos() {
    const p = PERSONAS[A.ind], d = IND[A.ind];
    const list = EVENTS.filter(e => !e.lvl && !e.demo).map(ev => ({ ev, a: evAffinity(ev) })).sort((x, y) => y.a.score - x.a.score);
    const selCity = selEvent ? (EVENTS.find(e => e.id === selEvent) || {}).city : null;
    const isOn = (ev) => !!selCity && ev.city === selCity;
    const S = 22.2, X = (lon) => (lon + 79.5) * S, Y = (lat) => (12.8 - lat) * S, f1 = (n) => n.toFixed(1);
    const pts = COL_OUTLINE.map(([lo, la]) => [X(lo), Y(la)]);
    const outline = pts.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join(" ") + "Z";
    const cx = pts.reduce((t, q) => t + q[0], 0) / pts.length, cy = pts.reduce((t, q) => t + q[1], 0) / pts.length;
    const contours = [.84, .68, .52, .36].map((k, i) => `<path d="${outline}" transform="translate(${f1(cx * (1 - k))} ${f1(cy * (1 - k))}) scale(${k})" fill="none" stroke="rgba(190,130,255,${(.2 - i * .04).toFixed(2)})" stroke-width=".8" vector-effect="non-scaling-stroke"/>`).join("");
    const line = (arr) => arr.map(([lo, la], i) => `${i ? "L" : "M"}${f1(X(lo))} ${f1(Y(la))}`).join(" ");
    const andes = [[[-77.9, 1.0], [-77.1, 3.5], [-76.3, 5.8], [-76.0, 7.4]], [[-77.2, 1.3], [-76.2, 3.2], [-75.5, 5.2], [-75.2, 7.2], [-74.9, 8.4]], [[-76.6, 1.6], [-75.3, 3.0], [-74.2, 4.6], [-73.0, 6.8], [-72.6, 7.8], [-73.1, 9.6]]].map(l => `<path class="andes" d="${line(l)}"/>`).join("");
    const river = `<path class="river" d="${line([[-76.3, 1.9], [-75.4, 3.6], [-74.85, 5.2], [-74.4, 7.0], [-74.0, 8.6], [-74.6, 10.1], [-74.85, 11.0]])}"/><text class="river-lbl" x="${f1(X(-74.15) - 4)}" y="${f1(Y(9.1))}" text-anchor="end">Río Magdalena</text>`;
    const grat = [0, 5, 10].map(la => `<line class="grat ${la === 0 ? "eq" : ""}" x1="0" x2="300" y1="${f1(Y(la))}" y2="${f1(Y(la))}"/><text class="grat-lbl" x="296" y="${f1(Y(la) - 3)}" text-anchor="end">${la === 0 ? "0° · Ecuador" : la + "°N"}</text>`).join("")
      + [-75, -70].map(lo => `<line class="grat" y1="0" y2="384" x1="${f1(X(lo))}" x2="${f1(X(lo))}"/><text class="grat-lbl" x="${f1(X(lo) + 3)}" y="380">${-lo}°O</text>`).join("");
    const nbs = [["VENEZUELA", -69.4, 8.6], ["BRASIL", -68.3, -2.3], ["PERÚ", -73.6, -3.4], ["ECUADOR", -78.6, -0.9], ["PANAMÁ", -79.3, 8.9]].map(([n, lo, la]) => `<text class="nb" x="${f1(X(lo))}" y="${f1(Y(la))}">${n}</text>`).join("");
    const loc = norm(p.location), meCity = CO_CITIES.find(c => loc && loc.includes(norm(c[0])));
    const evCities = EVENTS.filter(e => !e.lvl && !e.demo).map(e => norm(e.city));
    const cities = CO_CITIES.filter(c => !evCities.includes(norm(c[0])) && !(meCity && c[0] === meCity[0])).map(([n, la, lo]) => { const x = X(lo), y = Y(la), left = n === "Cali"; return `<circle class="city-dot" cx="${f1(x)}" cy="${f1(y)}" r="1.8"/><text class="city-lbl" x="${f1(left ? x - 4 : x + 4)}" y="${f1(y + 2.5)}" text-anchor="${left ? "end" : "start"}">${n}</text>`; }).join("");
    const distOf = (ev) => meCity ? (norm(meCity[0]) === norm(ev.city) ? 0 : kmBetween([meCity[1], meCity[2]], [ev.lat, ev.lon])) : null;
    let arcs = "", meMark = "";
    if (meCity) {
      const mx = X(meCity[2]), my = Y(meCity[1]);
      arcs = list.filter(({ ev }) => distOf(ev) > 0).map(({ ev }) => { const ex = X(ev.lon), ey = Y(ev.lat), dx = ex - mx, dy = ey - my, len = Math.hypot(dx, dy) || 1, bend = Math.min(40, len * .35);
        const qx = (mx + ex) / 2 - dy / len * bend, qy = (my + ey) / 2 + dx / len * bend;
        return `<path class="arc ${isOn(ev) ? "on" : ""}" d="M${f1(mx)} ${f1(my)} Q${f1(qx)} ${f1(qy)} ${f1(ex)} ${f1(ey)}"/>`; }).join("");
      const atEvent = EVENTS.filter(e => !e.lvl && !e.demo).some(e => norm(e.city) === norm(meCity[0]));
      meMark = atEvent ? `<circle class="me-ring" cx="${f1(mx)}" cy="${f1(my)}" r="15"/><text class="me-lbl" x="${f1(mx - 17)}" y="${f1(my + 3)}" text-anchor="end">Tú estás aquí</text>`
        : `<g class="me"><circle cx="${f1(mx)}" cy="${f1(my)}" r="9" class="me-halo"/><circle cx="${f1(mx)}" cy="${f1(my)}" r="5.5" class="me-dot"/><text class="me-lbl" x="${f1(mx)}" y="${f1(my + 19)}" text-anchor="middle">Tú · ${meCity[0]}</text></g>`;
    }
    const pins = list.map(({ ev, a }, i) => { const on = isOn(ev), x = X(ev.lon), y = Y(ev.lat), txt = `${ev.city} · ${a.score}%`, w = Math.round(txt.length * 5.7 + 18);
      return `<g class="pin ${on ? "on" : ""}" data-act="evselect" data-v="${ev.id}" tabindex="0" role="button" aria-label="${ev.city}: ${ev.name}, afinidad ${a.score}%">
        <ellipse class="pin-pulse" cx="${f1(x)}" cy="${f1(y)}" rx="9" ry="3.6"/>
        <g class="pin-body"><path d="M${f1(x)} ${f1(y)} c-5 -6.5 -8.5 -10 -8.5 -14.5 a8.5 8.5 0 1 1 17 0 c0 4.5 -3.5 8 -8.5 14.5z" fill="url(#pinGrad${on ? "On" : ""})" stroke="#0A0710" stroke-width="1.4"/><text x="${f1(x)}" y="${f1(y - 11.6)}" text-anchor="middle" class="pin-rank">${i + 1}</text></g>
        <g class="pin-pill"><rect x="${f1(x + 12)}" y="${f1(y - 29)}" width="${w}" height="17" rx="8.5"/><text x="${f1(x + 21)}" y="${f1(y - 17.5)}" class="pin-label">${txt}</text></g></g>`; }).join("");
    return `<div class="stack">
      <article class="pcard">
        <header class="pcard-h"><div><span class="pcard-k">Después del Summit · Colombia</span><h2 class="pcard-t">Próximos eventos afines a tu perfil</h2><div class="text-mute text-[14px]">Ordenados por afinidad con tus intereses: ${p.interests.join(", ")}.</div></div><span class="chip">${svg("info")}Fechas y sedes de referencia para la demo</span></header>
      </article>
      <div class="ev-grid">
        <article class="pcard map-card">
          <svg class="co-map" viewBox="0 0 300 384" role="group" aria-label="Mapa de Colombia con ${list.length} eventos${meCity ? " y tu ciudad, " + meCity[0] : ""}">
            <defs>
              <pattern id="mapGrid" width="22.2" height="22.2" patternUnits="userSpaceOnUse"><path d="M22.2 0H0V22.2" fill="none" stroke="rgba(255,255,255,.035)" stroke-width="1"/></pattern>
              <pattern id="landDots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".7" fill="rgba(220,175,255,.22)"/></pattern>
              <radialGradient id="seaGlow" cx="35%" cy="40%" r="75%"><stop offset="0" stop-color="rgba(61,107,255,.10)"/><stop offset="1" stop-color="rgba(61,107,255,0)"/></radialGradient>
              <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B1A6E"/><stop offset=".55" stop-color="#22175A"/><stop offset="1" stop-color="#0E3A4A"/></linearGradient>
              <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9DB4FF"/><stop offset="1" stop-color="#7500C0"/></linearGradient>
              <linearGradient id="pinGradOn" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#BE82FF"/></linearGradient>
              <filter id="landGlow" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="7"/></filter>
              <clipPath id="coClip"><path d="${outline}"/></clipPath>
            </defs>
            <rect width="300" height="384" fill="url(#seaGlow)"/>
            <path d="${outline}" fill="none" stroke="rgba(161,0,255,.55)" stroke-width="8" filter="url(#landGlow)"/>
            <path d="${outline}" fill="url(#landFill)"/>
            <g clip-path="url(#coClip)"><rect width="300" height="384" fill="url(#landDots)"/>${contours}</g>
            <path d="${outline}" fill="none" stroke="url(#pinGrad)" stroke-width="1.6" stroke-linejoin="round"/>
            ${nbs}
            <text x="${f1(X(-78.9))}" y="${f1(Y(12.0))}" class="sea">Mar Caribe</text>
            <text x="12" y="${f1(Y(1.6))}" transform="rotate(-90 12 ${f1(Y(1.6))})" class="sea">Océano Pacífico</text>
            <g class="inset"><rect x="6" y="34" width="52" height="40" rx="6"/><circle cx="24" cy="48" r="1.6"/><circle cx="28" cy="43" r="1.2"/><text x="32" y="50">San</text><text x="32" y="58">Andrés</text><text x="10" y="68">y Providencia</text></g>
            <g class="scale" transform="translate(196 356)"><path d="M0 0 h40 M0 -3 v6 M20 -2 v4 M40 -3 v6"/><text x="20" y="-6" text-anchor="middle">200 km</text></g>
            ${cities}${arcs}${meMark}${pins}
          </svg>
          <div class="map-legend"><span><i class="lg-pin"></i>Evento (número = ranking de afinidad)</span>${meCity ? `<span><i class="lg-me"></i>Tu ciudad</span>` : ""}</div>
          <div class="text-[12px] text-mute" style="text-align:center">Toca un pin para ver los eventos.</div>
        </article>
        <div class="grid gap-3 min-w-0">${list.filter(({ ev }) => !selCity || ev.city === selCity).map(({ ev, a }) => { const on = isOn(ev), saved = A.events.includes(ev.id);
          return `<article class="ev-card ${on ? "on" : ""}" id="ev-${ev.id}" data-ev="${ev.id}">
            <button type="button" class="ev-banner" data-act="evinfo" data-v="${ev.id}" aria-label="Ver resumen de ${ev.name}">${evBanner(ev)}<span class="ev-banner-tag">${EV_INFO[ev.id].formato.join(" · ")}</span></button>
            <div class="ev-top"><div class="min-w-0"><div class="flex flex-wrap gap-2 items-center"><span class="chip chip-cyan">${svg("pin")}${ev.city}</span><span class="chip">${svg("clock")}${ev.when}</span>${distOf(ev) === null ? "" : distOf(ev) === 0 ? `<span class="chip chip-emerald">${svg("pin")}En tu ciudad</span>` : `<span class="chip">${svg("compass")}A ${fmt(distOf(ev))} km de ti</span>`}</div>
              <h3 class="font-display font-bold text-[19px] leading-snug" style="margin-top:8px">${ev.name}</h3>
              <div class="ev-meta"><span>${svg("map")}${ev.venue}</span><span>${svg("calendar")}${ev.date}</span></div></div>
              <div class="ev-score"><span class="font-display font-extrabold text-[26px] leading-none tabular">${a.score}%</span><span class="mono text-[10px] text-mute">AFINIDAD</span></div></div>
            <div class="scorebar"><span style="width:${a.score}%"></span></div>
            <p class="text-[13.5px] text-mute">${ev.desc}</p>
            ${ev.real ? `<div class="ev-real"><span class="chip chip-emerald">${svg("check")}Evento real · ${ev.org}</span><a href="${ev.url}" target="_blank" rel="noopener" class="ev-src">${svg("link")}Ver fuente</a></div>` : ""}
            <div class="flex flex-wrap gap-2">${a.overlap.map(x => `<span class="chip chip-accent">${svg("check")}${x}</span>`).join("")}${a.ind ? `<span class="chip">${svg("target")}Relevante para ${d.label}</span>` : ""}${!a.overlap.length && !a.ind ? `<span class="chip">Afinidad base por temática general</span>` : ""}</div>
            <div class="ev-actions">${act("evsave", ev.id, saved ? `${svg("check")}Inscrito` : `${svg("calendar")}Inscribirse`, saved ? "btn btn-ghost btn-sm is-saved" : "btn btn-primary btn-sm")}${act("evinfo", ev.id, `${svg("spark")}Ver resumen`, "btn btn-ghost btn-sm")}${act("evselect", ev.id, `Ver en el mapa ${svg("arrow")}`, "pill-btn")}</div>
          </article>`; }).join("")}</div>
      </div>
      ${exclusiveHTML()}
    </div>`;
  }

  /* ---- Banners y resúmenes de eventos ---- */
  /* Ponentes y expertos por evento (perfiles ficticios para la demo; retratos ilustrados con el generador de avatares) */
  
  function speakersHTML(id) {
    const list = EV_SPEAKERS[id] || [], mine = PERSONAS[A.ind].interests;
    if (!list.length) return "";
    return `<section><h4>${svg("mic")}Ponentes y expertos</h4>
      <div class="spk-grid">${list.map(sp => { const fit = sp.tags.filter(t => mine.includes(t));
        return `<article class="spk">
          <div class="spk-top"><span class="spk-av">${avatarSVG(sp.av, 64)}</span><div class="min-w-0"><div class="spk-name">${sp.n}</div><div class="spk-role">${sp.role}</div><div class="spk-org">${sp.org}</div></div></div>
          <div class="spk-talk"><span class="spk-ses">${svg("clock")}${sp.ses}</span><b>“${sp.talk}”</b></div>
          <p class="spk-bio">${sp.bio}</p>
          <div class="spk-tags">${sp.tags.map(t => `<span class="${fit.includes(t) ? "fit" : ""}">${fit.includes(t) ? svg("check") : ""}${t}</span>`).join("")}</div>
          ${fit.length ? `<div class="spk-fit">${svg("spark")}Afín a tus intereses</div>` : ""}
        </article>`; }).join("")}</div>
      <p class="text-[12px] text-mute" style="margin-top:8px">Ponentes ficticios con retratos ilustrados, creados para la demo.</p>
    </section>`;
  }
  
  function evBanner(ev, cls = "") {
    const I = EV_INFO[ev.id], [c1, c2] = I.tone, g = "evg" + ev.id + (cls ? "m" : ""), stars = Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 53) % 400}" cy="${(i * 37) % 70 + 6}" r="${i % 3 ? .8 : 1.3}" fill="#fff" opacity="${.25 + (i % 4) * .12}"/>`).join("");
    const win = (x, y, w, h) => { let o = ""; for (let yy = y + 6; yy < y + h - 4; yy += 8) for (let xx = x + 4; xx < x + w - 4; xx += 7) if ((xx * 7 + yy * 3) % 5) o += `<rect x="${xx}" y="${yy}" width="2.5" height="3" fill="${I.accent}" opacity=".55"/>`; return o; };
    let scene = "";
    if (ev.city === "Bogotá" || ev.city === "Chía") scene = `
      <path d="M0 112 L40 70 L70 92 L110 46 L150 88 L190 60 L240 98 L290 52 L330 84 L400 64 V150 H0Z" fill="#2A1656" opacity=".9"/>
      <path d="M0 122 L60 96 L120 112 L170 84 L230 116 L300 90 L360 110 L400 98 V150 H0Z" fill="#1C1240"/>
      <path d="M106 49 h8 v-5 l-4 -3.5 l-4 3.5z" fill="#DCAFFF"/><path d="M110 40.5 v-4 M108.6 38 h2.8" stroke="#DCAFFF" stroke-width=".9"/>
      ${[[150, 92, 22, 58], [176, 74, 18, 76], [198, 54, 16, 96], [218, 86, 26, 64], [248, 98, 20, 52], [272, 80, 18, 70]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#140C2E"/>${win(x, y, w, h)}`).join("")}
      <path d="M198 54 l8 -12 l8 12z" fill="#140C2E"/>`;
    else if (ev.city === "Medellín") scene = `
      <path d="M0 60 C60 70 90 120 150 128 L0 150Z" fill="#123F3B"/><path d="M400 54 C330 66 300 118 240 128 L400 150Z" fill="#163B47"/>
      <path d="M0 96 C70 104 110 132 170 138 L0 150Z" fill="#0C2E2C"/><path d="M400 92 C330 100 290 132 230 138 L400 150Z" fill="#0E2C38"/>
      ${[[150, 108, 16, 42], [168, 96, 14, 54], [184, 112, 18, 38], [204, 100, 14, 50], [220, 114, 16, 36]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#081C22"/>${win(x, y, w, h)}`).join("")}
      <path d="M20 70 L380 40" stroke="#6EE7B7" stroke-width="1.2" opacity=".7"/>
      ${[[110, 61], [250, 49]].map(([x, y]) => `<line x1="${x}" y1="${y - 2}" x2="${x}" y2="${y + 6}" stroke="#6EE7B7" stroke-width="1"/><rect x="${x - 7}" y="${y + 6}" width="14" height="10" rx="2.5" fill="#FFD666" opacity=".9"/>`).join("")}
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${30 + i * 40}" cy="${142 - (i % 3) * 4}" r="2.2" fill="${["#FF8DB3", "#FFD666", "#BE82FF"][i % 3]}" opacity=".8"/>`).join("")}`;
    else scene = `
      <circle cx="300" cy="96" r="34" fill="url(#${g}s)"/>
      <rect x="0" y="100" width="400" height="50" fill="#0E2E4A"/>
      ${[104, 114, 126, 138].map((y, i) => `<path d="M0 ${y} q20 -4 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#9DB4FF" stroke-width="1" opacity="${.5 - i * .1}"/>`).join("")}
      <path d="M40 100 V54 h4 V100 M44 58 h46 v4 h-46 M86 62 v14" stroke="#1B0F2A" stroke-width="4" fill="none"/>
      <path d="M110 100 V64 h4 V100 M114 68 h34 v4 h-34 M144 72 v12" stroke="#1B0F2A" stroke-width="4" fill="none"/>
      <rect x="150" y="88" width="60" height="12" fill="#1B0F2A"/><rect x="156" y="80" width="16" height="8" fill="#FF8DB3" opacity=".7"/><rect x="174" y="80" width="16" height="8" fill="#9DB4FF" opacity=".7"/><rect x="192" y="80" width="12" height="8" fill="#FFD666" opacity=".7"/>
      <path d="M362 100 q-4 -26 2 -46" stroke="#1B0F2A" stroke-width="3.5" fill="none"/><path d="M364 54 q-18 -4 -26 8 M364 54 q16 -8 26 4 M364 54 q-6 -14 -18 -16 M364 54 q8 -14 20 -12" stroke="#1B0F2A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return `<svg class="ev-banner-svg ${cls}" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><radialGradient id="${g}s"><stop stop-color="#FFD27A"/><stop offset="1" stop-color="#FF6B86"/></radialGradient></defs><rect width="400" height="150" fill="url(#${g})"/>${stars}${scene}</svg>`;
  }
  /* ---- Eventos exclusivos según el nivel alcanzado ---- */
  const isLockedEv = (ev) => !!(ev && ev.lvl && lvl() < ev.lvl);
  function exclusiveHTML() {
    const ex = EVENTS.filter(e => e.lvl).sort((a, b) => a.lvl - b.lvl), open = ex.filter(e => !isLockedEv(e)).length;
    return `<article class="pcard xev-panel" id="exclusiveCard">
      <header class="pcard-h"><div><span class="pcard-k">Solo para tu nivel</span><h2 class="pcard-t">Eventos exclusivos por nivel</h2><div class="text-mute text-[14px]">Sube de nivel ganando XP para desbloquear experiencias reservadas.</div></div>
        <span class="xev-me">${lvlBadge(lvl(), 30)}<span><b>Nivel ${lvl()}</b> · ${lvlName()}<span class="block text-[12px] text-mute">${open}/${ex.length} desbloqueados</span></span></span></header>
      <div class="xev-grid">${ex.map(ev => { const lock = isLockedEv(ev), saved = A.events.includes(ev.id), need = Math.max(0, (ev.lvl - 1) * 500 - A.xp), I = EV_INFO[ev.id];
        return `<article class="xev ${lock ? "locked" : "open"}" id="ev-${ev.id}">
          <button type="button" class="xev-banner" data-act="evinfo" data-v="${ev.id}" aria-label="Ver detalles de ${ev.name}">${evBanner(ev)}${lock ? `<span class="xev-lock">${svg("lock")}<b>Nivel ${ev.lvl}</b></span>` : `<span class="xev-open">${svg("check")}Desbloqueado</span>`}</button>
          <div class="xev-body">
            <div class="xev-lvl">${lvlBadge(ev.lvl, 26, lock)}<span>Exclusivo nivel ${ev.lvl} · ${LEVELS[ev.lvl - 1]}</span></div>
            <h3 class="font-display font-bold text-[16.5px] leading-snug">${ev.name}</h3>
            <div class="me-meta"><span>${svg("pin")}${ev.city}</span><span>${svg("calendar")}${ev.date}</span></div>
            <ul class="xev-perks">${I.llevas.slice(0, 2).map(x => `<li>${svg("star")}${x}</li>`).join("")}</ul>
            ${lock ? `<div class="xev-need"><div class="flex justify-between text-[12px]"><span>Te faltan <b>${fmt(need)} XP</b></span><span class="text-mute tabular">${fmt(A.xp)}/${fmt((ev.lvl - 1) * 500)}</span></div><div class="xpbar" style="height:6px"><span style="width:${Math.min(100, Math.round(A.xp / ((ev.lvl - 1) * 500) * 100))}%"></span></div></div>` : ""}
            <div class="me-actions">${lock ? `<button type="button" class="btn btn-ghost btn-sm" disabled>${svg("lock")}Se desbloquea en nivel ${ev.lvl}</button>` : act("evsave", ev.id, saved ? `${svg("check")}Inscrito` : `${svg("calendar")}Inscribirse`, saved ? "btn btn-ghost btn-sm is-saved" : "btn btn-primary btn-sm")}${act("evinfo", ev.id, lock ? "Ver detalles" : `${svg("spark")}Ver resumen`, "btn btn-ghost btn-sm")}</div>
          </div>
        </article>`; }).join("")}</div>
    </article>`;
  }

  function openEvent(id) {
    const ev = EVENTS.find(e => e.id === id), I = EV_INFO[id], a = evAffinity(ev), d = IND[A.ind], saved = A.events.includes(id);
    const loc = norm(PERSONAS[A.ind].location), me = CO_CITIES.find(c => loc && loc.includes(norm(c[0])));
    const dist = me ? (norm(me[0]) === norm(ev.city) ? 0 : kmBetween([me[1], me[2]], [ev.lat, ev.lon])) : null;
    const why = [].concat(a.overlap.length ? [`Coincide con tus intereses: <b>${a.overlap.join(", ")}</b>.`] : [], a.ind ? [`Es relevante para la industria <b>${d.label}</b>.`] : [], dist === 0 ? ["Es en tu ciudad: no necesitas viajar."] : dist ? [`Está a ${fmt(dist)} km de ${me[0]}.`] : []);
    $("#evBody").innerHTML = `
      <div class="evm-banner">${evBanner(ev, "big")}<div class="evm-over"><div class="flex flex-wrap gap-2"><span class="chip chip-cyan">${svg("pin")}${ev.city}</span><span class="chip">${svg("calendar")}${ev.date}</span></div><h3 id="evTitle" class="font-display font-extrabold" style="font-size:clamp(22px,3vw,30px);line-height:1.1;margin-top:8px">${ev.name}</h3></div>
        <button class="btn btn-ghost btn-sm evm-x" data-close aria-label="Cerrar resumen">${svg("x")}</button></div>
      <div class="evm-body">
        <p class="evm-lema">${I.lema}</p>
        <div class="evm-facts">
          <div><span>Afinidad</span><b class="tabular" style="color:var(--t-blue)">${a.score}%</b></div>
          <div><span>Formato</span><b>${I.formato.join(" · ")}</b></div>
          <div><span>Sede</span><b>${ev.venue}</b></div>
          <div><span>Cuándo</span><b>${ev.date} · ${ev.when}</b></div>
        </div>
        <div class="evm-grid">
          <section><h4>${svg("users")}Para quién es</h4><p>${I.para}</p></section>
          <section><h4>${svg("target")}Por qué te lo recomendamos</h4>${why.length ? `<ul class="evm-why">${why.map(w => `<li>${svg("check")}<span>${w}</span></li>`).join("")}</ul>` : `<p>Tiene una temática general afín al Summit.</p>`}</section>
        </div>
        ${speakersHTML(id)}
        <section><h4>${svg("clock")}Así es el evento</h4><ol class="evm-tl">${I.agenda.map(([t, k, x]) => `<li><span class="evm-t mono">${t}</span><b>${k}</b><span class="text-mute">${x}</span></li>`).join("")}</ol></section>
        <section><h4>${svg("bolt")}Te llevas</h4><ul class="evm-take">${I.llevas.map(x => `<li>${svg("star")}<span>${x}</span></li>`).join("")}</ul></section>
        <p class="text-[12px] text-mute">Contenido, fechas y sedes de referencia para la demo.</p>
        <div class="av-foot">${ev.lvl ? `<span class="xev-lvl">${lvlBadge(ev.lvl, 24, isLockedEv(ev))}<span>Exclusivo nivel ${ev.lvl} · ${LEVELS[ev.lvl - 1]}</span></span>` : `<button type="button" class="btn btn-ghost btn-sm" data-eact="map" data-v="${id}">${svg("map")}Ver en el mapa</button>`}${isLockedEv(ev) ? `<button type="button" class="btn btn-ghost" disabled>${svg("lock")}Se desbloquea en nivel ${ev.lvl} · ${LEVELS[ev.lvl - 1]}</button>` : `<button type="button" class="btn ${saved ? "btn-ghost is-saved" : "btn-primary"}" data-eact="save" data-v="${id}">${saved ? `${svg("check")}Inscrito` : `${svg("calendar")}Inscribirse`}</button>`}</div>
      </div>`;
    if ($("#m-event").hidden) openModal("event");
  }
  $("#m-event").addEventListener("click", (e) => {
    const b = e.target.closest("[data-eact]"); if (!b) return; const id = b.dataset.v;
    if (b.dataset.eact === "map") { closeModal($("#m-event")); selEvent = id; refresh(); const m = $(".map-card"); if (m) { scrollToEl(m); flash(m); } return; }
    if (b.dataset.eact === "save") { const ev = EVENTS.find(x => x.id === id); if (!ev || isLockedEv(ev)) return; toggleRegistration(ev); refresh(); openEvent(id); }
  });

  /* =================== AVATAR =================== */
  
  
  
  
  AV_HAIR.neutro = AV_HAIR.mujer.concat(AV_HAIR.hombre);
  
  /* Recompensas exclusivas: peinados y accesorios que se desbloquean con XP */
  
  
  const ownsItem = (id) => (A.items || []).includes(id);
  
  const avDefault = (g) => ({ gender: g, skin: 1, hair: AV_HAIR[g][0][0], hairColor: 1, outfit: 0, acc: "credencial", beard: false });
  let avN = 0;
  function avatarSVG(av, size = 64) {
    const id = "avg" + (avN++), sk = AV_SKIN[av.skin], hc = AV_HAIRC[av.hairColor][0], oc = AV_OUT[av.outfit][0];
    const fringe = `<path d="M37 52 Q37 28 60 28 Q83 28 83 52 Q76 40 64 39 Q54 44 44 42 Q39 46 37 52Z" fill="${hc}"/>`;
    const braid = (x) => [62, 71, 80, 89, 98].map(y => `<ellipse cx="${x}" cy="${y}" rx="5.2" ry="5.6" fill="${hc}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`).join("");
    const back = { largo: `<path d="M35 52 Q34 24 60 24 Q86 24 85 52 L88 94 Q60 101 32 94 Z" fill="${hc}"/>`, bob: `<path d="M35 52 Q34 24 60 24 Q86 24 85 52 L85 74 Q60 80 35 74 Z" fill="${hc}"/>`,
      afro: `<circle cx="60" cy="42" r="29" fill="${hc}"/><circle cx="35" cy="54" r="13" fill="${hc}"/><circle cx="85" cy="54" r="13" fill="${hc}"/><circle cx="44" cy="25" r="11" fill="${hc}"/><circle cx="76" cy="25" r="11" fill="${hc}"/>`,
      trenzas: braid(35) + braid(85) }[av.hair] || "";
    const top = {
      largo: fringe, bob: fringe, coleta: `<circle cx="60" cy="26" r="10" fill="${hc}"/>` + fringe,
      corto: `<path d="M37 50 Q36 28 60 28 Q84 28 83 50 Q80 40 72 38 Q60 34 48 38 Q40 41 37 50Z" fill="${hc}"/>`,
      ondulado: `<path d="M36 52 Q32 32 46 27 Q54 20 64 25 Q74 21 80 30 Q88 38 84 52 Q80 42 72 42 Q66 37 58 41 Q50 37 44 42 Q38 44 36 52Z" fill="${hc}"/>`,
      rapado: `<path d="M38 46 Q40 30 60 30 Q80 30 82 46 Q72 37 60 37 Q48 37 38 46Z" fill="${hc}" opacity=".85"/>`,
      afro: `<path d="M38 50 Q36 32 60 31 Q84 32 82 50 Q74 41 60 41 Q46 41 38 50Z" fill="${hc}"/>`,
      cresta: `<defs><linearGradient id="${id}n" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3D6BFF"/><stop offset="1" stop-color="#A100FF"/></linearGradient></defs><path d="M38 46 Q40 30 60 30 Q80 30 82 46 Q72 37 60 37 Q48 37 38 46Z" fill="${hc}" opacity=".55"/><path d="M53 42 Q50 22 55 12 Q60 20 62 10 Q66 20 69 14 Q71 26 67 42 Q60 38 53 42Z" fill="url(#${id}n)" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`,
      trenzas: `<path d="M37 54 Q36 28 60 28 Q84 28 83 54 Q76 38 61 36 L60 30 L59 36 Q44 38 37 54Z" fill="${hc}"/>`
    }[av.hair] || fringe;
    const beard = av.beard ? `<path d="M40 56 Q42 79 60 81 Q78 79 80 56 Q76 70 68 68 Q60 72 52 68 Q44 70 40 56Z" fill="${hc}"/>` : "";
    const acc = {
      gafas: `<g fill="none" stroke="#F5F1FA" stroke-width="2"><circle cx="51" cy="55" r="6"/><circle cx="69" cy="55" r="6"/><path d="M57 55h6M45 54l-7-2M75 54l7-2"/></g>`,
      audifonos: `<path d="M35 58 Q35 25 60 25 Q85 25 85 58" stroke="#0A0710" stroke-width="4" fill="none"/><rect x="30" y="50" width="9" height="16" rx="4" fill="${oc}" stroke="#0A0710" stroke-width="1.5"/><rect x="81" y="50" width="9" height="16" rx="4" fill="${oc}" stroke="#0A0710" stroke-width="1.5"/>`,
      credencial: `<path d="M47 89 L57 104 M73 89 L63 104" stroke="#3D6BFF" stroke-width="2"/><rect x="51" y="102" width="18" height="13" rx="2.5" fill="#F5F1FA"/><text x="60" y="111.5" font-size="8" text-anchor="middle" font-weight="800" font-family="Arial, sans-serif" fill="#A100FF">K</text>`,
      gorra: `<path d="M36 44 Q35 22 60 22 Q85 22 84 44 Q60 38 36 44Z" fill="#A100FF"/><path d="M60 41 Q82 37 98 44 Q90 49 76 47 Q66 45 60 45Z" fill="#7500C0"/><circle cx="60" cy="22.5" r="2.4" fill="#BE82FF"/><text x="58" y="37" font-size="9" text-anchor="middle" font-weight="800" fill="#fff" font-family="Arial, sans-serif">K</text>`,
      gafassol: `<g stroke="#F5F1FA" stroke-width="1.6"><rect x="42.5" y="49.5" width="15" height="10" rx="4" fill="#0A0710"/><rect x="62.5" y="49.5" width="15" height="10" rx="4" fill="#0A0710"/><path d="M57.5 53.5h5M42.5 52l-5-1.6M77.5 52l5-1.6" fill="none"/></g><path d="M45 52.5l5-1.5M65 52.5l5-1.5" stroke="#9DB4FF" stroke-width="1.6" stroke-linecap="round"/>`,
      visor: `<defs><linearGradient id="${id}v" x1="0" x2="1"><stop stop-color="#3D6BFF" stop-opacity=".85"/><stop offset="1" stop-color="#A100FF" stop-opacity=".85"/></linearGradient></defs><rect x="36" y="47" width="48" height="14" rx="7" fill="url(#${id}v)" stroke="#E0F2FE" stroke-width="1.2"/><path d="M42 51 H66" stroke="rgba(255,255,255,.75)" stroke-width="1.6" stroke-linecap="round"/>`,
      pinspeaker: `<circle cx="77" cy="104" r="8" fill="#F59E0B" stroke="#FDE68A" stroke-width="1.5"/><path d="M77 99l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.5-2.3 3.4-.4z" fill="#FFF7D6"/>`
    }[av.acc] || "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" class="av-svg" aria-hidden="true"><defs><radialGradient id="${id}" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#2E2660"/><stop offset="1" stop-color="#110E22"/></radialGradient><clipPath id="${id}c"><circle cx="60" cy="60" r="60"/></clipPath></defs><g clip-path="url(#${id}c)"><rect width="120" height="120" fill="url(#${id})"/>${back}<path d="M22 122 Q24 90 60 88 Q96 90 98 122Z" fill="${oc}"/><path d="M50 89 L60 100 L70 89" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/><rect x="53" y="70" width="14" height="20" rx="6" fill="${sk}"/><circle cx="38" cy="57" r="4.5" fill="${sk}"/><circle cx="82" cy="57" r="4.5" fill="${sk}"/><circle cx="60" cy="54" r="22" fill="${sk}"/>${top}${beard}<circle cx="52" cy="55" r="2.4" fill="#1B1726"/><circle cx="68" cy="55" r="2.4" fill="#1B1726"/><path d="M53 64 Q60 69 67 64" stroke="${av.beard ? "#F5F1FA" : "#1B1726"}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="47" cy="61" r="3" fill="rgba(255,120,150,.18)"/><circle cx="73" cy="61" r="3" fill="rgba(255,120,150,.18)"/>${acc}</g></svg>`;
  }
  let avStep = 1, avDraft = null;
  function avOpts(key, list, cur, swatch) { return `<div class="av-opts" role="group" aria-label="${key}">${list.map((o, i) => { const val = swatch ? i : o[0], on = String(cur) === String(val);
      return swatch ? `<button type="button" class="av-sw" data-avset="${key}" data-v="${val}" aria-pressed="${on}" aria-label="${o[1] || "Tono " + (i + 1)}" style="--sw:${o[0] || o}"></button>`
        : `<button type="button" class="av-chip" data-avset="${key}" data-v="${val}" aria-pressed="${on}">${o[1]}</button>`; }).join("")}</div>`; }
  function renderAvatarModal() {
    const p = PERSONAS[A.ind];
    if (avStep === 1) {
      $("#avBody").innerHTML = `<div class="mh"><div><span class="chip chip-accent">${svg("spark")}Paso 1 de 2 · Tu avatar</span><h3 id="avTitle" class="font-display font-bold text-2xl" style="margin-top:12px">Crea tu avatar del Summit</h3><p class="text-mute text-[15px]" style="margin-top:4px">Te representará en el panel y ante tus matches. Elige un estilo de partida: es solo la apariencia del avatar, no te preguntamos tu sexo ni tu género.</p></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
        <div class="av-gender">${AV_GENDER.map(([g, l]) => `<button type="button" class="av-g" data-avgender="${g}">${avatarSVG(avDefault(g), 96)}<span class="font-display font-bold text-[17px]">${l}</span></button>`).join("")}</div>
        <div class="flex justify-end"><button type="button" class="btn btn-ghost btn-sm" data-close>Más tarde</button></div>`;
      return;
    }
    const d = avDraft, hairs = AV_HAIR[d.gender].concat(AV_XHAIR.filter(h => ownsItem(h[0])).map(h => [h[0], "★ " + h[1]]));
    const accs = AV_ACC.concat(AV_XACC.filter(x => ownsItem(x[0])).map(x => [x[0], "★ " + x[1]]));
    $("#avBody").innerHTML = `<div class="mh"><div><span class="chip chip-accent">${svg("spark")}Paso 2 de 2 · Personaliza</span><h3 id="avTitle" class="font-display font-bold text-2xl" style="margin-top:12px">Así te verán en el Summit</h3></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <div class="av-editor">
        <div class="av-preview"><div class="av-halo">${avatarSVG(d, 168)}</div><div class="font-display font-bold text-lg" style="margin-top:12px">${p.name}</div><div class="text-mute text-[13px]">${IND[A.ind].role}</div></div>
        <div class="av-form">
          <div><div class="av-lbl">Tono de piel</div>${avOpts("skin", AV_SKIN.map(c => [c]), d.skin, true)}</div>
          <div><div class="av-lbl">Peinado</div>${avOpts("hair", hairs, d.hair)}</div>
          <div><div class="av-lbl">Color de cabello</div>${avOpts("hairColor", AV_HAIRC, d.hairColor, true)}</div>
          <div><div class="av-lbl">Color de outfit</div>${avOpts("outfit", AV_OUT, d.outfit, true)}</div>
          <div><div class="av-lbl">Accesorio</div>${avOpts("acc", accs, d.acc)}</div>
          ${d.gender !== "mujer" ? `<label class="switch-row" for="avBeard"><span><b class="font-semibold">Barba</b></span><input type="checkbox" role="switch" class="switch" id="avBeard" ${d.beard ? "checked" : ""}></label>` : ""}
        </div>
      </div>
      <div class="av-foot"><button type="button" class="btn btn-ghost btn-sm" data-avback>${svg("arrow")}Cambiar estilo</button><button type="button" class="btn btn-primary" data-avsave>${svg("check")}${A.avatar ? "Guardar cambios" : "Guardar avatar · +50 XP"}</button></div>`;
  }
  function openAvatar() { avDraft = A.avatar ? { ...A.avatar } : null; avStep = A.avatar ? 2 : 1; renderAvatarModal(); if ($("#m-avatar").hidden) openModal("avatar"); }
  $("#m-avatar").addEventListener("click", (e) => {
    const g = e.target.closest("[data-avgender]");
    if (g) { const gen = g.dataset.avgender; avDraft = avDraft ? { ...avDraft, gender: gen, hair: AV_HAIR[gen].some(h => h[0] === avDraft.hair) || ownsItem(avDraft.hair) ? avDraft.hair : AV_HAIR[gen][0][0], beard: gen === "mujer" ? false : avDraft.beard } : avDefault(gen); avStep = 2; renderAvatarModal(); const f = $("#avBody .av-form button"); if (f) f.focus(); return; }
    const o = e.target.closest("[data-avset]");
    if (o) { const k = o.dataset.avset; avDraft[k] = ["skin", "hairColor", "outfit"].includes(k) ? +o.dataset.v : o.dataset.v; renderAvatarModal(); const again = $(`#avBody [data-avset="${k}"][data-v="${o.dataset.v}"]`); if (again) again.focus(); return; }
    if (e.target.closest("[data-avback]")) { avStep = 1; renderAvatarModal(); return; }
    if (e.target.closest("[data-avsave]")) {
      const firstTime = !A.avatar, draft = { ...avDraft };
      closeModal($("#m-avatar"));
      if (firstTime) award(() => { A.avatar = draft; }, 50, "Avatar creado", "users"); else { A.avatar = draft; save(); toast("<b>Avatar actualizado</b>", "users"); refresh(); }
    }
  });
  $("#m-avatar").addEventListener("change", (e) => { if (e.target.id === "avBeard") { avDraft.beard = e.target.checked; renderAvatarModal(); const b = $("#avBeard"); if (b) b.focus(); } });
  document.addEventListener("click", (e) => { if (!inApp) return; if (e.target.closest("[data-avedit]") && !e.target.closest(".modal")) { openAvatar(); return; } if (e.target.closest("[data-goprofile]")) { showTab("perfil"); return; } if (e.target.closest("[data-openconn]")) showTab("red"); });

  /* ---- Mis conexiones: lista y opción de remover ---- */
  let connAsk = null;
  function connInfo(n) {
    const m = IND[A.ind].matches.find(x => x[1] === n), q = (A.qrConn || []).find(x => x.name === n), pool = SUMMIT_POOL.find(x => x[0] === n);
    const initials = m ? m[0] : n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return { initials, role: m ? m[2] : q ? q.role : pool ? pool[1] : "Asistente del Summit", aff: m ? m[3] : null, match: !!m,
      via: q ? `QR · ${q.lugar}` : m ? "AI Concierge" : "Summit" };
  }
  function renderConns() {
    const list = A.connections.slice().reverse();
    $("#connsBody").innerHTML = `<div class="mh"><div><span class="chip chip-cyan">${svg("users")}Tu red en el Summit</span><h3 id="connsTitle" class="font-display font-bold text-xl" style="margin-top:10px">Mis conexiones <span class="text-mute tabular">(${list.length})</span></h3></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      ${list.length ? `<div class="conn-list">${list.map(n => { const c = connInfo(n), ask = connAsk === n;
        return `<div class="conn-row ${ask ? "ask" : ""}">
          <span class="conn-av" style="--h:${hashStr(n) % 360}">${esc(c.initials)}</span>
          <div class="min-w-0"><div class="conn-name">${esc(n)}${c.aff ? ` <span class="gf-aff">${c.aff}%</span>` : ""}</div><div class="text-[12.5px] text-mute">${esc(c.role)}</div><div class="conn-via">${svg(c.via.startsWith("QR") ? "qr" : "link")}${esc(c.via)}</div></div>
          <div class="conn-actions">${ask ? `<span class="conn-q">¿Remover a ${esc(first(n))}?</span><button type="button" class="btn btn-ghost btn-sm" data-cno>Cancelar</button><button type="button" class="btn btn-sm conn-del" data-cyes="${esc(n)}">Sí, remover</button>`
            : `<button type="button" class="btn btn-ghost btn-sm" data-cmsg="${esc(n)}">${svg("msg")}Mensaje</button>${c.match ? `<button type="button" class="btn btn-ghost btn-sm" data-cprof="${esc(n)}">Ver perfil</button>` : ""}<button type="button" class="btn btn-ghost btn-sm conn-rm" data-crm="${esc(n)}" aria-label="Remover a ${esc(n)}">${svg("x")}Remover</button>`}</div>
        </div>`; }).join("")}</div>
        <p class="text-[12.5px] text-mute">Al remover una conexión, deja de aparecer en tu red y se cierra el chat. Tus XP no cambian y podrás volver a conectar cuando quieras.</p>`
      : `<div class="conn-empty">${svg("users")}<div><b>Aún no tienes conexiones</b><p class="text-mute text-[14px]">Envía solicitudes a tus matches sugeridos o conecta escaneando un QR.</p></div></div><div class="flex justify-end"><button type="button" class="btn btn-primary btn-sm" data-cgo>${svg("users")}Ver matches sugeridos</button></div>`}`;
  }
  /* Tarjetas compactas en grid fluido: las acciones nunca desbordan el ancho */
  function connsInlineHTML() {
    const list = A.connections.slice().reverse();
    return `<article class="pcard" id="connsCard">
      <header class="pcard-h"><div><span class="pcard-k">Tu red en el Summit</span><h2 class="pcard-t">Mis conexiones <span class="text-mute tabular">(${list.length})</span></h2></div></header>
      ${list.length ? `<ul class="cc-grid">${list.map(n => { const c = connInfo(n), ask = connAsk === n;
        return `<li class="cc ${ask ? "ask" : ""}">
          <div class="cc-top">
            <span class="conn-av cc-av" style="--h:${hashStr(n) % 360}">${esc(c.initials)}</span>
            <div class="min-w-0"><div class="cc-name"><span>${esc(n)}</span>${c.aff ? `<span class="gf-aff">${c.aff}%</span>` : ""}</div><div class="cc-role">${esc(c.role)}</div></div>
            ${ask ? "" : `<button type="button" class="cc-x" data-crm="${esc(n)}" aria-label="Remover a ${esc(n)}" title="Remover conexión">${svg("x")}</button>`}
          </div>
          <div class="cc-via">${svg(c.via.startsWith("QR") ? "qr" : "link")}<span>${esc(c.via)}</span></div>
          ${ask ? `<div class="cc-ask"><span class="conn-q">¿Remover a ${esc(first(n))}?</span><div class="cc-acts"><button type="button" class="btn btn-ghost btn-sm" data-cno>Cancelar</button><button type="button" class="btn btn-sm conn-del" data-cyes="${esc(n)}">Sí, remover</button></div></div>`
            : `<div class="cc-acts ${c.match ? "" : "one"}"><button type="button" class="btn btn-ghost btn-sm" data-cmsg="${esc(n)}">${svg("msg")}<span>Mensaje</span></button>${c.match ? `<button type="button" class="btn btn-ghost btn-sm" data-cprof="${esc(n)}">${svg("users")}<span>Ver perfil</span></button>` : ""}</div>`}
        </li>`; }).join("")}</ul>
        <p class="text-[12.5px] text-mute">Al remover una conexión, deja de aparecer en tu red y se cierra el chat. Tus XP no cambian y podrás volver a conectar cuando quieras.</p>`
      : `<div class="conn-empty">${svg("users")}<div><b>Aún no tienes conexiones</b><p class="text-mute text-[14px]">Envía solicitudes a tus matches sugeridos o conecta escaneando un QR.</p></div></div><div class="flex justify-end"><button type="button" class="btn btn-primary btn-sm" data-cgo>${svg("users")}Ver matches sugeridos</button></div>`}
    </article>`;
  }
  panel.addEventListener("click", (e) => {
    if (!$("#connsCard")) return; const t = e.target;
    const rm = t.closest("#connsCard [data-crm]"); if (rm) { connAsk = rm.dataset.crm; renderTab(false); const y = $("#connsCard [data-cyes]"); if (y) y.focus(); return; }
    if (t.closest("#connsCard [data-cno]")) { connAsk = null; renderTab(false); return; }
    const yes = t.closest("#connsCard [data-cyes]"); if (yes) { const n = yes.dataset.cyes; connAsk = null;
      A.connections = A.connections.filter(x => x !== n); if (A.requests) delete A.requests[n]; if (A.coffees) delete A.coffees[n];
      A.qrConn = (A.qrConn || []).filter(x => x.name !== n); save(); apiConnRemoved(n); refresh();
      toast(`<b>Conexión removida</b><div class="text-[13px] text-mute">${esc(n)} ya no está en tu red.</div>`, "users"); return; }
    const mg = t.closest("#connsCard [data-cmsg]"); if (mg) { openChat(mg.dataset.cmsg); return; }
    const pf = t.closest("#connsCard [data-cprof]"); if (pf) { openPerson(pf.dataset.cprof); return; }
    if (t.closest("#connsCard [data-cgo]")) showTab("red", "matchesCard");
  });
  function openConns() { connAsk = null; renderConns(); if ($("#m-conns").hidden) openModal("conns"); }
  $("#m-conns").addEventListener("click", (e) => {
    const t = e.target;
    const rm = t.closest("[data-crm]"); if (rm) { connAsk = rm.dataset.crm; renderConns(); const y = $("#connsBody [data-cyes]"); if (y) y.focus(); return; }
    if (t.closest("[data-cno]")) { connAsk = null; renderConns(); return; }
    const yes = t.closest("[data-cyes]"); if (yes) { const n = yes.dataset.cyes; connAsk = null;
      A.connections = A.connections.filter(x => x !== n); if (A.requests) delete A.requests[n]; if (A.coffees) delete A.coffees[n];
      A.qrConn = (A.qrConn || []).filter(x => x.name !== n); save(); apiConnRemoved(n); refresh(); renderConns();
      toast(`<b>Conexión removida</b><div class="text-[13px] text-mute">${esc(n)} ya no está en tu red.</div>`, "users"); return; }
    const mg = t.closest("[data-cmsg]"); if (mg) { closeModal($("#m-conns")); openChat(mg.dataset.cmsg); return; }
    const pf = t.closest("[data-cprof]"); if (pf) { closeModal($("#m-conns")); openPerson(pf.dataset.cprof); return; }
    if (t.closest("[data-cgo]")) { closeModal($("#m-conns")); showTab("red", "matchesCard"); }
  });

  /* =================== 05 · MIS EVENTOS: inscripciones y actividades presenciales =================== */
  let mePick = false;
  const mePickerHTML = (cur) => expGridHTML(cur);
  /* Tarjetitas de "Todo lo que tienes agendado": al tocarlas muestran su detalle */
  let meStat = null;
  function meStatsHTML(evs, exp, cafes) {
    const made = myEvs().filter(e => !isEnded("my:" + e.id)), hist = (A.history || []).slice().sort((a, b) => b.at - a.at);
    const ex = exp && EXPS.find(e => e.id === A.exp.id), caf = Object.entries(A.coffees || {}).filter(([, c]) => c.status === "accepted");
    const tiles = [["evs", evs.length, "eventos activos", "calendar"], ["made", made.length, "eventos que creaste", "spark"], ["act", (ex ? 1 : 0) + cafes, "actividades presenciales", "users"], ["hist", hist.length, "en tu historial", "clock"]];
    const row = (ic, t, sub, extra = "") => `<li class="ms-row"><span class="ms-ic">${svg(ic)}</span><div class="min-w-0"><b>${t}</b><span>${sub}</span></div>${extra}</li>`;
    const D = {
      evs: ["Eventos activos", "Los eventos en los que estás inscrito y que aún no terminan. Elige uno en el selector de abajo para ver tu programa de cada día.", "selEvCard",
        evs.map(e => row("calendar", esc(e.name), `${esc(e.city)} · ${e.date}`, act("evinfo", e.id, "Ver detalles", "btn btn-ghost btn-sm"))),
        `Aún no te has inscrito en ningún evento. ${act("goto", "eventos", `Ver próximos eventos ${svg("arrow")}`, "pill-btn")}`],
      made: ["Eventos que creaste", "Los meetups, talleres o charlas que propusiste al equipo del Summit. Cuando los aprueban, puedes invitar a tu red.", "myEventsCard",
        made.map(e => row("spark", esc(e.name), `${e.type} · ${new Date(e.date + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })} · ${e.status === "approved" ? "Aprobado" : "En revisión"}`)),
        "Todavía no has propuesto ningún evento. Puedes crear uno en la sección «Eventos que creaste»."],
      act: ["Actividades presenciales", "Las experiencias de arte, cocina o deporte en las que te inscribiste y los cafés de networking que te aceptaron.", "actCard",
        (ex ? [row(ex.ic, `${ex.name}`, `Día ${ex.day + 1} · ${ex.time} · ${ex.where}`)] : []).concat(caf.map(([n, c]) => row("coffee", `Café con ${esc(n)}`, esc(c.slot)))),
        "No tienes actividades presenciales. Elige una experiencia de arte, cocina o deporte en el AI &amp; Business Summit."],
      hist: ["Tu historial", "Los eventos, sesiones y actividades que ya terminaron. En cada uno puedes ver el resumen con IA y responder la encuesta.", "historyCard",
        hist.slice(0, 5).map(h => row("clock", esc(h.s.title), `${esc(h.s.kind || "Evento")} · ${new Date(h.at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}`)),
        "Aún no tienes eventos terminados. Cuando termine uno, aparecerá aquí con su resumen."]
    };
    const cur = meStat && D[meStat];
    return `<div class="gf-stats ms-tiles" role="group" aria-label="Resumen de lo que tienes agendado">${tiles.map(([k, n, l, ic]) => `<button type="button" class="ms-tile ${meStat === k ? "on" : ""}" data-mestat="${k}" aria-expanded="${meStat === k}" aria-controls="meStatPanel"><b class="tabular">${n}</b><span>${l}</span><i class="ms-chev">${svg("arrow")}</i></button>`).join("")}</div>
      ${cur ? `<div class="ms-panel" id="meStatPanel" role="region" aria-label="${cur[0]}">
        <div class="ms-panel-h"><div><b>${cur[0]}</b><p>${cur[1]}</p></div><button type="button" class="ms-x" data-mestat="${meStat}" aria-label="Cerrar detalle">${svg("x")}</button></div>
        ${cur[3].length ? `<ul class="ms-list">${cur[3].join("")}</ul>${meStat === "hist" && hist.length > 5 ? `<p class="text-[12.5px] text-mute">Y ${hist.length - 5} más en tu historial.</p>` : ""}` : `<p class="ms-empty">${cur[4]}</p>`}
        <div class="flex justify-end"><button type="button" class="pill-btn" data-mejump="${cur[2]}">Ir a la sección ${svg("arrow")}</button></div>
      </div>` : ""}`;
  }
  panel.addEventListener("click", (e) => {
    const t = e.target.closest("[data-mestat]"); if (t) { meStat = meStat === t.dataset.mestat ? null : t.dataset.mestat; renderTab(false); const f = $(`[data-mestat="${t.dataset.mestat}"].ms-tile`); if (f) f.focus(); return; }
    const j = e.target.closest("[data-mejump]"); if (j) { const el = document.getElementById(j.dataset.mejump); if (el) { scrollToEl(el); flash(el); } }
  });
  function tabMisEventos() {
    const evs = EVENTS.filter(e => A.events.includes(e.id) && !isEnded("ev:" + e.id));
    const exp = A.exp && !isEnded("exp:" + A.exp.id);
    const cafes = Object.values(A.coffees || {}).filter(c => c.status === "accepted").length;
    return `<div class="stack">
      <article class="pcard me-hero">
        <header class="pcard-h"><div><span class="pcard-k">Experiencia 03 · Mis eventos</span><h2 class="pcard-t">Todo lo que tienes agendado</h2><div class="text-mute text-[14px]">Elige un evento y un día para ver tu programa, tus actividades y tus resúmenes.</div></div></header>
        ${meStatsHTML(evs, exp, cafes)}
      </article>
      ${evDayBar("main")}
      ${selEventHTML()}
      ${activitiesHTML()}
      ${myEventsHTML()}
      ${historyHTML()}
    </div>`;
  }
  /* ---- Encuesta de satisfacción al terminar un evento ---- */
  const SV_XP = 30;
  
  
  
  let svCur = null;
  const svStars = (name, val, big) => `<div class="sv-stars ${big ? "big" : ""}" role="radiogroup" aria-label="${name}">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="sv-star ${val >= n ? "on" : ""}" role="radio" aria-checked="${val === n}" aria-label="${n} de 5" data-svstar="${name}" data-v="${n}">★</button>`).join("")}</div>`;
  function renderSurvey(hid, done) {
    const h = (A.history || []).find(x => x.id === hid); if (!h) return; const d = svCur;
    if (done) { $("#svBody").innerHTML = `<div class="ne-sent"><span class="ne-sent-ic" style="background:linear-gradient(135deg,#FDE68A,#F59E0B)">${svg("star")}</span><h3 id="svTitle" class="font-display font-bold text-xl">¡Gracias por tu opinión!</h3><p class="text-[15px]" style="color:var(--t-soft)">Tu calificación de <b>${esc(h.s.title)}</b> ayuda a mejorar los próximos eventos.</p><p class="text-[14px]" style="color:var(--t-emerald)">+${SV_XP} XP sumados a tu marcador</p><button type="button" class="btn btn-primary" data-close>Listo</button></div>`; return; }
    $("#svBody").innerHTML = `<div class="mh"><div><span class="chip chip-cyan">${svg("star")}Encuesta de satisfacción</span><h3 id="svTitle" class="font-display font-bold text-xl" style="margin-top:10px">¿Qué tal estuvo?</h3><p class="text-mute text-[14px]" style="margin-top:4px">${esc(h.s.title)} · ${esc(h.s.kind)}</p></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <section class="sv-q"><h4>1. Calificación general <span class="sv-req">obligatoria</span></h4>${svStars("rating", d.rating, true)}<div class="sv-face">${d.rating ? SV_FACES[d.rating] : "Toca una estrella"}</div></section>
      <section class="sv-q"><h4>2. Califica cada aspecto</h4><div class="sv-aspects">${SV_ASPECTS.map(([k, l]) => `<div class="sv-asp"><span>${l}</span>${svStars(k, d[k] || 0)}</div>`).join("")}</div></section>
      <section class="sv-q"><h4>3. ¿Qué tan probable es que lo recomiendes a un colega?</h4><div class="sv-nps">${Array.from({ length: 11 }, (_, n) => `<button type="button" class="sv-n ${d.nps === n ? "on" : ""} ${n <= 6 ? "lo" : n <= 8 ? "mid" : "hi"}" data-svnps="${n}" aria-pressed="${d.nps === n}">${n}</button>`).join("")}</div><div class="sv-nps-l"><span>Nada probable</span><span>Muy probable</span></div></section>
      <section class="sv-q"><h4>4. ¿Qué fue lo mejor?</h4><div class="sv-chips">${SV_BEST.map(b => `<button type="button" class="sv-chip ${d.best.includes(b) ? "on" : ""}" data-svbest="${esc(b)}" aria-pressed="${d.best.includes(b)}">${d.best.includes(b) ? svg("check") : ""}${b}</button>`).join("")}</div></section>
      <section class="sv-q"><h4>5. ¿Qué mejorarías? <span class="text-mute text-[12px] font-normal">(opcional)</span></h4><textarea class="input" id="svComment" rows="3" maxlength="400" placeholder="Cuéntanos qué podríamos hacer mejor">${esc(d.comment || "")}</textarea></section>
      <p class="gf-err" id="svErr" hidden></p>
      <p class="text-[12px] text-mute">Tus respuestas se usan solo para mejorar los próximos eventos.</p>
      <div class="gf-form-foot"><button type="button" class="btn btn-ghost btn-sm" data-close>Ahora no</button><button type="button" class="btn btn-primary" data-svsend>${svg("arrow")}Enviar encuesta · +${SV_XP} XP</button></div>`;
  }
  function openSurvey(hid) { svCur = { hid, rating: 0, nps: null, best: [], comment: "" }; renderSurvey(hid); if ($("#m-survey").hidden) openModal("survey"); }
  $("#m-survey").addEventListener("input", (e) => { if (e.target.id === "svComment" && svCur) svCur.comment = e.target.value; });
  $("#m-survey").addEventListener("click", (e) => {
    if (!svCur) return; const t = e.target;
    const st = t.closest("[data-svstar]"); if (st) { svCur[st.dataset.svstar] = +st.dataset.v; renderSurvey(svCur.hid); const again = $(`#svBody [data-svstar="${st.dataset.svstar}"][data-v="${st.dataset.v}"]`); if (again) again.focus(); return; }
    const np = t.closest("[data-svnps]"); if (np) { svCur.nps = +np.dataset.svnps; renderSurvey(svCur.hid); return; }
    const bs = t.closest("[data-svbest]"); if (bs) { const v = bs.dataset.svbest; svCur.best = svCur.best.includes(v) ? svCur.best.filter(x => x !== v) : svCur.best.concat(v); renderSurvey(svCur.hid); return; }
    if (t.closest("[data-svsend]")) {
      if (!svCur.rating) { const er = $("#svErr"); er.hidden = false; er.textContent = "Elige una calificación general de 1 a 5 estrellas."; return; }
      const hid = svCur.hid, data = { ...svCur, at: Date.now() }; delete data.hid;
      award(() => { (A.surveys ||= {})[hid] = data; }, SV_XP, "Encuesta de satisfacción enviada", "star");
      renderSurvey(hid, true); svCur = null;
    }
  });
  panel.addEventListener("click", (e) => { const b = e.target.closest("[data-svopen]"); if (b) openSurvey(b.dataset.svopen); });

  /* Historial modular: filtrable por evento, con fecha de cierre y acceso directo al resumen IA */
  let histF = "all";
  
  function histEv(h) { const [k, id] = h.key.split(":"); return h.s.evId || (k === "ev" || k === "ses" ? id : k === "exp" ? "bog" : null); }
  function historyHTML() {
    A.history = A.history || [];
    Object.entries(A.ended || {}).forEach(([key, at]) => { if (!A.history.some(h => h.key === key && h.at === at)) A.history.push({ id: key + "@" + at, key, at, s: sumData(key) }); });
    const all = A.history.slice().sort((a, b) => b.at - a.at);
    const groups = [...new Set(all.map(h => histEv(h) || "my"))];
    if (histF !== "all" && !groups.includes(histF)) histF = "all";
    const list = histF === "all" ? all : all.filter(h => (histEv(h) || "my") === histF);
    const fLabel = (g) => g === "my" ? "Mis meetups" : evById(g) ? evById(g).city + " · " + evById(g).name.split(":")[0] : g;
    return `<article class="pcard" id="historyCard">
      <header class="pcard-h"><div><span class="pcard-k">Eventos que ya terminaron</span><h2 class="pcard-t">Historial de eventos</h2></div><span class="chip tabular">${svg("clock")}${all.length}</span></header>
      ${all.length > 0 && groups.length > 1 ? `<div class="hx-filter" role="group" aria-label="Filtrar historial por evento"><button type="button" class="hx-f ${histF === "all" ? "on" : ""}" data-hxf="all" aria-pressed="${histF === "all"}">Todos <span class="tabular">${all.length}</span></button>${groups.map(g => `<button type="button" class="hx-f ${histF === g ? "on" : ""}" data-hxf="${g}" aria-pressed="${histF === g}">${esc(fLabel(g))} <span class="tabular">${all.filter(h => (histEv(h) || "my") === g).length}</span></button>`).join("")}</div>` : ""}
      ${list.length ? `<ul class="hx-list">${list.map(h => { const d = new Date(h.at), k = h.key.split(":")[0], [ic, type] = HX_TYPE[k] || ["calendar", "Evento"], ev = evById(histEv(h));
        const ctx = k === "ses" || k === "exp" ? `${ev ? ev.name : ""}${h.s.day != null ? ` · Día ${h.s.day + 1}` : ""}` : h.s.meta;
        const sv = A.surveys && A.surveys[h.id];
        return `<li class="hx">
          <div class="hx-date" aria-hidden="true"><b>${d.getDate()}</b><span>${d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span><i>${d.getFullYear()}</i></div>
          <div class="hx-body">
            <div class="hx-tags"><span class="chip">${svg(ic)}${type}</span>${ev ? `<span class="chip chip-cyan">${svg("pin")}${esc(ev.city)}</span>` : ""}</div>
            <h3 class="hx-title">${esc(h.s.title)}</h3>
            <div class="hx-ctx">${esc(ctx)}</div>
            <div class="hx-when">${svg("check")}Concluyó el ${d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })}</div>
          </div>
          <div class="hx-acts">
            <button type="button" class="btn btn-primary btn-sm" data-sumopen="${h.id}">${svg("spark")}Ver resumen IA</button>
            <button type="button" class="btn btn-ghost btn-sm" data-sumdl="${h.id}" aria-label="Descargar resumen en PDF">${svg("file")}PDF</button>
            ${sv ? `<span class="chip sv-done">${svg("star")}${sv.rating}/5</span>` : `<button type="button" class="btn btn-emerald btn-sm" data-svopen="${h.id}">${svg("star")}Encuesta · +${SV_XP} XP</button>`}
          </div>
        </li>`; }).join("")}</ul>`
        : `<div class="me-empty">${svg("clock")}<span>Cuando un evento, una sesión o un meetup termine, aparecerá aquí con la fecha de cierre y su resumen generado con IA.</span></div>`}
    </article>`;
  }
  panel.addEventListener("click", (e) => { const f = e.target.closest("[data-hxf]"); if (!f) return; histF = f.dataset.hxf; renderTab(false); const b = $(`[data-hxf="${histF}"]`); if (b) b.focus(); });

  /* =================== Crear un evento propio: solicitud → aprobación → invitar a mi red =================== */
  
  
  const NE_APPROVE_MS = 20000, NE_XP = 100;
  const myEvs = () => (A.myEvents ||= []);
  const fmtDate = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return iso; } };
  function myEventsHTML() {
    const list = myEvs().filter(e => !isEnded("my:" + e.id)).slice().reverse();
    return `<article class="pcard ne-panel" id="myEventsCard">
      <header class="pcard-h"><div><span class="pcard-k">Organiza tu propio evento</span><h2 class="pcard-t">Eventos que creaste</h2></div>${list.length ? `<span class="chip tabular">${svg("calendar")}${list.length}</span>` : ""}</header>
      <div class="ne-cta">
        <span class="ne-cta-ic">${svg("spark")}</span>
        <div class="min-w-0"><b>¿Tienes una idea para un meetup, taller o charla?</b><span>Propónla al equipo del Summit. Cuando la aprueben, podrás invitar a tu red.</span></div>
        <button type="button" class="btn btn-primary btn-sm" data-ne="new">${svg("spark")}Crear un evento</button>
      </div>
      ${list.length ? `<div class="ne-list">${list.map(ev => { const ok = ev.status === "approved", inv = Object.keys(ev.invites || {}), yes = inv.filter(n => ev.invites[n] === "accepted");
        return `<div class="ne-item ${ok ? "ok" : "pend"}">
          <div class="ne-date"><b>${new Date(ev.date + "T12:00:00").getDate()}</b><span>${new Date(ev.date + "T12:00:00").toLocaleDateString("es-CO", { month: "short" })}</span></div>
          <div class="min-w-0">
            <div class="flex flex-wrap gap-2 items-center">${ok ? `<span class="chip chip-emerald">${svg("check")}Aprobado</span>` : `<span class="chip ne-wait"><span class="ne-spin"></span>En revisión</span>`}<span class="chip">${ev.type}</span></div>
            <div class="font-display font-bold text-[17px] leading-snug" style="margin-top:6px">${esc(ev.name)}</div>
            <div class="me-meta" style="margin-top:4px"><span>${svg("calendar")}${fmtDate(ev.date)} · ${esc(ev.time)}</span><span>${svg("pin")}${esc(ev.city)}${ev.place ? " · " + esc(ev.place) : ""}</span><span>${svg("users")}Cupo ${ev.cap}</span></div>
            ${ok ? `<div class="ne-inv">${inv.length ? `<span class="tabular"><b>${yes.length}</b> confirmados · ${inv.length} invitados</span><span class="ne-avs">${inv.slice(0, 6).map(n => `<span class="ne-av ${ev.invites[n] === "accepted" ? "yes" : ""}" title="${esc(n)} · ${ev.invites[n] === "accepted" ? "confirmó" : "invitación enviada"}" style="--h:${hashStr(n) % 360}">${esc(n.split(" ").map(w => w[0]).join("").slice(0, 2))}</span>`).join("")}</span>` : `<span class="text-mute">Aún no has invitado a nadie.</span>`}</div>`
              : `<p class="ne-note">${svg("clock")}Te notificaremos cuando sea aprobada. Mientras tanto no se pueden enviar invitaciones.</p>`}
            <div class="me-actions" style="margin-top:8px">${ok ? `${isEnded("my:" + ev.id) ? "" : `<button type="button" class="btn btn-primary btn-sm" data-ne="invite" data-v="${ev.id}">${svg("users")}Invitar a mi red</button>`}${sumCtl("my:" + ev.id)}` : `<button type="button" class="btn btn-ghost btn-sm" disabled title="Disponible cuando se apruebe">${svg("lock")}Invitar a mi red</button><button type="button" class="btn btn-ghost btn-sm" data-ne="cancel" data-v="${ev.id}">Cancelar solicitud</button>`}</div>
          </div>
        </div>`; }).join("")}</div>`
        : ""}
    </article>`;
  }
  let neAskCancel = null;
  function renderNewEv(sent) {
    const today = new Date(); today.setDate(today.getDate() + 7); const min = new Date().toISOString().slice(0, 10), def = today.toISOString().slice(0, 10);
    $("#neBody").innerHTML = sent ? `
      <div class="ne-sent"><span class="ne-sent-ic">${svg("check")}</span><h3 id="neTitle" class="font-display font-bold text-xl">¡Solicitud enviada!</h3>
        <p class="text-[15px]" style="color:var(--t-soft)">Recibimos tu propuesta de <b>${esc(sent.name)}</b>. El equipo del Summit la revisará y <b>te notificaremos cuando sea aprobada</b>.</p>
        <p class="text-[13px] text-mute">Cuando se apruebe, podrás invitar a personas de tu red desde Mis eventos.</p>
        <button type="button" class="btn btn-primary" data-close>Entendido</button></div>`
      : `<div class="mh"><div><span class="chip chip-accent">${svg("spark")}Nuevo evento</span><h3 id="neTitle" class="font-display font-bold text-xl" style="margin-top:10px">Crea tu evento</h3><p class="text-mute text-[14px]" style="margin-top:4px">Completa los datos y envía la solicitud para que la aprueben.</p></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <form id="neForm" class="ne-form" novalidate>
        <label class="gf-f gf-wide"><span>Nombre del evento</span><input class="input" name="name" maxlength="80" placeholder="Ej.: Meetup de agentes de IA en producción" required></label>
        <label class="gf-f"><span>Tipo</span><select class="input" name="type">${NE_TYPES.map(t => `<option>${t}</option>`).join("")}</select></label>
        <label class="gf-f"><span>Cupo</span><input class="input" name="cap" type="number" min="5" max="500" value="30"></label>
        <label class="gf-f"><span>Fecha</span><input class="input" name="date" type="date" min="${min}" value="${def}" required></label>
        <label class="gf-f"><span>Hora</span><input class="input" name="time" type="time" value="18:00" required></label>
        <label class="gf-f"><span>Ciudad</span><select class="input" name="city">${NE_CITIES.map(c => `<option ${c === "Bogotá" ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <label class="gf-f"><span>Lugar <span class="text-mute">(opcional)</span></span><input class="input" name="place" maxlength="60" placeholder="Ej.: Hub de innovación, sala 2"></label>
        <label class="gf-f gf-wide"><span>Descripción</span><textarea class="input" name="desc" rows="3" maxlength="300" placeholder="¿De qué trata y para quién es?"></textarea></label>
        <p class="gf-err gf-wide" id="neErr" hidden></p>
        <div class="gf-wide gf-form-foot"><button type="button" class="btn btn-ghost btn-sm" data-close>Cancelar</button><button type="submit" class="btn btn-primary">${svg("arrow")}Enviar solicitud</button></div>
      </form>`;
  }
  function openNewEv() { renderNewEv(null); if ($("#m-newev").hidden) openModal("newev"); setTimeout(() => { const i = $("#neForm [name=name]"); if (i) i.focus(); }, 60); }
  $("#m-newev").addEventListener("submit", (e) => {
    if (e.target.id !== "neForm") return; e.preventDefault(); const f = e.target, er = $("#neErr");
    const d = { name: f.name.value.trim(), type: f.type.value, cap: Math.max(5, Math.min(500, +f.cap.value || 30)), date: f.date.value, time: f.time.value, city: f.city.value, place: f.place.value.trim(), desc: f.desc.value.trim() };
    const bad = d.name.length < 5 ? "Escribe un nombre de al menos 5 caracteres." : !d.date ? "Elige una fecha." : d.date < new Date().toISOString().slice(0, 10) ? "La fecha no puede estar en el pasado." : !d.time ? "Elige una hora." : d.desc.length < 20 ? "Cuéntanos un poco más en la descripción (mínimo 20 caracteres)." : "";
    if (bad) { er.hidden = false; er.textContent = bad; return; }
    const ev = { id: "ne" + Date.now().toString(36), ...d, status: "pending", at: Date.now(), due: Date.now() + NE_APPROVE_MS, invites: {} };
    myEvs().push(ev); save();
    notify("event", `Solicitud enviada: ${d.name}`, "Te notificaremos cuando sea aprobada");
    renderNewEv(ev); refresh();
  });
  function renderInvite(id) {
    const ev = myEvs().find(x => x.id === id); if (!ev) return;
    const conns = A.connections;
    $("#ivBody").innerHTML = `<div class="mh"><div><span class="chip chip-emerald">${svg("check")}Evento aprobado</span><h3 id="ivTitle" class="font-display font-bold text-xl" style="margin-top:10px">Invita a tu red</h3><p class="text-mute text-[14px]" style="margin-top:4px">${esc(ev.name)} · ${fmtDate(ev.date)} · ${esc(ev.time)}</p></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      ${conns.length ? `<form id="ivForm" data-v="${ev.id}" class="iv-form"><div class="iv-tools"><span class="text-[13px] text-mute">${conns.length} personas en tu red</span><button type="button" class="gf-link" data-ivall>Seleccionar todos</button></div>
        <div class="iv-list">${conns.map(n => { const c = connInfo(n), st = ev.invites[n];
          return `<label class="iv-row ${st ? "done" : ""}"><input type="checkbox" name="who" value="${esc(n)}" ${st ? "checked disabled" : ""}><span class="gf-av" style="--h:${hashStr(n) % 360};width:38px;height:38px;font-size:12px">${esc(c.initials)}</span><span class="min-w-0"><b>${esc(n)}</b><span class="block text-[12px] text-mute">${esc(c.role)}</span></span>${st ? `<span class="chip ${st === "accepted" ? "chip-emerald" : ""}">${st === "accepted" ? "Confirmó" : "Invitado"}</span>` : ""}</label>`; }).join("")}</div>
        <label class="gf-f"><span>Mensaje <span class="text-mute">(opcional)</span></span><textarea class="input" name="msg" rows="2" maxlength="200">Hola, te invito a ${esc(ev.name)} el ${fmtDate(ev.date)}. ¡Me encantaría que vinieras!</textarea></label>
        <p class="gf-err" id="ivErr" hidden></p>
        <div class="gf-form-foot"><button type="button" class="btn btn-ghost btn-sm" data-close>Cerrar</button><button type="submit" class="btn btn-primary">${svg("arrow")}Enviar invitaciones</button></div></form>`
        : `<div class="me-empty">${svg("users")}<span>Aún no tienes conexiones para invitar. Conecta con tus matches sugeridos o por QR.</span><button type="button" class="pill-btn" data-ivgo>Ver matches en Mi red ${svg("arrow")}</button></div>`}`;
  }
  $("#m-newev").addEventListener("input", () => { const er = $("#neErr"); if (er) er.hidden = true; });
  function openInvite(id) { renderInvite(id); if ($("#m-invite").hidden) openModal("invite"); }
  $("#m-invite").addEventListener("click", (e) => {
    if (e.target.closest("[data-ivall]")) { $$("#ivForm input[name=who]:not(:disabled)").forEach(c => c.checked = true); return; }
    if (e.target.closest("[data-ivgo]")) { closeModal($("#m-invite")); showTab("red", "matchesCard"); }
  });
  $("#m-invite").addEventListener("submit", (e) => {
    if (e.target.id !== "ivForm") return; e.preventDefault();
    const ev = myEvs().find(x => x.id === e.target.dataset.v), who = $$("#ivForm input[name=who]:checked:not(:disabled)").map(c => c.value);
    if (!who.length) { const er = $("#ivErr"); er.hidden = false; er.textContent = "Selecciona al menos una persona."; return; }
    const now = Date.now(); ev.dueInv = ev.dueInv || {};
    who.forEach((n, i) => { ev.invites[n] = "invited"; ev.dueInv[n] = now + 4000 + i * 2500; });
    save(); closeModal($("#m-invite"));
    toast(`<b>Invitaciones enviadas</b><div class="text-[13px] text-mute">${who.length} persona${who.length === 1 ? "" : "s"} de tu red · ${esc(ev.name)}</div>`, "users"); refresh();
  });
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ne]"); if (!b) return; const k = b.dataset.ne, id = b.dataset.v;
    if (k === "new") { openNewEv(); return; }
    if (k === "invite") { openInvite(id); return; }
    if (k === "cancel") { if (neAskCancel !== id) { neAskCancel = id; b.textContent = "¿Seguro? Toca de nuevo para cancelar"; b.classList.add("danger"); setTimeout(() => { if (neAskCancel === id) { neAskCancel = null; refresh(); } }, 4000); return; }
      neAskCancel = null; A.myEvents = myEvs().filter(x => x.id !== id); save(); toast("<b>Solicitud cancelada</b>", "calendar"); refresh(); return; }
  });
  /* Aprobación simulada y respuestas de invitados */
  setInterval(() => {
    if (!A.connected || !A.myEvents || !A.myEvents.length) return;
    const now = Date.now(); let ch = false;
    A.myEvents.forEach(ev => {
      if (ev.status === "pending" && ev.due <= now) { ch = true;
        award(() => { ev.status = "approved"; ev.approvedAt = now; notify("event", `¡Tu evento “${ev.name}” fue aprobado!`, "Ya puedes invitar a personas de tu red"); }, NE_XP, `Evento aprobado · ${ev.name}`, "calendar");
        toast(`<b>¡${esc(ev.name)} fue aprobado!</b><div class="text-[13px] text-mute">Ya puedes invitar a tu red desde Mis eventos.</div>`, "check"); }
      Object.entries(ev.dueInv || {}).forEach(([n, t]) => { if (t <= now && ev.invites[n] === "invited") { ev.invites[n] = "accepted"; delete ev.dueInv[n]; ch = true; notify("conn", `${n} confirmó asistencia`, ev.name); } });
    });
    if (ch) { save(); refresh(); if (!$("#m-invite").hidden) { const f = $("#ivForm"); if (f) renderInvite(f.dataset.v); } }
  }, 2000);

  /* =================== Resúmenes con IA al culminar un evento + descarga en PDF =================== */
  
  const ideaOf = (t) => TAG_IDEA[t] || `Aplicar ${t.toLowerCase()} empieza con un caso pequeño y una métrica clara.`;
  
  function endedItems() {
    const out = [], ag = IND[A.ind].agenda;
    EVENTS.filter(e => A.events.includes(e.id)).forEach(e => out.push({ key: "ev:" + e.id, title: e.name }));
    myEvs().filter(e => e.status === "approved").forEach(e => out.push({ key: "my:" + e.id, title: e.name }));
    if (A.exp) out.push({ key: "exp:" + A.exp.id, title: (EXPS.find(x => x.id === A.exp.id) || {}).name });
    return out;
  }
  const isEnded = (key) => !!(A.ended && A.ended[key]);
  function sumData(key) {
    if (key.includes("@")) { const h = (A.history || []).find(x => x.id === key); if (h) return h.s; key = key.split("@")[0]; }
    const [kind, id] = key.split(":"), p = PERSONAS[A.ind], d = IND[A.ind], ins = INSIGHTS[A.ind], acts = ACTIONS[A.ind];
    const ended = A.ended && A.ended[key] ? new Date(A.ended[key]) : new Date();
    const when = ended.toLocaleString("es-CO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const forYou = `Para tu rol de ${d.role} en ${d.label}: ${ins[0]} ${ins[1] || ""}`.trim();
    if (kind === "ev") {
      const ev = EVENTS.find(e => e.id === id), I = EV_INFO[id], sp = EV_SPEAKERS[id] || [], tags = [...new Set(sp.flatMap(s => s.tags).concat(ev.tags))].slice(0, 8);
      return { title: ev.name, kind: "Evento presencial", meta: `${ev.date} · ${ev.city} · ${ev.venue}`, when, tags, evId: ev.id,
        resumen: `Durante ${I.formato[1]}, ${ev.name} reunió en ${ev.city} a ${I.para.charAt(0).toLowerCase() + I.para.slice(1).replace(/\.$/, "")}. ${I.lema} La agenda combinó ${I.agenda.map(a => a[1].toLowerCase()).join(", ")}, y los ponentes coincidieron en que el valor de la IA aparece cuando cada caso tiene dueño, datos confiables y una métrica de impacto.`,
        puntos: I.agenda.map(a => `${a[0]} · ${a[1]}: ${a[2]}.`).concat(sp.map(s => `${s.n} (${s.role}) presentó "${s.talk}".`)),
        ideas: sp.map(s => ({ who: `${s.n} · ${s.role}`, txt: ideaOf(s.tags[0]) })),
        paraTi: forYou, acciones: acts.concat(I.llevas[0] ? [`Aplicar: ${I.llevas[0].charAt(0).toLowerCase() + I.llevas[0].slice(1)}`] : []),
        personas: sp.map(s => `${s.n} · ${s.role}, ${s.org}`).concat(d.matches.slice(0, 2).map(m => `${m[1]} · ${m[2]} (afinidad ${m[3]}%)`)) };
    }
    if (kind === "ses") {
      const sid = key.slice(4), se = sessionById(sid) || sessionById("bog:0:0"), sev = evById(se.ev);
      return { title: se.ttl, kind: `${se.kind} · ${sev.name}`, meta: `${sev.city} · Día ${se.day + 1} (${dayTxt(sev.days[se.day])}) · ${se.tm} · ${se.room}`, when, evId: sev.id, day: se.day,
        tags: [...new Set([se.tag].filter(Boolean).concat(p.interests))].slice(0, 4),
        resumen: `La sesión "${se.ttl}" (${se.kind.toLowerCase()}, ${se.room}) del Día ${se.day + 1} de ${sev.name} se centró en cómo pasar de la idea a resultados medibles. Se discutieron casos reales, errores frecuentes y criterios para decidir qué escalar. ${se.why}.`,
        puntos: [se.insight].concat(ins.slice(0, 2)), ideas: [{ who: "Idea central de la sesión", txt: se.insight }],
        paraTi: forYou, acciones: acts, personas: d.matches.map(m => `${m[1]} · ${m[2]} (afinidad ${m[3]}%)`) };
    }
    if (kind === "my") {
      const ev = myEvs().find(e => e.id === id) || { name: "Evento", type: "Meetup", date: "", time: "", city: "", desc: "", invites: {} };
      const att = Object.keys(ev.invites || {}).filter(n => ev.invites[n] === "accepted");
      return { title: ev.name, kind: `${ev.type} · organizado por ti`, meta: `${ev.date ? fmtDate(ev.date) : ""} · ${ev.time} · ${ev.city}${ev.place ? " · " + ev.place : ""}`, when, tags: p.interests.slice(0, 3),
        resumen: `${ev.name} reunió a ${att.length + 1} persona${att.length ? "s" : ""} de tu red. ${ev.desc} La conversación giró en torno a experiencias prácticas y próximos pasos concretos para cada participante.`,
        puntos: [`Objetivo del encuentro: ${ev.desc}`, ins[0], ins[1] || ins[0]], ideas: [],
        paraTi: forYou, acciones: [`Enviar a los asistentes un resumen y los próximos pasos`, acts[0], `Agendar la siguiente edición de ${ev.name}`],
        personas: att.length ? att.map(n => `${n} · ${connInfo(n).role}`) : ["Invita a tu red a la próxima edición desde Mis eventos."] };
    }
    const e = EXPS.find(x => x.id === id) || EXPS[0];
    return { title: e.name, kind: "Experiencia presencial", meta: `${e.time} · ${e.where}`, when, tags: ["Networking", "Experiencia"], evId: "bog", day: e.day,
      resumen: `${e.desc} Fue un espacio informal para conocer a otros asistentes fuera de las salas, donde surgieron conversaciones sobre ${p.interests.slice(0, 2).join(" y ")}.`,
      puntos: ["Actividad práctica en grupo, con participantes de distintas industrias.", "Conversaciones informales que facilitaron nuevas conexiones."], ideas: [],
      paraTi: `Las experiencias presenciales generan confianza más rápido que una reunión formal: aprovecha para retomar el contacto con quienes conociste.`,
      acciones: ["Escribir a las personas que conociste en la actividad", "Conectar por QR con quien quieras seguir en contacto"], personas: d.matches.slice(0, 2).map(m => `${m[1]} · ${m[2]}`) };
  }
  function endEvent(key, auto) {
    if (isEnded(key)) return; const now = Date.now(); A.ended = A.ended || {}; A.ended[key] = now;
    const s = sumData(key); (A.history ||= []).push({ id: key + "@" + now, key, at: now, s }); save();
    notify("sum", `Terminó “${s.title}”`, "Tu resumen generado con IA está listo para descargar en PDF");
    notify("survey", `¿Qué tal estuvo “${s.title}”?`, `Responde la encuesta de satisfacción · +${SV_XP} XP`);
    toast(`<b>${auto ? "Terminó" : "Evento finalizado"}: ${esc(s.title)}</b><div class="text-[13px] text-mute">La IA preparó tu resumen. Lo encuentras en el historial de Mis eventos.</div>`, "file");
    refresh();
  }
  /* ---- Generador de PDF propio (sin librerías): A4, Helvetica, WinAnsi ---- */
  
  const pdfClean = (t) => String(window.KNET_I18N ? window.KNET_I18N.t(String(t)) : t).replace(/[“”‘’→…—–•✓★ ]/g, c => PDF_MAP[c]).replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
  const pdfEsc = (t) => [...pdfClean(t)].map(c => { const k = c.charCodeAt(0); return c === "(" || c === ")" || c === "\\" ? "\\" + c : k > 126 ? "\\" + k.toString(8).padStart(3, "0") : c; }).join("");
  /* Fuente DejaVu Sans incrustada (subconjunto Latin-1, licencia libre) para que el PDF se vea igual en cualquier visor */
  
  const textW = (t, size, bold) => { const w = PDF_FONTS[bold ? "b" : "r"].w; return [...pdfClean(t)].reduce((a, c) => a + (w[c.charCodeAt(0) - 32] || 600), 0) * size / 1000; };
  function wrap(t, size, maxW, bold) { const words = pdfClean(t).split(/\s+/), lines = []; let cur = "";
    words.forEach(w => { const test = cur ? cur + " " + w : w; if (textW(test, size, bold) > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }); if (cur) lines.push(cur); return lines; }
  function buildPDF(s) {
    const W = 595, H = 842, M = 50, CW = W - M * 2, pages = []; let ops = [], y = 0;
    const hex = (h) => [1, 3, 5].map(i => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ");
    const rect = (x, yy, w, h, col) => ops.push(`${hex(col)} rg ${x} ${(H - yy - h).toFixed(1)} ${w} ${h} re f`);
    const txt = (x, yy, t, size, bold, col) => ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${hex(col || "#22182F")} rg ${x.toFixed(1)} ${(H - yy).toFixed(1)} Td (${pdfEsc(t)}) Tj ET`);
    const newPage = () => { if (ops.length) pages.push(ops); ops = []; y = 60;
      rect(0, 0, W, 6, "#A100FF"); rect(W * .55, 0, W * .45, 6, "#3D6BFF");
      txt(M, 28, "KNET · Resumen con IA", 9, true, "#A100FF"); txt(W - M - textW(s.title.slice(0, 50), 9), 28, s.title.slice(0, 50), 9, false, "#6B7280"); };
    const need = (h) => { if (y + h > H - 60) newPage(); };
    const para = (t, size = 10.5, col = "#22182F", bold = false, indent = 0, lh = 1.45) => wrap(t, size, CW - indent, bold).forEach(l => { need(size * lh); txt(M + indent, y + size, l, size, bold, col); y += size * lh; });
    const heading = (t) => { need(72); y += 14; rect(M, y, 4, 16, "#A100FF"); txt(M + 12, y + 12.5, t, 13, true, "#111827"); y += 26; };
    const bullets = (arr, mark = "-") => arr.forEach(b => { const lines = wrap(b, 10.5, CW - 16); lines.forEach((l, i) => { need(15.5); if (!i) { rect(M + 3, y + 5, 4, 4, "#3D6BFF"); } txt(M + 16, y + 10.5, l, 10.5, false, "#22182F"); y += 15.2; }); y += 3; });
    /* Portada */
    ops = []; y = 0;
    rect(0, 0, W, 190, "#0A0710"); rect(0, 186, W, 4, "#A100FF"); rect(W * .6, 186, W * .4, 4, "#3D6BFF");
    txt(M, 48, "KNET · Knowledge Network & Event Technology", 10, true, "#BE82FF");
    txt(M, 66, "RESUMEN GENERADO CON IA", 9, true, "#9DB4FF");
    let ty = 100; wrap(s.title, 22, CW, true).slice(0, 2).forEach(l => { txt(M, ty, l, 22, true, "#FFFFFF"); ty += 27; });
    txt(M, Math.max(ty + 4, 160), `${s.kind}  ·  ${s.meta}`.slice(0, 110), 10, false, "#C9CEDA");
    y = 216;
    txt(M, y, `Preparado para ${PERSONAS[A.ind].name} · ${IND[A.ind].role} · ${PERSONAS[A.ind].company}`, 10, false, "#4B5563"); y += 15;
    txt(M, y, `${s.whenLabel || "Evento finalizado"}: ${s.when}`, 10, false, "#4B5563"); y += 10;
    if (s.tags.length) { y += 10; let x = M; s.tags.forEach(t => { const w = textW(t, 9) + 16; if (x + w > W - M) { x = M; y += 22; } rect(x, y, w, 17, "#EEF2FF"); txt(x + 8, y + 12, t, 9, false, "#4338CA"); x += w + 6; }); y += 22; }
    heading("Resumen ejecutivo"); para(s.resumen);
    heading("Lo más importante"); bullets(s.puntos);
    if (s.ideas.length) { heading("Ideas destacadas"); s.ideas.forEach(i => { const lines = wrap(i.txt, 10.5, CW - 22); need(18 + lines.length * 15); rect(M, y, 3, 14 + lines.length * 15, "#3D6BFF"); txt(M + 12, y + 10, i.who, 9.5, true, "#0E7490"); y += 16; lines.forEach(l => { txt(M + 12, y + 10, l, 10.5, false, "#22182F"); y += 15; }); y += 8; }); }
    heading("Qué significa para ti"); para(s.paraTi);
    heading("Próximas acciones"); s.acciones.forEach(a => { const lines = wrap(a, 10.5, CW - 22); lines.forEach((l, i) => { need(16); if (!i) ops.push(`0.545 0.361 0.965 RG 1 w ${M + 1} ${(H - y - 12).toFixed(1)} 9 9 re S`); txt(M + 18, y + 10.5, l, 10.5, false, "#22182F"); y += 15.2; }); y += 3; });
    heading("Personas para seguir en contacto"); bullets(s.personas);
    y += 10; need(30); para(SUM_INFO, 8.5, "#6B7280");
    pages.push(ops);
    /* Ensamblar el PDF */
    const objs = [], add = (o) => { objs.push(o); return objs.length; };
    const cat = add(null), pagesId = add(null);
    const ttf = (k) => { const F = PDF_FONTS[k], bin = atob(F.b64), file = add(`<< /Length ${bin.length} /Length1 ${bin.length} >>\nstream\n${bin}\nendstream`);
      const desc = add(`<< /Type /FontDescriptor /FontName /${F.name} /Flags 32 /FontBBox [${F.bbox.join(" ")}] /ItalicAngle 0 /Ascent ${F.asc} /Descent ${F.desc} /CapHeight ${F.cap} /StemV ${k === "b" ? 120 : 80} /FontFile2 ${file} 0 R >>`);
      return add(`<< /Type /Font /Subtype /TrueType /BaseFont /${F.name} /FirstChar 32 /LastChar 255 /Widths [${F.w.join(" ")}] /Encoding /WinAnsiEncoding /FontDescriptor ${desc} 0 R >>`); };
    const f1 = ttf("r"), f2 = ttf("b");
    const kids = pages.map((o, i) => { const foot = `BT /F1 8 Tf 0.42 0.45 0.5 rg ${M} 30 Td (${pdfEsc(`KNET · Prototipo del Reto 03 de Accenture · Página ${i + 1} de ${pages.length}`)}) Tj ET`;
      const stream = o.concat(foot).join("\n"); const c = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`); });
    objs[cat - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    const info = add(`<< /Title (${pdfEsc("Resumen IA - " + s.title)}) /Producer (KNET) /Creator (KNET) >>`);
    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255; return bytes;
  }
  const slug = (t) => pdfClean(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  async function downloadSummary(key) {
    const s = sumData(key), bytes = buildPDF(s), name = `knet-resumen-${slug(s.title)}.pdf`, blob = new Blob([bytes], { type: "application/pdf" });
    const dl = await cUse("downloads");
    if (dl) { try { await dl.save({ filename: name, data: bytes.slice() }); toast(`<b>PDF listo</b><div class="text-[13px] text-mute">${esc(name)}</div>`, "file"); return; } catch (err) { if (err && err.code === "declined") { toast("<b>Descarga cancelada</b>", "info"); return; } } }
    try { const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast(`<b>PDF descargado</b><div class="text-[13px] text-mute">${esc(name)}</div>`, "file"); }
    catch (e) { toast("<b>No se pudo descargar el PDF aquí</b>", "info"); }
  }
  window.__knetPDF = (key) => buildPDF(sumData(key));
  /* PDF del Dossier generado: mismo motor de PDF que los resúmenes de eventos */
  function dossierData() {
    const p = PERSONAS[A.ind], d = IND[A.ind], rs = getSel("res"), sess = resSessions(), ins = insights(sess), scope = resScopeLabel(rs);
    const when = new Date(A.dossierAt || Date.now()).toLocaleString("es-CO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const people = A.connections.map(n => { const m = d.matches.find(x => x[1] === n), q = typeof qrPerson === "function" ? qrPerson(n) : null; return m ? `${n} · ${m[2]}` : q && q.role ? `${n} · ${q.role}` : n; });
    return {
      title: `Dossier de ${p.name}`, kind: "Dossier post-Summit", whenLabel: "Generado", meta: `${d.role} · ${p.company} · ${scope}`, when, tags: p.interests.slice(0, 5),
      resumen: `${p.name} (${d.role}, ${p.company}) cerró ${scope} con ${fmt(A.xp)} XP, en el nivel ${lvl()} · ${lvlName()}. Hizo check-in en ${sess.length} sesión${sess.length === 1 ? "" : "es"}, reunió ${ins.length} insight${ins.length === 1 ? "" : "s"} y sumó ${A.connections.length} ${A.connections.length === 1 ? "conexión" : "conexiones"} a su red. Este Dossier reúne lo que vivió, lo que aprendió, a quién conoció y qué hará en los próximos 30 días.`,
      puntos: ins.length ? ins.map(x => x.text) : ["Aún no hay sesiones con check-in en este alcance. Haz check-in desde tu Agenda IA para sumar insights."],
      ideas: sess.map(x => ({ who: `${evById(x.ev).name} · Día ${x.day + 1} · ${x.tm} · ${x.ttl}`, txt: x.insight })),
      paraTi: `Como ${d.role}, prioriza las ideas que conectan con tus intereses (${p.interests.slice(0, 3).join(", ")}) y conviértelas en tareas concretas del plan de 30 días. Retoma el contacto con tus conexiones esta semana, mientras la conversación está fresca.`,
      acciones: actions().map(a => `${A.actions[a.id] ? "[Hecho] " : ""}${a.text}`),
      personas: people.length ? people : ["Aún no tienes conexiones. Conecta con tus matches sugeridos en Mi red."]
    };
  }
  async function downloadDossier() {
    const s = dossierData(), bytes = buildPDF(s), name = `knet-dossier-${slug(PERSONAS[A.ind].name)}.pdf`, blob = new Blob([bytes], { type: "application/pdf" });
    const dl = await cUse("downloads");
    if (dl) { try { await dl.save({ filename: name, data: bytes.slice() }); toast(`<b>PDF del Dossier listo</b><div class="text-[13px] text-mute">${esc(name)}</div>`, "file"); return; } catch (err) { if (err && err.code === "declined") { toast("<b>Descarga cancelada</b>", "info"); return; } } }
    try { const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast(`<b>PDF del Dossier descargado</b><div class="text-[13px] text-mute">${esc(name)}</div>`, "file"); }
    catch (e) { toast("<b>No se pudo descargar el PDF aquí</b>", "info"); }
  }
  window.__knetDossierPDF = () => buildPDF(dossierData());
  /* ---- Ventana del resumen ---- */
  let sumKey = null;
  function renderSum(key, animate) {
    const s = sumData(key), body = $("#sumBody");
    const head = `<div class="mh"><div><span class="chip chip-accent">${svg("spark")}Resumen generado con IA</span><h3 id="sumTitle" class="font-display font-bold text-xl" style="margin-top:10px">${esc(s.title)}</h3><div class="text-mute text-[13px]" style="margin-top:4px">${esc(s.kind)} · ${esc(s.meta)}</div></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>`;
    if (animate) { body.innerHTML = head + `<ol class="gf-steps">${["Procesando la transcripción del evento", "Identificando temas y momentos clave", "Personalizando para tu perfil", "Redactando el resumen"].map((x, k) => `<li data-sstep="${k}"><span class="gf-step-dot"></span>${x}</li>`).join("")}</ol>`;
      [0, 1, 2, 3].forEach(k => setTimeout(() => { const li = $(`[data-sstep="${k}"]`); if (li) li.classList.add("on"); }, (reduce ? 80 : 380) * (k + 1)));
      setTimeout(() => { if (sumKey === key && !$("#m-sum").hidden) renderSum(key, false); }, reduce ? 400 : 1700); return; }
    body.innerHTML = head + `
      <div class="sum-meta">${svg("clock")}Finalizó: ${esc(s.when)}</div>
      ${s.tags.length ? `<div class="spk-tags">${s.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      <section class="sum-sec"><h4>Resumen ejecutivo</h4><p>${esc(s.resumen)}</p></section>
      <section class="sum-sec"><h4>Lo más importante</h4><ul>${s.puntos.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
      ${s.ideas.length ? `<section class="sum-sec"><h4>Ideas destacadas</h4>${s.ideas.map(i => `<blockquote><b>${esc(i.who)}</b><span>${esc(i.txt)}</span></blockquote>`).join("")}</section>` : ""}
      <section class="sum-sec"><h4>Qué significa para ti</h4><p>${esc(s.paraTi)}</p></section>
      <section class="sum-sec"><h4>Próximas acciones</h4><ul class="sum-check">${s.acciones.map(x => `<li>${svg("check")}<span>${esc(x)}</span></li>`).join("")}</ul></section>
      <section class="sum-sec"><h4>Personas para seguir en contacto</h4><ul>${s.personas.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
      <p class="text-[12px] text-mute">${SUM_INFO}</p>
      <div class="av-foot"><button type="button" class="btn btn-ghost btn-sm" data-close>Cerrar</button><button type="button" class="btn btn-primary" data-sumpdf="${key}">${svg("file")}Descargar PDF</button></div>`;
  }
  function openSum(key) { sumKey = key; A.sumSeen = A.sumSeen || {}; const isNew = !A.sumSeen[key]; A.sumSeen[key] = 1; save(); renderSum(key, isNew); if ($("#m-sum").hidden) openModal("sum"); }
  $("#m-sum").addEventListener("click", (e) => { const b = e.target.closest("[data-sumpdf]"); if (b) downloadSummary(b.dataset.sumpdf); });
  /* Controles de cierre y resumen, reutilizables en cada tarjeta de Mis eventos */
  const sumCtl = (key) => isEnded(key)
    ? `<span class="chip sum-done">${svg("check")}Finalizado</span><button type="button" class="btn btn-primary btn-sm" data-sumopen="${key}">${svg("spark")}Resumen IA</button><button type="button" class="btn btn-ghost btn-sm" data-sumdl="${key}">${svg("file")}PDF</button>`
    : `<button type="button" class="btn btn-ghost btn-sm sum-end" data-sumend="${key}" title="Demo: marca el evento como terminado">${svg("clock")}Simular cierre</button>`;
  panel.addEventListener("click", (e) => {
    const en = e.target.closest("[data-sumend]"); if (en) { endEvent(en.dataset.sumend, false); return; }
    const op = e.target.closest("[data-sumopen]"); if (op) { openSum(op.dataset.sumopen); return; }
    const dl = e.target.closest("[data-sumdl]"); if (dl) { downloadSummary(dl.dataset.sumdl); return; }
  });

  /* =================== MULTIEVENTO: evento → día → sesiones =================== */
  function evById(id) { return EVENTS.find(e => e.id === id); }
  function dayTxt(iso, o) { return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", o || { weekday: "short", day: "numeric", month: "short" }); }
  /* Eventos en los que estoy inscrito (incluye los finalizados), en orden cronológico */
  function myEvIds() { return EVENTS.filter(e => A.events.includes(e.id)).sort((a, b) => a.days[0].localeCompare(b.days[0])).map(e => e.id); }
  /* 4 sesiones recomendadas por la IA para cada evento y día (deterministas por perfil) */
  function sessionsFor(evId, di) {
    const ev = evById(evId), d = IND[A.ind], p = PERSONAS[A.ind]; if (!ev || di < 0 || di >= ev.days.length) return [];
    if (evId === "bog" && di === 0) return d.agenda.map(([tm, kind, ttl, room, why], i) => ({ id: `bog:0:${i}`, ev: evId, day: 0, i, tm, kind, ttl, room, why, tag: p.interests[i % p.interests.length], insight: INSIGHTS[A.ind][i] || INSIGHTS[A.ind][0] }));
    const TIMES = ["08:30", "10:15", "14:00", "16:30"], KINDS = ["Keynote", "Panel", "Taller", "Charla"];
    const ROOMS = ["Auditorio principal", "Sala Orbit", "Lab 3 · Zona de talleres", "Sala Quantum", "Sala Nova", "Terraza del pabellón"];
    const TPL = [t => `${t}: del piloto a producción`, t => `Casos reales de ${t} en Latinoamérica`, t => `Taller práctico: ${t} en 90 minutos`, t => `Panel: lo que nadie cuenta sobre ${t}`, t => `Demo en vivo: ${t} aplicado al negocio`, t => `${t} con métricas de impacto`];
    const mine = ev.tags.filter(t => p.interests.includes(t)), order = mine.concat(ev.tags.filter(t => !mine.includes(t)));
    const r = seeded(hashStr(`${A.ind}|${evId}|${di}`) % 2147483646 + 1), base = Math.floor(r() * TPL.length);
    return [0, 1, 2, 3].map(i => { const tag = order[(di * 2 + i) % order.length], hit = p.interests.includes(tag);
      return { id: `${evId}:${di}:${i}`, ev: evId, day: di, i, tm: TIMES[i], kind: KINDS[(i + di) % 4], ttl: TPL[(base + i) % TPL.length](tag), room: ROOMS[Math.floor(r() * ROOMS.length)],
        why: (hit ? [`Coincide con tu interés en ${tag} y con tu rol de ${d.role}`, `Tu perfil marca ${tag} como prioridad: aquí verás casos aplicables`]
          : [`Tema central de ${ev.name}; la IA lo priorizó para ${d.label}`, `Complementa tus intereses con una mirada práctica a ${tag}`, `Asisten 3 de tus matches; buena sesión para conectar`, `Alta demanda en ${d.label}: llega 10 min antes`])[(i + di) % (hit ? 2 : 4)], tag, insight: ideaOf(tag) }; });
  }
  function sessionById(id) { const [ev, di, i] = String(id).split(":"); return sessionsFor(ev, +di)[+i] || null; }
  /* Selección activa. "main" la comparten Agenda y Mis eventos; "res" es la de Resúmenes (admite "todos") */
  function getSel(scope) {
    A.sel = A.sel || {}; const ids = myEvIds(), all = scope === "res"; let s = A.sel[scope] || {};
    if (!(all && s.ev === "all") && !ids.includes(s.ev)) s = { ev: all ? "all" : (ids.find(id => !isEnded("ev:" + id)) || ids[0] || null), day: all ? -1 : 0 };
    if (s.ev && s.ev !== "all") { const n = evById(s.ev).days.length; if (!(Number.isInteger(s.day) && s.day >= (all ? -1 : 0) && s.day < n)) s.day = all ? -1 : 0; }
    A.sel[scope] = s; return s;
  }
  function resSessions() {
    const s = getSel("res");
    return A.attended.map(sessionById).filter(x => x && (s.ev === "all" || (x.ev === s.ev && (s.day === -1 || x.day === s.day))))
      .sort((a, b) => evById(a.ev).days[0].localeCompare(evById(b.ev).days[0]) || a.day - b.day || a.i - b.i);
  }
  function resScopeLabel(s) { if (s.ev === "all") return "Todos mis eventos"; const ev = evById(s.ev); return `${ev.name}${s.day >= 0 ? ` · Día ${s.day + 1}` : ""}`; }

  /* Selector superior: evento + pestañas por día */
  function evDayBar(scope) {
    const ids = myEvIds(); if (!ids.length) return "";
    const s = getSel(scope), all = scope === "res", ev = s.ev !== "all" ? evById(s.ev) : null;
    const cnt = (id, di) => sessionsFor(id, di).filter(x => A.attended.includes(x.id)).length;
    const dayBtn = (i, label, sub, foot) => { const on = s.day === i;
      return `<button type="button" role="tab" aria-selected="${on}" class="evday ${on ? "on" : ""}" data-evday="${scope}" data-v="${i}"><b>${label}</b><span>${sub}</span>${foot ? `<i class="tabular">${foot}</i>` : ""}</button>`; };
    return `<section class="evbar" aria-label="Selector de evento y día">
      <div class="evbar-top">
        <label class="evbar-sel"><span class="evbar-k">${svg("calendar")}Evento</span>
          <span class="evbar-select"><select class="input" data-evsel="${scope}" aria-label="Elige un evento">${all ? `<option value="all" ${s.ev === "all" ? "selected" : ""}>Todos mis eventos (${ids.length})</option>` : ""}${ids.map(id => { const e = evById(id); return `<option value="${id}" ${s.ev === id ? "selected" : ""}>${esc(e.name)} · ${e.city}${isEnded("ev:" + id) ? " · finalizado" : ""}</option>`; }).join("")}</select></span></label>
        <div class="evbar-meta">${ev
          ? `<span>${svg("pin")}${esc(ev.city)} · ${esc(ev.venue.split(" · ")[0])}</span><span>${svg("calendar")}${ev.date} · ${ev.days.length} día${ev.days.length > 1 ? "s" : ""}</span>${isEnded("ev:" + ev.id) ? `<span class="chip sum-done">${svg("check")}Finalizado</span>` : `<span class="chip chip-cyan">${svg("clock")}${ev.when}</span>`}`
          : `<span>${svg("layers")}Vista consolidada de ${ids.length} evento${ids.length > 1 ? "s" : ""}</span>`}</div>
      </div>
      ${ev ? `<div class="evbar-days" role="tablist" aria-label="Días de ${esc(ev.name)}">${all ? dayBtn(-1, "Todos", `${ev.days.length} día${ev.days.length > 1 ? "s" : ""}`) : ""}${ev.days.map((d, i) => dayBtn(i, `Día ${i + 1}`, dayTxt(d), `${cnt(ev.id, i)}/4 check-in`)).join("")}</div>` : ""}
    </section>`;
  }
  panel.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-evsel]"); if (!sel) return; const scope = sel.dataset.evsel;
    A.sel = A.sel || {}; A.sel[scope] = { ev: sel.value, day: scope === "res" ? -1 : 0 }; save(); renderTab(false);
    const again = $(`[data-evsel="${scope}"]`); if (again) again.focus();
  });
  panel.addEventListener("click", (e) => {
    const d = e.target.closest("[data-evday]"); if (d) { const scope = d.dataset.evday; A.sel = A.sel || {}; A.sel[scope] = { ...getSel(scope), day: +d.dataset.v }; save(); renderTab(false); const b = $(`[data-evday="${scope}"][data-v="${d.dataset.v}"]`); if (b) b.focus(); return; }
    const j = e.target.closest("[data-evjump]"); if (j) { const [ev, day] = j.dataset.evjump.split(":"); A.sel = A.sel || {}; A.sel.main = { ev, day: +day || 0 }; save(); renderTab(false); }
  });

  /* 04 · Agenda personalizada, filtrada por evento y día */
  function agendaHTML() {
    const d = IND[A.ind];
    if (!myEvIds().length) return `<article class="pcard" id="agendaCard"><div class="me-empty">${svg("calendar")}<span>Aún no estás inscrito en ningún evento. Inscríbete y la IA armará tu agenda para cada día.</span>${act("goto", "eventos", `Explorar eventos ${svg("arrow")}`, "pill-btn")}</div></article>`;
    const s = getSel("main"), ev = evById(s.ev), list = sessionsFor(ev.id, s.day), ended = isEnded("ev:" + ev.id), done = list.filter(x => A.attended.includes(x.id)).length;
    return `${evDayBar("main")}
      <article class="pcard" id="agendaCard">
        <header class="pcard-h"><div><span class="pcard-k">Agenda IA · ${esc(ev.city)} · Día ${s.day + 1} de ${ev.days.length}</span><h2 class="pcard-t">${esc(ev.name)}</h2><div class="text-mute text-[14px]">${dayTxt(ev.days[s.day], { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · configurada para ${d.role}</div></div><span class="chip chip-emerald tabular">${svg("check")}${done}/${list.length} check-ins</span></header>
        <p class="text-mute text-[14px]" style="margin-top:-6px">${ended ? "Este evento ya terminó: puedes revisar a qué sesiones asististe y abrir sus resúmenes." : "La IA eligió 4 sesiones de este día según tu rol, tu industria y tus intereses. Cada check-in alimenta el resumen de este evento."}</p>
        <div class="grid gap-3">${list.map(x => { const ok = A.attended.includes(x.id);
          return `<div class="agenda-item ${ok ? "is-done" : ""}"><div class="time tabular">${x.tm}</div><div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2"><span class="chip">${x.kind}</span><span class="text-[12px] text-mute flex items-center gap-1"><span class="ico" style="width:12px;height:12px">${svg("pin")}</span>${esc(x.room)}</span></div>
            <div class="font-semibold mt-1.5 leading-snug">${esc(x.ttl)}</div>
            <div class="text-[13px] text-accentsoft mt-1 flex gap-1.5 items-start"><span class="ico flex-none" style="width:14px;height:14px;margin-top:3px">${svg("spark")}</span><span>${esc(x.why)}</span></div>
            <div class="me-actions" style="margin-top:10px">${ok ? `<span class="chip chip-emerald">${svg("check")}Asististe · +40 XP</span>${sumCtl("ses:" + x.id)}` : ended ? `<span class="chip">${svg("lock")}No hiciste check-in</span>` : act("attend", x.id, `${svg("qr")}Check-in QR · +40 XP`, "btn btn-emerald btn-sm")}</div>
          </div></div>`; }).join("")}</div>
        <div class="pcard-foot">${svg("users")}<span>${d.matches.filter(m => !isConn(m[1])).length ? `${d.matches.filter(m => !isConn(m[1])).length} conexiones estratégicas te esperan en Mi red.` : "Ya conectaste con todos tus matches sugeridos."}</span>${act("goto", "red:matchesCard", `Ver matches ${svg("arrow")}`, "pill-btn")}</div>
      </article>`;
  }

  /* 03 · Mis eventos: tarjeta del evento seleccionado + programa del día */
  function selEventHTML() {
    if (!myEvIds().length) return `<article class="pcard"><div class="me-empty">${svg("calendar")}<span>Aún no te has inscrito en ningún evento.</span>${act("goto", "eventos", `Ver próximos eventos ${svg("arrow")}`, "pill-btn")}</div></article>`;
    const s = getSel("main"), ev = evById(s.ev), a = evAffinity(ev), info = EV_INFO[ev.id], ended = isEnded("ev:" + ev.id), list = sessionsFor(ev.id, s.day);
    return `<article class="pcard" id="selEvCard">
      <header class="pcard-h"><div><span class="pcard-k">Evento seleccionado · Día ${s.day + 1} de ${ev.days.length}</span><h2 class="pcard-t">${esc(ev.name)}</h2></div><span class="chip chip-emerald">${a.score}% afinidad</span></header>
      <div class="me-ev">
        <button type="button" class="me-ev-banner" data-act="evinfo" data-v="${ev.id}" aria-label="Ver detalles de ${esc(ev.name)}">${evBanner(ev)}</button>
        <div class="me-ev-body">
          <div class="me-meta"><span>${svg("pin")}${esc(ev.venue)}</span><span>${svg("calendar")}${ev.date}</span>${info ? `<span>${svg("layers")}${info.formato.join(" · ")}</span>` : ""}</div>
          <p class="text-[13.5px]" style="color:var(--t-soft)">${ev.desc}</p>
          <div class="me-actions">${act("vnopen", ev.id, `${svg("map")}Ver recinto`, "btn btn-ghost btn-sm")}${act("evinfo", ev.id, `${svg("file")}Ver detalles`, "btn btn-ghost btn-sm")}${ended ? "" : act("evsave", ev.id, `${svg("x")}Cancelar inscripción`, "btn btn-ghost btn-sm")}${sumCtl("ev:" + ev.id)}</div>
        </div>
      </div>
      <div class="sev-day">
        <div class="sev-day-h"><b>Tu programa del Día ${s.day + 1} · ${dayTxt(ev.days[s.day], { weekday: "long", day: "numeric", month: "long" })}</b>${act("goto", "agenda", `Abrir agenda ${svg("arrow")}`, "pill-btn")}</div>
        <ol class="sev-list">${list.map(x => { const ok = A.attended.includes(x.id);
          return `<li class="${ok ? "ok" : ""}"><span class="sev-tm mono tabular">${x.tm}</span><span class="min-w-0"><b>${esc(x.ttl)}</b><small>${x.kind} · ${esc(x.room)}</small></span><span class="chip ${ok ? "chip-emerald" : ""}">${ok ? `${svg("check")}Check-in` : ended ? "Sin check-in" : "Pendiente"}</span></li>`; }).join("")}</ol>
      </div>
    </article>`;
  }
  /* Actividades presenciales del evento y día seleccionados */
  function activitiesHTML() {
    const ids = myEvIds(); if (!ids.length) return "";
    const s = getSel("main"), ev = evById(s.ev), isMain = ev.id === "bog";
    const exp = A.exp && !isEnded("exp:" + A.exp.id) && EXPS.find(e => e.id === A.exp.id);
    const cafes = Object.entries(A.coffees || {}).filter(([, c]) => c.status === "accepted").map(([n, c]) => ({ n, txt: c.slot }));
    const expHere = isMain && exp && exp.day === s.day, cafHere = isMain && s.day === 0 ? cafes : [];
    const n = (expHere ? 1 : 0) + cafHere.length;
    let body;
    if (!isMain) body = `<div class="me-tip" style="margin-top:0">${svg("info")}<span>${esc(ev.name)} no tiene actividades presenciales adicionales. Las experiencias de arte, cocina y deporte son del AI &amp; Business Summit.</span>${ids.includes("bog") ? `<button type="button" class="pill-btn" data-evjump="bog:0">Ver ese evento ${svg("arrow")}</button>` : ""}</div>`;
    else body = `${expHere ? `<div class="me-exp"><span class="me-exp-emo">${svg(exp.ic)}</span><div class="min-w-0"><div class="gf-ag-type">Experiencia presencial</div><div class="font-semibold text-[15px]">${exp.name}</div><div class="text-[13px] text-mute">${exp.desc}</div><div class="me-meta" style="margin-top:6px"><span>${svg("clock")}${exp.time}</span><span>${svg("pin")}${exp.where}</span></div><div class="me-actions" style="margin-top:8px">${sumCtl("exp:" + exp.id)}</div></div>${act("mepick", "", mePick ? "Cerrar" : "Cambiar", "btn btn-ghost btn-sm")}</div>${mePick ? mePickerHTML(exp) : ""}` : ""}
      ${cafHere.map(c => `<div class="me-exp"><span class="me-exp-emo">${svg("coffee")}</span><div class="min-w-0"><div class="gf-ag-type">Café de networking</div><div class="font-semibold text-[15px]">Café con ${esc(c.n)}</div><div class="me-meta" style="margin-top:4px"><span>${svg("clock")}${esc(c.txt)}</span></div></div></div>`).join("")}
      ${!expHere ? (exp ? `<div class="me-tip">${svg("calendar")}<span>Tu experiencia <b>${exp.name}</b> es el <b>Día ${exp.day + 1}</b>.</span><button type="button" class="pill-btn" data-evjump="bog:${exp.day}">Ir al Día ${exp.day + 1} ${svg("arrow")}</button>${act("mepick", "", mePick ? "Cerrar" : "Cambiar", "btn btn-ghost btn-sm")}</div>${mePick ? mePickerHTML(exp) : ""}`
        : `<div class="me-tip">${svg("spark")}<span>${n ? "¿Te animas a una experiencia de arte, cocina o deporte?" : "No tienes actividades presenciales este día. Inscríbete en una experiencia de arte, cocina o deporte."}${A.exp ? "" : ` +${EXP_XP} XP la primera vez.`}</span>${act("mepick", "", mePick ? "Cerrar" : "Elegir actividad", "btn btn-primary btn-sm")}</div>${mePick ? mePickerHTML(null) : ""}`) : ""}`;
    return `<article class="pcard" id="actCard">
      <header class="pcard-h"><div><span class="pcard-k">En el recinto · ${esc(ev.city)} · Día ${s.day + 1}</span><h2 class="pcard-t">Actividades presenciales</h2></div><span class="chip chip-emerald tabular">${svg("users")}${n}</span></header>
      ${body}
    </article>`;
  }

  /* ---- Mi QR de Conexión Rápida + simulación de escaneo ---- */
  
  let qrOpen = false, qrTimer = 0, qrEpoch = 0, scanRun = 0, scanCur = null;
  const hashStr = (t) => { let h = 2166136261; for (const c of String(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const qrEpochNow = () => Math.floor(Date.now() / 30000);
  const qrToken = () => "knet:" + (hashStr(PERSONAS[A.ind].name + "|" + qrEpochNow()) >>> 0).toString(36).padStart(7, "0").slice(0, 7);
  const qrPerson = (n) => (A.qrConn || []).find(x => x.name === n);
  function qrSVG(seed, uid) {
    const N = 25, r = seeded(hashStr(seed) % 2147483646 + 1); let mods = "";
    const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
    const inLogo = (x, y) => x >= 9 && x <= 15 && y >= 9 && y <= 15;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && !inLogo(x, y) && r() < .5) mods += `<rect x="${x + .1}" y="${y + .1}" width=".8" height=".8" rx=".3"/>`;
    const finder = (x, y) => `<rect x="${x + .5}" y="${y + .5}" width="6" height="6" rx="1.7" fill="none" stroke="url(#qa${uid})" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".9" fill="url(#qb${uid})"/>`;
    return `<svg viewBox="-1.6 -1.6 28.2 28.2" class="qr-svg" role="img" aria-label="Código QR de conexión de ${esc(PERSONAS[A.ind].name)}"><defs><linearGradient id="qa${uid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7500C0"/><stop offset="1" stop-color="#A100FF"/></linearGradient><linearGradient id="qb${uid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6E8FFF"/><stop offset="1" stop-color="#A100FF"/></linearGradient></defs>
      <rect x="-1.6" y="-1.6" width="28.2" height="28.2" rx="2.6" fill="#F8F6FF"/><g fill="url(#qa${uid})">${mods}</g>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}
      <rect x="9.3" y="9.3" width="6.4" height="6.4" rx="1.8" fill="url(#qb${uid})"/><text x="12.5" y="14.05" text-anchor="middle" font-size="4.2" font-weight="800" fill="#fff" font-family="Plus Jakarta Sans, Arial, sans-serif">K</text></svg>`;
  }

  /* =================== RECINTO 3D · WebGL propio + WebXR (VR / AR) =================== */
  const VC = { purple: [[161, 0, 255], "#A100FF"], lime: [[200, 240, 60], "#C8F03C"], orange: [[255, 92, 30], "#FF5C1E"], blue: [[36, 92, 255], "#245CFF"] };
  /* Cada evento tiene su propio recinto: forma, piso, pasillos (grafo), entrada, entorno, zonas y aforo.
     Zona: [nombre, tipo, color, descripción, [x0, x1, z0, z1], puerta [x, z], nodo del pasillo] */
  
  
  const ROOM_TYPE = (s) => { const k = `${s.kind} ${s.ttl}`.toLowerCase(), r = String(s.room).toLowerCase();
    if (/taller|lab/.test(k) || /lab|taller|maker/.test(r)) return "labs"; if (/keynote|panel/.test(k) || /auditorio|principal/.test(r)) return "stage"; if (/demo/.test(k) || /stand|expo|pabell/.test(r)) return "booths"; if (/terraza|lounge|foyer|caf/.test(r)) return "lounge"; return "stage"; };
  let VZ = [];
  let VV = null;
  function vnBuildZones(evId) { VV = VENUES[evId] || VENUES.bog; VZ = VV.z.map(([name, type, c, desc, r, door, node, extra], i) => ({ id: "ABCD"[i], name, type, col: VC[c][0], hex: VC[c][1], desc, x0: r[0], x1: r[1], z0: r[2], z1: r[3], door, node, ...(extra || {}) })); return VZ; }
  const vnFloorC = () => [(VV.floor[0] + VV.floor[1]) / 2, (VV.floor[2] + VV.floor[3]) / 2];
  const vnEnt = () => VV.nodes[VV.ent].slice();
  const vnClamp = (o) => { o.x = Math.max(VV.floor[0] + .5, Math.min(VV.floor[1] - .5, o.x)); o.z = Math.max(VV.floor[2] + .5, Math.min(VV.floor[3] - .5, o.z)); };
  vnBuildZones("bog");
  const VN = { ev: null, mode: "overview", target: null, you: [0, 19.5], yaw: 0.78, pitch: 0.66, dist: 108, walk: { x: 0, z: 19.5, yaw: 0, pitch: -0.05 }, people: null, tourT: 0, hf: null, xr: null, arRot: 0, voice: false };
  let vnRaf = 0, vnStopFn = null;
  function vnEvList() { const ids = myEvIds(); return ids.length ? ids : ["bog", "med", "baq"]; }
  function vnEnsureEv() { const list = vnEvList(), m = myEvIds().length ? getSel("main").ev : null; let ev = list.includes(m) ? m : list.includes(VN.ev) ? VN.ev : list[0];
    if (ev !== VN.ev || !VZ.length || VZ._ev !== ev) { VN.ev = ev; vnBuildZones(ev); VZ._ev = ev; VN.people = null; VN.target = null; VN.you = vnEnt(); VN.dist = Math.max(48, 1.7 * Math.max(VV.floor[1] - VV.floor[0], VV.floor[3] - VV.floor[2])); VN.yaw = 0.78; } return evById(ev); }
  function vnStatus(ev) { const today = new Date(), iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (isEnded("ev:" + ev.id) || iso > ev.days[ev.days.length - 1]) return { k: "done", t: "Finalizado" };
    if (ev.days.includes(iso)) return { k: "live", t: "En vivo hoy", day: ev.days.indexOf(iso) };
    const n = Math.round((new Date(ev.days[0] + "T12:00:00") - new Date(iso + "T12:00:00")) / 864e5); return { k: "soon", t: n === 1 ? "Empieza mañana" : `Faltan ${n} días` }; }
  function vnNow(ev, st) { const sel = myEvIds().includes(ev.id) ? getSel("main") : null, day = st.k === "live" ? st.day : sel && sel.ev === ev.id ? sel.day : 0, list = sessionsFor(ev.id, day); if (!list.length) return null;
    const d = new Date(), hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; let cur = null; list.forEach(s => { if (s.tm <= hm) cur = s; });
    const s = cur || list[0], type = ROOM_TYPE(s), q = VZ.find(z => z.type === type) || VZ.find(z => z.type === "stage") || VZ.find(z => z.type === "dinner") || VZ[0]; return { s, q, day, live: !!cur && st.k === "live" }; }
  window.__venueBusy = () => !!VN.xr;
  const vzAt = (x, z) => VZ.find(q => x >= q.x0 && x <= q.x1 && z >= q.z0 && z <= q.z1);
  const vzCenter = (q) => [(q.x0 + q.x1) / 2, (q.z0 + q.z1) / 2];
  function vnPath(a, b) { // Dijkstra sobre el grafo de pasillos del recinto
    const N = VV.nodes, adj = {}; Object.keys(N).forEach(k => adj[k] = []); VV.edges.forEach(([x, y]) => { const d = Math.hypot(N[x][0] - N[y][0], N[x][1] - N[y][1]); adj[x].push([y, d]); adj[y].push([x, d]); });
    const dist = {}, prev = {}, Q = new Set(Object.keys(N)); Object.keys(N).forEach(k => dist[k] = Infinity); dist[a] = 0;
    while (Q.size) { let u = null; Q.forEach(k => { if (u === null || dist[k] < dist[u]) u = k; }); Q.delete(u); if (u === b) break; adj[u].forEach(([w, d]) => { if (dist[u] + d < dist[w]) { dist[w] = dist[u] + d; prev[w] = u; } }); }
    const out = []; for (let k = b; k; k = prev[k]) { out.unshift(k); if (k === a) break; } return out; }
  function vnRoute(from, q) {
    const pts = [[from[0], from[1]]]; const inZ = vzAt(from[0], from[1]);
    if (inZ === q) { pts.push(vzCenter(q)); return pts; }
    let start; if (inZ) { pts.push(inZ.door); start = inZ.node; } else { let best = Infinity; Object.entries(VV.nodes).forEach(([k, p]) => { const d = Math.hypot(p[0] - from[0], p[1] - from[1]); if (d < best) { best = d; start = k; } }); }
    vnPath(start, q.node).forEach(k => pts.push(VV.nodes[k].slice())); pts.push(q.door); pts.push(vzCenter(q));
    const d = pts.filter((p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > .3);
    // quitar puntos intermedios en línea recta para que las indicaciones solo hablen de giros reales
    return d.filter((p, i, a) => { if (!i || i === a.length - 1) return true; const [x0, z0] = a[i - 1], [x2, z2] = a[i + 1]; return Math.abs((p[0] - x0) * (z2 - p[1]) - (p[1] - z0) * (x2 - p[0])) > .05; });
  }
  const vnLen = (pts) => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  /* matemáticas mínimas */
  const M4 = {
    id: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
    persp(f, asp, n, fa) { const t = 1 / Math.tan(f / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]; },
    look(e, c, u) { let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; let l = Math.hypot(...z); z = z.map(v => v / l); let x = [u[1] * z[2] - u[2] * z[1], u[2] * z[0] - u[0] * z[2], u[0] * z[1] - u[1] * z[0]]; l = Math.hypot(...x); x = x.map(v => v / l); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]; },
    tr: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
    sc: (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1],
    ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
    inv(m) { const a = m, o = new Array(16);
      const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = a;
      const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return M4.id(); det = 1 / det;
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return o; },
    xf(m, v) { const x = v[0], y = v[1], z = v[2], w = v[3] === undefined ? 1 : v[3]; return [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w]; }
  };
  /* geometría: cajas y cilindros con normales y color por vértice */
  function vnGeo() { const d = []; const c3 = (c) => [c[0] / 255, c[1] / 255, c[2] / 255];
    const quad = (p, n, col) => { [0, 1, 2, 0, 2, 3].forEach(i => d.push(...p[i], ...n, ...col)); };
    return {
      d,
      box(x, y, z, w, h, dp, col, top) { const c = c3(col), ct = top ? c3(top) : c, x0 = x - w / 2, x1 = x + w / 2, z0 = z - dp / 2, z1 = z + dp / 2, y1 = y + h;
        quad([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], ct);
        quad([[x0, y, z1], [x1, y, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], c);
        quad([[x1, y, z0], [x0, y, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], c);
        quad([[x1, y, z1], [x1, y, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], c);
        quad([[x0, y, z0], [x0, y, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], c); },
      cyl(x, y, z, r, h, col, seg = 10, top) { const c = c3(col), ct = top ? c3(top) : c;
        for (let i = 0; i < seg; i++) { const a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, p0 = [x + Math.cos(a0) * r, z + Math.sin(a0) * r], p1 = [x + Math.cos(a1) * r, z + Math.sin(a1) * r], am = (a0 + a1) / 2;
          quad([[p0[0], y, p0[1]], [p1[0], y, p1[1]], [p1[0], y + h, p1[1]], [p0[0], y + h, p0[1]]], [Math.cos(am), 0, Math.sin(am)], c);
          [[x, y + h, z], [p1[0], y + h, p1[1]], [p0[0], y + h, p0[1]]].forEach(v => d.push(...v, 0, 1, 0, ...ct)); } }
    };
  }
  function vnScene(light) {
    const g = vnGeo(), V = VV, [fx0, fx1, fz0, fz1] = V.floor, fw = fx1 - fx0, fd = fz1 - fz0, [fcx, fcz] = vnFloorC();
    const gr = GROUND[V.ground][light ? 0 : 1], aisle = gr.map(c => light ? c * .93 : Math.min(255, c * 1.35 + 6)), edge = gr.map(c => c * (light ? .8 : .7)), ink = light ? [40, 32, 50] : [210, 200, 225];
    // entorno: agua (río o mar)
    const water = light ? [110, 170, 225] : [16, 44, 86];
    if (/water-front/.test(V.deco || "")) { g.box(fcx, -0.9, fz1 + 7, fw + 24, 0.4, 14, water, water); for (let x = fx0 + 3; x < fx1; x += 6) g.cyl(x, -0.9, fz1 + .6, 0.25, 1.2, [90, 70, 50], 6); }
    if (/water-back/.test(V.deco || "")) { g.box(fcx, -0.9, fz0 - 8, fw + 30, 0.4, 16, water, water); }
    g.box(fcx, -0.6, fcz, fw, 0.6, fd, edge, gr);
    // pasillos: tramos del grafo y conexión puerta → pasillo
    const strip = (a, b, w) => { const [x0, z0] = a, [x1, z1] = b, L = Math.hypot(x1 - x0, z1 - z0); if (L < .01) return; const horiz = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
      g.box((x0 + x1) / 2, 0.003, (z0 + z1) / 2, horiz ? L + w : w, 0.02, horiz ? w : L + w, aisle, aisle); };
    V.edges.forEach(([a, b]) => strip(V.nodes[a], V.nodes[b], V.aisle));
    VZ.forEach(q => strip(q.door, V.nodes[q.node], Math.min(3, V.aisle)));
    VZ.forEach(q => { const w = q.x1 - q.x0, dd = q.z1 - q.z0, cx = (q.x0 + q.x1) / 2, cz = (q.z0 + q.z1) / 2, dark = q.col.map(c => c * .7); g.box(cx, 0, cz, w, 0.12, dd, dark, q.col); });
    // mobiliario adaptado al tamaño de cada zona
    const grid = (n, a0, a1, pad) => { const out = []; if (n <= 1) { out.push((a0 + a1) / 2); return out; } for (let i = 0; i < n; i++) out.push(a0 + pad + i * (a1 - a0 - 2 * pad) / (n - 1)); return out; };
    VZ.forEach(q => { const { x0, x1, z0, z1 } = q, w = x1 - x0, dd = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, deep = q.col.map(c => c * .45), mid = q.col.map(c => Math.min(255, c * .75 + 30)), tall = dd >= w;
      if (q.type === "stage") {
        if (dd >= 10) { g.box(cx, 0.12, z0 + 1.8, w * .66, 1.1, 3, deep, mid); g.box(cx, 1.2, z0 + .6, w * .55, Math.min(5.5, dd * .4), 0.4, [20, 14, 30], [30, 24, 40]); g.box(cx, 1.9, z0 + .85, w * .48, Math.min(4.2, dd * .3), 0.12, [140, 180, 255], [140, 180, 255]);
          grid(Math.max(2, Math.floor((w - 4) / 2.3)), x0, x1, 2.5).forEach((x, c) => grid(Math.max(2, Math.floor((dd - 7) / 1.4)), z0 + 5, z1, 1.2).forEach((z, r) => g.box(x + (r % 2) * .4, 0.12, z, 1.2, 0.8, 0.8, deep, mid))); }
        else { g.box(cx, 0.12, cz, w * .75, 0.9, dd * .7, deep, mid); g.box(cx, 1.02, z0 + .5, w * .5, 3.4, 0.3, [20, 14, 30], [30, 24, 40]); g.box(cx, 1.6, z0 + .7, w * .44, 2.4, 0.1, [140, 180, 255], [140, 180, 255]); } }
      else if (q.type === "booths") { grid(Math.max(1, Math.floor(w / 5.5)), x0, x1, 2.8).forEach(x => grid(Math.max(1, Math.floor(dd / 5)), z0, z1, 2.2).forEach(z => { g.box(x, 0.12, z, Math.min(3.6, w * .7), 0.9, 2, [245, 245, 240], [255, 255, 255]); g.box(x, 0.12, z - 1.2, Math.min(3.6, w * .7), 2.4, 0.2, deep, mid); })); }
      else if (q.type === "lounge") { grid(Math.max(1, Math.floor(w / 4.6)), x0, x1, 2.2).forEach(x => grid(Math.max(1, Math.floor(dd / 4.2)), z0, z1, 1.8).forEach(z => { g.cyl(x, 0.12, z - .3, 0.85, 0.75, [250, 245, 235], 12, [255, 252, 245]); g.box(x, 0.12, z + 1.2, 2, 0.5, 0.7, deep, mid); })); }
      else if (q.type === "dinner") { const rows = q.fountain ? [z0 + 2.2, z1 - 2.2] : grid(Math.max(1, Math.floor(dd / 4)), z0, z1, 2); const len = w * .72;
        rows.forEach(z => { g.box(cx, 0.12, z, len, 0.78, 1.3, [250, 245, 235], [255, 252, 245]); grid(Math.max(2, Math.floor(len / 1.6)), cx - len / 2, cx + len / 2, .5).forEach(x => { g.box(x, 0.12, z - 1.05, 0.55, 0.5, 0.55, deep, mid); g.box(x, 0.12, z + 1.05, 0.55, 0.5, 0.55, deep, mid); }); });
        if (q.fountain) { g.cyl(cx, 0.12, cz, 2.2, 0.6, [200, 190, 175], 16, [120, 180, 230]); g.cyl(cx, 0.72, cz, 0.35, 1.4, [200, 190, 175], 10); }
        grid(Math.max(2, Math.floor(w / 4)), x0, x1, 1).forEach(x => g.cyl(x, 0.12, q.fountain ? cz : z1 - .6, 0.12, 2.6, [60, 50, 40], 6, [255, 210, 120])); }
      else { grid(Math.max(1, Math.floor(w / (tall ? 3.2 : 6.5))), x0, x1, tall ? 1.8 : 3.4).forEach(x => grid(Math.max(1, Math.floor(dd / 3.2)), z0, z1, 1.6).forEach(z => { g.box(x, 0.12, z, tall ? 2.2 : 5, 0.85, 1.3, [230, 235, 245], [245, 248, 255]); g.box(x, 0.97, z - 0.3, 1, 0.75, 0.08, [20, 24, 40], [20, 24, 40]); })); } });
    // tótems NFC en los pasillos
    (V.totems || []).forEach(k => { const [x, z] = V.nodes[k]; g.cyl(x + V.aisle * .3, 0, z + V.aisle * .3, 0.42, 1.6, [120, 150, 30], 12, [200, 240, 60]); });
    // entorno de cada recinto
    const deco = V.deco || "";
    if (/lamps/.test(deco)) V.edges.forEach(([a, b]) => { const p = V.nodes[a], q2 = V.nodes[b]; for (let t = 0; t <= 1; t += .5) { const x = p[0] + (q2[0] - p[0]) * t, z = p[1] + (q2[1] - p[1]) * t; g.cyl(x, 0, z - V.aisle / 2 - .3, 0.1, 4, [60, 60, 70], 6, [255, 230, 150]); g.cyl(x, 0, z + V.aisle / 2 + .3, 0.1, 4, [60, 60, 70], 6, [255, 230, 150]); } });
    if (/pillars/.test(deco)) for (let x = fx0 + 4; x < fx1; x += 8) for (const z of [fz0 + .6, fz1 - .6]) g.box(x, 0, z, 0.8, 6, 0.8, [70, 70, 80], [110, 110, 120]);
    if (/columns/.test(deco)) Object.values(V.nodes).forEach(([x, z], i) => { if (Math.abs(z) > 15) return; [[1.6, 1.6], [-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6]].forEach(([dx, dz]) => { if (Math.abs(x + dx) < 9.5 && Math.abs(z + dz) < 7.5) return; g.cyl(x + dx, 0, z + dz, 0.3, 3.4, [235, 225, 205], 8, [250, 245, 235]); }); });
    if (/palms/.test(deco)) [[-30, -1], [-18, 0], [-4, 4], [5, -3], [17, 0], [30, 2], [-30, 20], [30, 19], [-14, -20], [14, -20.5], [-31, -14], [31, -6]].forEach(([x, z]) => { g.cyl(x, 0, z, 0.25, 4.2, [110, 80, 50], 6); g.box(x, 4.1, z, 3.2, 0.25, 0.9, [40, 130, 60], [60, 170, 80]); g.box(x, 4.1, z, 0.9, 0.25, 3.2, [40, 130, 60], [60, 170, 80]); });
    // arco de entrada, orientado según el borde donde está la entrada
    const [ex, ez] = vnEnt(), onX = Math.min(Math.abs(ex - fx0), Math.abs(ex - fx1)) < Math.min(Math.abs(ez - fz0), Math.abs(ez - fz1)), hw = Math.min(3.4, V.aisle * .6);
    if (onX) { g.box(ex, 0, ez - hw, 0.6, 4, 0.6, ink); g.box(ex, 0, ez + hw, 0.6, 4, 0.6, ink); g.box(ex, 4, ez, 0.6, 0.6, hw * 2 + .6, [161, 0, 255], [190, 90, 255]); }
    else { g.box(ex - hw, 0, ez, 0.6, 4, 0.6, ink); g.box(ex + hw, 0, ez, 0.6, 4, 0.6, ink); g.box(ex, 4, ez, hw * 2 + .6, 0.6, 0.6, [161, 0, 255], [190, 90, 255]); }
    return new Float32Array(g.d);
  }
  function vnPersonGeo() { const g = vnGeo(); g.cyl(0, 0, 0, 0.26, 1.25, [255, 255, 255], 8); g.cyl(0, 1.3, 0, 0.2, 0.36, [255, 255, 255], 8); return new Float32Array(g.d); }
  function vnBeaconGeo() { const g = vnGeo(); g.box(0, 0, 0, 0.5, 0.5, 0.5, [255, 255, 255]); return new Float32Array(g.d); }
  function vnInitPeople() {
    if (VN.people) return; const P = []; let seed = 7 + (VN.ev || "bog").split("").reduce((a, c) => a + c.charCodeAt(0), 0); const total = (VENUES[VN.ev] || VENUES.bog).size; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    VZ.forEach((q, qi) => { const n = Math.round(total * [.28, .22, .25, .18][qi]); for (let i = 0; i < n; i++) { const x = q.x0 + 1.5 + rnd() * (q.x1 - q.x0 - 3), z = q.z0 + 1.5 + rnd() * (q.z1 - q.z0 - 3); P.push({ x, z, tx: x, tz: z, q, sp: .5 + rnd() * .6, w: rnd() * 3 }); } });
    const keys = Object.keys(VV.nodes); for (let i = 0; i < Math.max(2, Math.round(total * .07)); i++) { const k = keys[Math.floor(rnd() * keys.length)], [x, z] = VV.nodes[k]; P.push({ x, z, tx: x, tz: z, q: null, node: k, sp: .9, w: rnd() * 2 }); }
    VN.people = P; VN.rnd = rnd;
  }
  function vnMatches() { const d = IND[A.ind], pref = ["lounge", "booths", "labs"];
    return d.matches.map((m, i) => { const q = VZ.find(z => z.type === pref[i % 3] && !(i && VZ.find(y => y.type === pref[(i - 1) % 3]) === z)) || VZ[(i + 1) % 4], [cx, cz] = vzCenter(q); return { n: m[1], ini: m[0], sc: m[3], x: cx + [-1, 3, 1][i % 3], z: cz + [0.5, 3, 2.5][i % 3], zone: q.id, conn: isConn(m[1]) }; }); }

  function venueHTML() {
    const ev = vnEnsureEv(); vnInitPeople();
    const st = vnStatus(ev), nw = vnNow(ev, st), reg = myEvIds().includes(ev.id), list = vnEvList(); VN.nowZone = nw ? nw.q.id : null; VN.nowLive = !!(nw && nw.live);
    const ms = vnMatches(), tgt = VN.target && VZ.find(q => q.id === VN.target), rt = tgt ? vnRoute(VN.you, tgt) : null, len = rt ? Math.round(vnLen(rt)) : 0;
    const xrOk = !!navigator.xr;
    return `<div class="stack vn">
      <article class="pcard vn-card">
        <div class="vn-ev">
          <div class="vn-ev-main">
            <span class="vn-ev-st ${st.k}">${st.k === "live" ? '<i class="vn-dot"></i>' : svg(st.k === "done" ? "check" : "calendar")}${st.t}</span>
            <span class="pcard-k">Recinto del evento</span>
            <h2 class="pcard-t">${esc(ev.name)}</h2>
            <p class="vn-ev-meta">${svg("pin")}<span>${esc(ev.venue)} · ${esc(ev.city)}</span>${svg("calendar")}<span>${ev.date}</span>${svg("users")}<span>${VN.people.length} personas en el recinto</span></p>
          </div>
          ${list.length > 1 && !reg ? `<label class="vn-ev-sel"><span class="vn-k">Cambiar de evento</span><select class="input" id="vnEvSel" aria-label="Elige el evento del recinto">${list.map(id => `<option value="${id}" ${id === ev.id ? "selected" : ""}>${esc(evById(id).name)} · ${esc(evById(id).city)}</option>`).join("")}</select></label>` : ""}
        </div>
        ${reg ? "" : `<p class="vn-ev-note">${svg("info")}<span>Aún no estás inscrito en ningún evento: ves el recinto de ejemplo. Inscríbete en Mis eventos y aquí aparecerá el recinto de cada uno.</span></p>`}
        ${nw ? `<div class="vn-now" style="--zc:${nw.q.hex}">
          <span class="vn-now-k">${nw.live ? "Ahora en este recinto" : "Vista previa del evento"} · Día ${nw.day + 1} · ${nw.s.tm}</span>
          <div class="vn-now-row"><span class="vn-zl">${nw.q.id}</span><div class="min-w-0"><b>${esc(nw.s.ttl)}</b><span>${esc(nw.s.kind)} · ${esc(nw.q.name)}${ev.id === "bog" ? ` · ${esc(nw.s.room)}` : ""}</span></div><button type="button" class="btn btn-primary btn-sm" data-vnz="${nw.q.id}">${svg("pin")}Trazar ruta</button></div>
        </div>` : ""}
        <div class="vn-stage" id="vnStage">
          <canvas id="venueCanvas" tabindex="0" role="img" aria-label="Mapa 3D del recinto de ${esc(ev.name)} con cuatro zonas: ${VZ.map(q => esc(q.name)).join(", ")}. Arrastra para girar y usa la rueda para acercar."></canvas>
          <div class="vn-labels" id="vnLabels" aria-hidden="true"></div>
          <div class="vn-hud" id="vnHud"></div>
          <div class="vn-help" id="vnHelp">${svg("info")}<span>Arrastra para girar · rueda o pellizco para acercar · toca una zona para trazar la ruta</span></div>
        </div>
        <div class="vn-bar">
          <div class="vn-route">
            <span class="vn-k">Trazar ruta a</span>
            <div class="vn-zones">${VZ.map(q => `<button type="button" class="vn-z ${VN.target === q.id ? "on" : ""}" data-vnz="${q.id}" aria-pressed="${VN.target === q.id}" style="--zc:${q.hex}"><b>${q.id}</b>${q.name}</button>`).join("")}</div>
            <div class="vn-rinfo" aria-live="polite">${tgt ? `${svg("pin")}<span>Ruta a <b>${tgt.name}</b> · ${len} m · ${Math.max(1, Math.round(len / 70))} min a pie</span>` : `${svg("pin")}<span>Elige una zona para trazar tu ruta desde la entrada.</span>`}</div>
          </div>
          <div class="vn-modes">
            <span class="vn-k">Elige una zona para trazar tu ruta. Recórrela a pie en primera persona, mira el tour dirigido o entra en VR.</span>
            <div class="vn-mbtns">
              <button type="button" class="btn btn-primary btn-sm" data-vnm="walk">${svg("pin")}Recorrer a pie</button>
              <button type="button" class="btn btn-ghost btn-sm" data-vnm="tour">${svg("play")}Tour dirigido</button>
              <button type="button" class="btn btn-ghost btn-sm" data-vnm="hf">${svg("bolt")}Manos libres</button>
              <button type="button" class="btn btn-ghost btn-sm" data-vnm="vr" id="vnVR" ${xrOk ? "" : "disabled"}>${svg("layers")}Entrar en VR</button>
              <button type="button" class="btn btn-ghost btn-sm" data-vnm="ar" id="vnAR" ${xrOk ? "" : "disabled"}>${svg("target")}Ver en mi mesa (AR)</button>
            </div>
            <p class="vn-note" id="vnNote">VR y AR se activan en un visor WebXR (Meta Quest) o en Chrome para Android.</p>
          </div>
        </div>
      </article>
      <div class="vn-zgrid">${VZ.map(q => { const here = ms.filter(m => m.zone === q.id), n = VN.people ? VN.people.filter(p => p.q === q).length : 0;
        return `<article class="vn-zc" style="--zc:${q.hex}"><div class="vn-zc-h"><span class="vn-zl">${q.id}</span><div class="min-w-0"><b>${q.name}</b><span>${q.desc}</span></div></div>
          ${nw && nw.q.id === q.id ? `<div class="vn-zc-now on">${svg("clock")}<span>${nw.live ? "Ahora" : "En agenda"} · ${nw.s.tm}: ${esc(nw.s.ttl)}</span></div>` : ""}
          <div class="vn-zc-meta"><span>${svg("users")}${n} personas</span>${here.map(m => `<button type="button" class="vn-zc-m" data-act="person" data-v="${esc(m.n)}">${m.conn ? svg("check") : svg("spark")}${esc(m.n)} · ${m.sc}%</button>`).join("")}</div>
          <button type="button" class="pill-btn" data-vnz="${q.id}">Trazar ruta ${svg("arrow")}</button></article>`; }).join("")}</div>
    </div>`;
  }

  function startVenue() {
    if (vnStopFn) vnStopFn();
    const cv = $("#venueCanvas"); if (!cv) return; vnEnsureEv(); vnInitPeople();
    const gl = cv.getContext("webgl", { antialias: true, alpha: true, xrCompatible: true }); if (!gl) { $("#vnHelp").innerHTML = `${svg("info")}<span>Tu navegador no tiene WebGL; no podemos mostrar el recinto en 3D.</span>`; return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uP,uV,uM;uniform vec3 uT;uniform float uUT;varying vec3 vC;varying float vL;varying float vF;void main(){vec4 w=uM*vec4(aP,1.);vec4 e=uV*w;gl_Position=uP*e;vec3 n=normalize(mat3(uM)*aN);vL=.58+.42*max(dot(n,normalize(vec3(.35,1.,.45))),0.);vC=mix(aC,uT,uUT);vF=clamp((-e.z-60.)/140.,0.,.55);}"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, "precision mediump float;varying vec3 vC;varying float vL;varying float vF;uniform float uA;uniform vec3 uFog;void main(){gl_FragColor=vec4(mix(vC*vL,uFog,vF),uA);}"));
    gl.linkProgram(prog); gl.useProgram(prog);
    const L = (n) => gl.getAttribLocation(prog, n), U = (n) => gl.getUniformLocation(prog, n);
    const aP = L("aP"), aN = L("aN"), aC = L("aC"), uP = U("uP"), uV = U("uV"), uM = U("uM"), uT = U("uT"), uUT = U("uUT"), uA = U("uA"), uFog = U("uFog");
    const mk = (data) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return { b, n: data.length / 9 }; };
    let light = document.documentElement.classList.contains("theme-light"), sceneM = mk(vnScene(light));
    const personM = mk(vnPersonGeo()), beaconM = mk(vnBeaconGeo()), routeB = gl.createBuffer();
    const bind = (m) => { gl.bindBuffer(gl.ARRAY_BUFFER, m.b); gl.enableVertexAttribArray(aP); gl.enableVertexAttribArray(aN); gl.enableVertexAttribArray(aC); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 36, 0); gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 36, 12); gl.vertexAttribPointer(aC, 3, gl.FLOAT, false, 36, 24); };
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const labels = $("#vnLabels"), hud = $("#vnHud"), help = $("#vnHelp");
    let W = 1, H = 1, last = performance.now(), dashT = 0, alive = true, keys = {}, routeCount = 0;
    const resize = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(cv);

    /* etiquetas HTML: zonas, matches y "tú" */
    const ms = vnMatches();
    labels.innerHTML = VZ.map(q => `<span class="vn-lab ${VN.nowZone === q.id ? "now" : ""}" data-lz="${q.id}" style="--zc:${q.hex}"><b>${q.id}</b>${q.name}${VN.nowZone === q.id ? (VN.nowLive ? "<em>Ahora</em>" : "<em>Sesión</em>") : ""}</span>`).join("")
      + ms.map((m, i) => `<button type="button" class="vn-lab vn-lab-m ${m.conn ? "conn" : ""}" data-lm="${i}" data-act="person" data-v="${esc(m.n)}" tabindex="-1">${m.conn ? svg("check") : svg("spark")}${esc(m.n)} · ${m.sc}%</button>`).join("")
      + `<span class="vn-lab vn-lab-you" data-lyou>${svg("pin")}Tú</span>`;
    const labEls = { z: VZ.map(q => labels.querySelector(`[data-lz="${q.id}"]`)), m: ms.map((m, i) => labels.querySelector(`[data-lm="${i}"]`)), you: labels.querySelector("[data-lyou]") };

    /* cámara */
    const camOverview = () => { const fc = vnFloorC(), t = [fc[0], -2, fc[1] + 2.5], dd = VN.dist * Math.max(1, 1.05 / (W / H)), e = [t[0] + dd * Math.cos(VN.pitch) * Math.sin(VN.yaw), t[1] + dd * Math.sin(VN.pitch), t[2] + dd * Math.cos(VN.pitch) * Math.cos(VN.yaw)]; return { e, t, fov: 0.52 }; };
    const camWalk = () => { const w = VN.walk, e = [w.x, 1.65, w.z], f = [-Math.sin(w.yaw) * Math.cos(w.pitch), Math.sin(w.pitch), -Math.cos(w.yaw) * Math.cos(w.pitch)]; return { e, t: [e[0] + f[0], e[1] + f[1], e[2] + f[2]], fov: 1.15 }; };
    const evN = evById(VN.ev) ? evById(VN.ev).name : "";
    const [fcx, fcz] = vnFloorC(), R = Math.max(VV.floor[1] - VV.floor[0], VV.floor[3] - VV.floor[2]), [ex0, ez0] = vnEnt(), ol = Math.hypot(ex0 - fcx, ez0 - fcz) || 1;
    const TCAM = VZ.map(q => { const [cx, cz] = vzCenter(q), sx = Math.sign(cx - fcx) || 1, sz = Math.sign(cz - fcz) || 1, span = Math.max(q.x1 - q.x0, q.z1 - q.z0); return [[cx + sx * span * .35, Math.max(7, span * .5), cz + sz * span * .55 + 6], [cx, 1, cz]]; });
    const TOUR = [{ e: [fcx + R * .75, R * .65, fcz + R * .75], t: [fcx, 0, fcz], c: `Bienvenido al recinto de ${evN}: cuatro zonas conectadas por dos pasillos.` }]
      .concat(VZ.map((q, i) => ({ e: TCAM[i][0], t: TCAM[i][1], c: `${q.id} · ${q.name}: ${q.desc}`, q })))
      .concat([{ e: [ex0 + (ex0 - fcx) / ol * 9, 3, ez0 + (ez0 - fcz) / ol * 9], t: [fcx, 2, fcz], c: "La entrada está al frente. Traza una ruta y recórrela a pie o en VR." }]);
    const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const camTour = () => { const seg = 5.5, total = (TOUR.length - 1) * seg, t = Math.min(VN.tourT, total), i = Math.min(TOUR.length - 2, Math.floor(t / seg)), k = ease((t - i * seg) / seg), a = TOUR[i], b = TOUR[i + 1];
      const lerp = (p, q) => p.map((v, j) => v + (q[j] - v) * k); const it = k < .5 ? a : b; return { e: lerp(a.e, b.e), t: lerp(a.t, b.t), fov: 0.8, cap: it.c, q: it.q, done: VN.tourT >= total + 2 }; };

    /* ruta actual */
    const routePts = () => { const tgt = VN.target && VZ.find(q => q.id === VN.target); if (!tgt) return null; const from = (VN.mode === "walk" || VN.mode === "hf") && VN.hf && VN.hf.from ? VN.hf.from : VN.you; return vnRoute(from, tgt); };
    const buildRoute = (pts) => { const g = vnGeo(); if (pts) { const col = light ? [10, 7, 16] : [220, 240, 90]; let acc = 0; for (let i = 1; i < pts.length; i++) { const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
          for (let s = ((dashT - acc) % 1.6 + 1.6) % 1.6; s < L; s += 1.6) { const x = x0 + dx * s, z = z0 + dz * s; g.box(x, 0.16, z, Math.abs(dx) > .5 ? 0.9 : 0.32, 0.05, Math.abs(dz) > .5 ? 0.9 : 0.32, col, col); } acc += L; }
        const end = pts[pts.length - 1]; g.cyl(end[0], 0.14, end[1], 0.9, 0.06, col, 16, col); }
      gl.bindBuffer(gl.ARRAY_BUFFER, routeB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.d), gl.DYNAMIC_DRAW); routeCount = g.d.length / 9; };

    /* dibujo de la escena con una matriz de mundo (W) para AR */
    function draw(P, V, Wm, t) {
      gl.uniformMatrix4fv(uP, false, P); gl.uniformMatrix4fv(uV, false, V); gl.uniform1f(uA, 1);
      gl.uniform3fv(uFog, light ? [0.93, 0.91, 0.87] : [0.06, 0.04, 0.09]);
      gl.uniform1f(uUT, 0); gl.uniformMatrix4fv(uM, false, Wm); bind(sceneM); gl.drawArrays(gl.TRIANGLES, 0, sceneM.n);
      if (routeCount) { gl.bindBuffer(gl.ARRAY_BUFFER, routeB); bind({ b: routeB }); gl.drawArrays(gl.TRIANGLES, 0, routeCount); }
      bind(personM); gl.uniform1f(uUT, 1);
      gl.uniform3fv(uT, light ? [0.08, 0.06, 0.1] : [0.86, 0.82, 0.92]);
      VN.people.forEach(p => { gl.uniformMatrix4fv(uM, false, M4.mul(Wm, M4.tr(p.x, 0.12, p.z))); gl.drawArrays(gl.TRIANGLES, 0, personM.n); });
      ms.forEach((m, i) => { const bob = Math.sin(t / 400 + i) * .05; gl.uniform3fv(uT, m.conn ? [0.06, 0.73, 0.5] : [0.78, 0.94, 0.24]); gl.uniformMatrix4fv(uM, false, M4.mul(Wm, M4.mul(M4.tr(m.x, 0.12 + bob, m.z), M4.sc(1.25, 1.25, 1.25)))); gl.drawArrays(gl.TRIANGLES, 0, personM.n); });
      // tú
      if ((VN.mode === "overview" || VN.mode === "tour") && !(VN.xr && VN.xr.kind === "immersive-vr")) { const [yx, yz] = VN.you; gl.uniform3fv(uT, [0.63, 0, 1]); gl.uniformMatrix4fv(uM, false, M4.mul(Wm, M4.mul(M4.tr(yx, 0.12, yz), M4.sc(1.5, 1.5, 1.5)))); gl.drawArrays(gl.TRIANGLES, 0, personM.n); }
      // balizas sobre las zonas (visibles en VR/AR)
      bind(beaconM); VZ.forEach((q, i) => { const [cx, cz] = vzCenter(q); const on = VN.target === q.id || VN.nowZone === q.id; gl.uniform3fv(uT, q.col.map(v => v / 255)); gl.uniformMatrix4fv(uM, false, M4.mul(Wm, M4.mul(M4.tr(cx, (on ? 7.5 : 6.5) + Math.sin(t / 600 + i) * .3, cz), M4.mul(M4.ry(t / 900 + i), M4.sc(on ? 2.4 : 1.6, on ? 2.4 : 1.6, on ? 2.4 : 1.6))))); gl.drawArrays(gl.TRIANGLES, 0, beaconM.n); });
    }

    /* simulación de asistentes */
    function stepPeople(dt) { VN.people.forEach(p => { if (p.w > 0) { p.w -= dt; return; } const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz);
      if (d < .2) { const q = p.q; if (q) { p.tx = q.x0 + 1.5 + VN.rnd() * (q.x1 - q.x0 - 3); p.tz = q.z0 + 1.5 + VN.rnd() * (q.z1 - q.z0 - 3); } else { const nb = VV.edges.filter(e => e.includes(p.node)).map(e => e[0] === p.node ? e[1] : e[0]); p.node = nb.length ? nb[Math.floor(VN.rnd() * nb.length)] : p.node; [p.tx, p.tz] = VV.nodes[p.node]; p.tx += (VN.rnd() - .5) * 1.5; p.tz += (VN.rnd() - .5) * 1.5; } p.w = VN.rnd() * 4; return; }
      p.x += dx / d * p.sp * dt; p.z += dz / d * p.sp * dt; }); }

    /* voz (manos libres) */
    const say = (txt) => { if (!VN.voice || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = (window.KNET_I18N && window.KNET_I18N.lang === "en") ? "en-US" : "es-CO"; speechSynthesis.speak(u); } catch (e) {} };
    const T = (s) => (window.KNET_I18N ? window.KNET_I18N.t(s) : s);
    function hudSet(html) { hud.innerHTML = html; hud.hidden = !html; }
    function setMode(m) {
      VN.mode = m; keys = {}; help.hidden = m !== "overview";
      $$(".vn-mbtns [data-vnm]").forEach(b => b.classList.toggle("on", b.dataset.vnm === m));
      if (m === "overview") { hudSet(""); try { speechSynthesis.cancel(); } catch (e) {} }
      if (m === "walk") { const fc = vnFloorC(); VN.walk = { x: VN.you[0], z: VN.you[1], yaw: Math.atan2(-(fc[0] - VN.you[0]), -(fc[1] - VN.you[1])), pitch: -0.05 }; VN.hf = { from: VN.you.slice() }; hudSet(`<div class="vn-hud-top"><span>${svg("pin")}${T("Recorrer a pie")} · <span class="mono">WASD / ↑↓←→</span></span><button type="button" class="btn btn-ghost btn-sm" data-vnexit>${svg("x")}${T("Salir")}</button></div>
          <div class="vn-pad" aria-label="${T("Controles de movimiento")}"><button type="button" data-vnk="f" aria-label="${T("Avanzar")}">▲</button><button type="button" data-vnk="l" aria-label="${T("Girar a la izquierda")}">◀</button><button type="button" data-vnk="b" aria-label="${T("Retroceder")}">▼</button><button type="button" data-vnk="r" aria-label="${T("Girar a la derecha")}">▶</button></div>`); cv.focus(); }
      if (m === "tour") { VN.tourT = 0; hudSet(`<div class="vn-hud-top"><span>${svg("play")}${T("Tour dirigido")}</span><button type="button" class="btn btn-ghost btn-sm" data-vnexit>${svg("x")}${T("Salir")}</button></div><div class="vn-cap" id="vnCap"></div>`); }
      if (m === "hf") { if (!VN.target) { VN.target = "A"; } const pts = vnRoute(VN.you, VZ.find(q => q.id === VN.target)); VN.hf = { from: VN.you.slice(), pts, i: 1, said: -1 }; VN.walk = { x: pts[0][0], z: pts[0][1], yaw: Math.atan2(-(pts[1][0] - pts[0][0]), -(pts[1][1] - pts[0][1])), pitch: -0.08 };
        hudSet(`<div class="vn-hud-top"><span>${svg("bolt")}${T("Manos libres")}</span><label class="vn-voice"><input type="checkbox" id="vnVoice" ${VN.voice ? "checked" : ""}>${T("Guía por voz")}</label><button type="button" class="btn btn-ghost btn-sm" data-vnexit>${svg("x")}${T("Salir")}</button></div><div class="vn-cap" id="vnCap"></div>`); syncBar(); }
    }
    function arrive(q) { VN.you = vzCenter(q).slice(); VN.mode = "overview"; setMode("overview"); toast(`<b>${T("Llegaste a")} ${q.name}</b><div class="text-[13px] text-mute">${T(q.desc)}</div>`, "pin"); syncBar(); }
    function syncBar() { const tgt = VN.target && VZ.find(q => q.id === VN.target), info = $(".vn-rinfo"); $$(".vn-z").forEach(b => { b.classList.toggle("on", b.dataset.vnz === VN.target); b.setAttribute("aria-pressed", String(b.dataset.vnz === VN.target)); });
      if (info) { if (tgt) { const len = Math.round(vnLen(vnRoute(VN.you, tgt))); info.innerHTML = `${svg("pin")}<span>${T("Ruta a")} <b>${tgt.name}</b> · ${len} m · ${Math.max(1, Math.round(len / 70))} ${T("min a pie")}</span>`; } else info.innerHTML = `${svg("pin")}<span>${T("Elige una zona para trazar tu ruta desde la entrada.")}</span>`; } }

    /* proyección de etiquetas */
    function placeLabels(PV) {
      const pr = (x, y, z) => { const v = M4.xf(PV, [x, y, z, 1]); if (v[3] <= 0.1) return null; return [(v[0] / v[3] * .5 + .5) * W, (1 - (v[1] / v[3] * .5 + .5)) * H, v[3]]; };
      const put = (el, p, far) => { if (!el) return; if (!p || p[0] < -40 || p[0] > W + 40 || p[1] < -20 || p[1] > H + 20 || (far && p[2] > far)) { el.style.opacity = 0; el.style.pointerEvents = "none"; return; } el.style.opacity = 1; el.style.pointerEvents = ""; el.style.transform = `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) translate(-50%,-100%)`; };
      const fp = VN.mode === "walk" || VN.mode === "hf";
      VZ.forEach((q, i) => put(labEls.z[i], fp ? pr(...[vzCenter(q)[0], 4, vzCenter(q)[1]]) : pr(q.x0 + Math.min(4, (q.x1 - q.x0) / 3), 0.3, q.z0 + 1)));
      ms.forEach((m, i) => put(labEls.m[i], pr(m.x, 2.4, m.z), fp ? 30 : 0));
      put(labEls.you, VN.mode === "overview" || VN.mode === "tour" ? pr(VN.you[0], 2.6, VN.you[1]) : null);
    }

    /* bucle normal */
    function frame(now) {
      if (!alive || VN.xr) return; vnRaf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now; dashT += dt * 1.6;
      const nl = document.documentElement.classList.contains("theme-light"); if (nl !== light) { light = nl; sceneM = mk(vnScene(light)); }
      stepPeople(dt);
      let cam;
      if (VN.mode === "walk") { const w = VN.walk, sp = (keys.shift ? 5 : 2.6) * dt, rs = 1.8 * dt;
        if (keys.l) w.yaw += rs; if (keys.r) w.yaw -= rs; const mv = (keys.f ? 1 : 0) - (keys.b ? 1 : 0), st = (keys.sr ? 1 : 0) - (keys.sl ? 1 : 0);
        w.x += (-Math.sin(w.yaw) * mv + Math.cos(w.yaw) * st) * sp; w.z += (-Math.cos(w.yaw) * mv - Math.sin(w.yaw) * st) * sp; vnClamp(w);
        const tgt = VN.target && VZ.find(q => q.id === VN.target); if (tgt) { const c = vzCenter(tgt); if (Math.hypot(w.x - c[0], w.z - c[1]) < 2.2) { arrive(tgt); } }
        if (VN.mode === "walk") VN.hf.from = [w.x, w.z]; cam = camWalk(); }
      else if (VN.mode === "hf") { const h = VN.hf, w = VN.walk, tgtP = h.pts[h.i], dx = tgtP[0] - w.x, dz = tgtP[1] - w.z, d = Math.hypot(dx, dz), want = Math.atan2(-dx, -dz); let dy = want - w.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); w.yaw += dy * Math.min(1, dt * 2.5);
        if (Math.abs(dy) < .35) { const st = Math.min(d, 1.6 * dt); w.x += dx / d * st; w.z += dz / d * st; }
        const cap = $("#vnCap"); const tq = VZ.find(q => q.id === VN.target);
        if (h.i < h.pts.length - 1) { const a = h.pts[h.i - 1], b = h.pts[h.i], c = h.pts[h.i + 1], cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); const turn = Math.abs(cr) < .05 ? T("sigue recto") : cr > 0 ? T("gira a la derecha") : T("gira a la izquierda"); const txt = `${T("En")} ${Math.round(d)} m ${turn} ${T("hacia")} ${tq.name}.`; if (cap) cap.textContent = txt; if (h.said !== h.i) { h.said = h.i; say(txt); } }
        else { const txt = `${tq.name} ${T("está justo delante")} · ${Math.round(d)} m`; if (cap) cap.textContent = txt; if (h.said !== h.i) { h.said = h.i; say(txt); } }
        if (d < .25) { h.i++; if (h.i >= h.pts.length) { say(`${T("Llegaste a")} ${tq.name}`); arrive(tq); } }
        h.from = [w.x, w.z]; cam = camWalk(); }
      else if (VN.mode === "tour") { VN.tourT += dt; cam = camTour(); const cap = $("#vnCap"); if (cap && cap.dataset.c !== cam.cap) { cap.dataset.c = cam.cap; cap.textContent = cam.q ? `${cam.q.id} · ${T(cam.q.name)}: ${T(cam.q.desc)}` : T(cam.cap); } if (cam.done) setMode("overview"); }
      else cam = camOverview();
      buildRoute(VN.mode === "tour" ? null : routePts());
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height);
      const bg = light ? [0.9, 0.88, 0.83] : [0.04, 0.03, 0.07]; gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const P = M4.persp(cam.fov, W / H, 0.1, 400), V = M4.look(cam.e, cam.t, [0, 1, 0]);
      draw(P, V, M4.id(), now); placeLabels(M4.mul(P, V));
      VN._PV = M4.mul(P, V);
    }
    vnRaf = requestAnimationFrame(frame);

    /* entrada: arrastrar, rueda, pellizco, teclado, clic en zonas */
    let drag = null, pinch = null;
    const onDown = (e) => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId }; };
    const onMove = (e) => { if (!drag || drag.id !== e.pointerId) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
      if (VN.mode === "overview") { VN.yaw -= dx * .006; VN.pitch = Math.max(.25, Math.min(1.35, VN.pitch + dy * .004)); }
      else if (VN.mode === "walk") { VN.walk.yaw -= dx * .005; VN.walk.pitch = Math.max(-.7, Math.min(.6, VN.walk.pitch - dy * .004)); } };
    const onUp = (e) => { if (drag && drag.moved < 6 && VN.mode === "overview" && VN._PV) { const r = cv.getBoundingClientRect(), nx = (e.clientX - r.left) / W * 2 - 1, ny = 1 - (e.clientY - r.top) / H * 2, inv = M4.inv(VN._PV);
        const a = M4.xf(inv, [nx, ny, -1, 1]), b = M4.xf(inv, [nx, ny, 1, 1]); const p0 = a.slice(0, 3).map(v => v / a[3]), p1 = b.slice(0, 3).map(v => v / b[3]); const k = (0.12 - p0[1]) / (p1[1] - p0[1]);
        if (k > 0) { const x = p0[0] + (p1[0] - p0[0]) * k, z = p0[2] + (p1[2] - p0[2]) * k, q = vzAt(x, z); if (q) { VN.target = q.id; syncBar(); } } } drag = null; };
    const onWheel = (e) => { if (VN.mode !== "overview") return; e.preventDefault(); VN.dist = Math.max(35, Math.min(170, VN.dist * (1 + Math.sign(e.deltaY) * .08))); };
    const onTouch = (e) => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) VN.dist = Math.max(35, Math.min(170, VN.dist * pinch / d)); pinch = d; e.preventDefault(); } else pinch = null; };
    const KM = { ArrowUp: "f", KeyW: "f", ArrowDown: "b", KeyS: "b", ArrowLeft: "l", ArrowRight: "r", KeyA: "sl", KeyD: "sr", ShiftLeft: "shift", ShiftRight: "shift" };
    const onKey = (e) => { if (VN.mode !== "walk" || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""))) return; const k = KM[e.code]; if (k) { keys[k] = e.type === "keydown"; e.preventDefault(); } if (e.type === "keydown" && e.key === "Escape") setMode("overview"); };
    cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointermove", onMove); cv.addEventListener("pointerup", onUp); cv.addEventListener("pointercancel", () => drag = null);
    cv.addEventListener("wheel", onWheel, { passive: false }); cv.addEventListener("touchmove", onTouch, { passive: false }); cv.addEventListener("touchend", () => pinch = null);
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    hud.addEventListener("pointerdown", (e) => { const b = e.target.closest("[data-vnk]"); if (b) { keys[b.dataset.vnk] = true; e.preventDefault(); } });
    const clearPad = () => { ["f", "b", "l", "r"].forEach(k => keys[k] = false); };
    hud.addEventListener("pointerup", clearPad); hud.addEventListener("pointerleave", clearPad);
    hud.addEventListener("click", (e) => { if (e.target.closest("[data-vnexit]")) setMode("overview"); });
    hud.addEventListener("change", (e) => { if (e.target.id === "vnVoice") { VN.voice = e.target.checked; if (!VN.voice) try { speechSynthesis.cancel(); } catch (er) {} } });
    const card = cv.closest(".vn");
    const onCard = (e) => { const z = e.target.closest("[data-vnz]"); if (z) { VN.target = z.dataset.vnz; syncBar(); if (!z.closest(".vn-card")) cv.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      const m = e.target.closest("[data-vnm]"); if (!m || m.disabled) return; const md = m.dataset.vnm;
      if (md === "vr" || md === "ar") { startXR(md === "vr" ? "immersive-vr" : "immersive-ar"); return; }
      setMode(VN.mode === md ? "overview" : md); };
    card.addEventListener("click", onCard);
    const evSel = $("#vnEvSel"); if (evSel) evSel.addEventListener("change", () => { VN.ev = evSel.value; vnEnsureEv(); if (myEvIds().includes(VN.ev)) { A.sel = A.sel || {}; A.sel.main = { ev: VN.ev, day: 0 }; save(); } setMode("overview"); renderTab(false); });

    /* WebXR: VR (recorrido a escala real) y AR (maqueta sobre la mesa) */
    const vrBtn = $("#vnVR"), arBtn = $("#vnAR"), note = $("#vnNote");
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported("immersive-vr").then(ok => { if (vrBtn) vrBtn.disabled = !ok; }).catch(() => { if (vrBtn) vrBtn.disabled = true; });
      navigator.xr.isSessionSupported("immersive-ar").then(ok => { if (arBtn) arBtn.disabled = !ok; }).catch(() => { if (arBtn) arBtn.disabled = true; });
    }
    async function startXR(kind) {
      if (VN.xr || !navigator.xr) return; let s;
      try { s = await navigator.xr.requestSession(kind, { optionalFeatures: ["local-floor"] }); }
      catch (e) { if (note) note.textContent = T("No se pudo abrir la sesión inmersiva en este dispositivo o en esta vista. Abre el artifact en el navegador del visor (Meta Quest) o en Chrome para Android."); return; }
      try { await gl.makeXRCompatible(); } catch (e) {}
      VN.xr = { s, kind }; cancelAnimationFrame(vnRaf);
      s.updateRenderState({ baseLayer: new XRWebGLLayer(s, gl) });
      let base, floorY = 0; try { base = await s.requestReferenceSpace("local-floor"); } catch (e) { base = await s.requestReferenceSpace("local"); floorY = kind === "immersive-vr" ? 1.6 : 0; }
      const isVR = kind === "immersive-vr"; let pos = { x: VN.you[0], z: VN.you[1] };
      const place = () => isVR ? base.getOffsetReferenceSpace(new XRRigidTransform({ x: -pos.x, y: -floorY, z: -pos.z })) : base;
      let ref = place(), xlast = performance.now(), wp = 0;
      const tgt = () => VN.target && VZ.find(q => q.id === VN.target);
      s.addEventListener("select", () => {
        if (!isVR) { VN.arRot += Math.PI / 4; return; }
        // teletransporte al siguiente punto de la ruta (o a la siguiente zona)
        let q = tgt(); if (!q) { q = VZ[wp % 4]; wp++; VN.target = q.id; }
        const pts = vnRoute([pos.x, pos.z], q); const nx = pts.length > 1 ? pts[1] : vzCenter(q); pos = { x: nx[0], z: nx[1] }; ref = place();
        if (Math.hypot(pos.x - vzCenter(q)[0], pos.z - vzCenter(q)[1]) < 1) { VN.you = vzCenter(q).slice(); VN.target = null; }
      });
      s.addEventListener("end", () => { VN.xr = null; if (note) note.textContent = T("VR y AR se activan en un visor WebXR (Meta Quest) o en Chrome para Android."); last = performance.now(); vnRaf = requestAnimationFrame(frame); syncBar(); });
      const onXR = (now, fr) => {
        if (!VN.xr) return; s.requestAnimationFrame(onXR);
        const dt = Math.min(.05, (now - xlast) / 1000); xlast = now; dashT += dt * 1.6; stepPeople(dt);
        const pose = fr.getViewerPose(ref); if (!pose) return;
        // locomoción suave con el joystick (VR)
        if (isVR) for (const src of s.inputSources) { const gp = src.gamepad; if (!gp || gp.axes.length < 4) continue; const ax = gp.axes[2], ay = gp.axes[3]; if (Math.abs(ax) + Math.abs(ay) < .15) continue;
          const o = pose.transform.orientation; let fx = -2 * (o.x * o.z + o.w * o.y), fz = -(1 - 2 * (o.x * o.x + o.y * o.y)); const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl; const sp = 2.4 * dt, mv = -ay, st = ax;
          pos.x += (fx * mv - fz * st) * sp; pos.z += (fz * mv + fx * st) * sp; vnClamp(pos); ref = place(); }
        if (isVR) { const p = pose.transform.position; VN.walk.x = p.x; VN.walk.z = p.z; }
        buildRoute(isVR ? (tgt() ? vnRoute([pos.x, pos.z], tgt()) : null) : (tgt() ? vnRoute(VN.you, tgt()) : null));
        const layer = s.renderState.baseLayer; gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        if (isVR) { const bg = light ? [0.9, 0.88, 0.83] : [0.04, 0.03, 0.07]; gl.clearColor(bg[0], bg[1], bg[2], 1); } else gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const Wm = isVR ? M4.id() : M4.mul(M4.tr(0, -0.45, -1.15), M4.mul(M4.ry(VN.arRot), M4.sc(1 / 55, 1 / 55, 1 / 55)));
        for (const v of pose.views) { const vp = layer.getViewport(v); gl.viewport(vp.x, vp.y, vp.width, vp.height); draw(Array.from(v.projectionMatrix), Array.from(v.transform.inverse.matrix), Wm, now); }
      };
      s.requestAnimationFrame(onXR);
    }

    vnStopFn = () => { alive = false; cancelAnimationFrame(vnRaf); ro.disconnect(); window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); try { speechSynthesis.cancel(); } catch (e) {} if (VN.xr) { try { VN.xr.s.end(); } catch (e) {} } vnStopFn = null; };
    syncBar(); setMode(VN.mode === "walk" || VN.mode === "hf" || VN.mode === "tour" ? "overview" : VN.mode);
  }

  /* ---- 06 · Mi red: grafo + credencial QR + matches sugeridos ---- */
  function redCredHTML() {
    const p = PERSONAS[A.ind], d = IND[A.ind], left = 30 - Math.floor(Date.now() / 1000) % 30, n = (A.qrConn || []).length;
    return `<article class="pcard red-cred" id="qrCard">
      <span class="red-cred-k">Mi credencial QR</span>
      <div class="red-qr"><div id="myQr">${qrSVG(p.name + "|" + qrEpochNow(), "me")}</div><span class="qr-scanline" aria-hidden="true"></span></div>
      <div class="red-cred-n">${esc(p.name)}</div>
      <div class="red-cred-r">${esc(d.role)}${p.company ? " · " + esc(p.company) : ""}</div>
      <p class="red-cred-s">Muéstrala para que te escaneen. Es firmada y se renueva en <b class="tabular" id="qrLeft">${left}</b> s.</p>
      <div class="red-cred-f"><span class="mono tabular">${n} por QR</span>${act("qrscan", "", `${svg("spark")}Simular escaneo`, "btn btn-ghost btn-sm")}</div>
    </article>`;
  }
  function redChipsHTML() {
    const d = IND[A.ind];
    const pend = d.matches.filter(m => !isConn(m[1])); if (!pend.length) return "";
    return `<div class="red-chips" aria-label="Accesos rápidos a tus matches">${pend.map(m => act("person", m[1], esc(m[1]), "red-chip")).join("")}</div>`;
  }
  function redMatchesHTML() {
    const d = IND[A.ind], pend = d.matches.filter(m => !isConn(m[1]));
    return `<section class="red-sec" id="matchesCard" aria-labelledby="redMatchT">
      <div class="red-sec-h"><h2 id="redMatchT" class="red-k">Matches sugeridos</h2><span class="red-link" style="border:0">Calculados con tu rol, industria, intereses y agenda</span></div>
      ${pend.length ? `<div class="red-mgrid">${pend.map(([ini, n, r, sc, why]) => { const i = d.matches.findIndex(m => m[1] === n); return `<article class="rm">
        <div class="rm-top"><div class="avatar rm-av" style="background:${avatarBg(i)}">${ini}</div><div class="min-w-0 flex-1"><div class="rm-name">${n}</div><div class="rm-role">${r}</div></div><div class="rm-aff"><b class="tabular">${sc}%</b><span>Afinidad</span></div></div>
        <p class="rm-why">${why}</p>
        <div class="mcard-actions">${matchActions(n)}${act("person", n, "Detalle", "btn btn-ghost btn-sm")}</div>
      </article>`; }).join("")}</div>` : `<div class="conn-empty">${svg("check")}<div><b>Ya conectaste con todos tus matches sugeridos</b><p class="text-mute text-[14px]">Te avisaremos cuando la IA encuentre a alguien nuevo con alta afinidad. Mientras tanto, puedes escanear credenciales para sumar contactos.</p></div></div>`}
    </section>`;
  }
  function qrCardHTML() {
    const p = PERSONAS[A.ind], d = IND[A.ind], list = (A.qrConn || []).slice(-3).reverse(), left = 30 - Math.floor(Date.now() / 1000) % 30;
    const shares = ["Nombre", "Rol"].concat(A.scopes.industry ? ["Industria"] : [], A.scopes.interests ? ["Intereses"] : []);
    return `<article class="pcard qr-card" id="qrCard">
      <header class="pcard-h"><div><span class="pcard-k">Conexión en un toque</span><h2 class="pcard-t">Mi QR de Conexión Rápida</h2></div><span class="chip chip-cyan tabular">${svg("qr")}${(A.qrConn || []).length} por QR</span></header>
      <p class="text-mute text-[14px]" style="margin-top:-6px">Muestra este código para que otros asistentes te escaneen, conecten al instante, intercambien contexto y sumen XP.</p>
      ${qrOpen ? `<div class="qr-wrap">
        <figure class="qr-side">
          <div class="qr-frame"><div id="myQr">${qrSVG(p.name + "|" + qrEpochNow(), "me")}</div><span class="qr-scanline" aria-hidden="true"></span></div>
          <figcaption class="qr-cap">${svg("qr")}Escanéame para conectar</figcaption>
        </figure>
        <div class="qr-info">
          <div class="qr-me">${meAvatar(48)}<div class="min-w-0"><b>${esc(p.name)}</b><span>${esc(d.role)}${p.company ? " · " + esc(p.company) : ""}</span></div></div>
          <div class="qr-tok">
            <div class="qr-tok-row"><span class="qr-tok-id mono" id="qrTok2">${qrToken()}</span><span class="qr-renew">${svg("clock")}Se renueva en <b class="tabular" id="qrLeft">${left}</b> s</span></div>
            <span class="qr-tok-note">El código cambia cada 30 s para que nadie reutilice una captura.</span>
          </div>
          <div class="qr-shares"><div class="av-lbl">Al escanearte, la otra persona recibe</div>
            <ul class="qr-share-list">${shares.map(x => `<li>${svg("check")}<span>${x}</span></li>`).join("")}</ul>
          </div>
        </div>
      </div>` : ""}
      <div class="flex flex-wrap gap-2">${act("qrtoggle", "", `${svg("qr")}${qrOpen ? "Ocultar mi QR" : "Mostrar mi QR"}`, "btn btn-primary btn-sm")}${act("qrscan", "", `${svg("spark")}Simular escaneo de QR`, "btn btn-ghost btn-sm")}</div>
      ${list.length ? `<div class="grid gap-2"><div class="av-lbl" style="margin:0">Conexiones recientes por QR</div>${list.map(c => `<button type="button" class="qr-recent" data-act="chat" data-v="${esc(c.name)}"><span class="avatar" style="width:32px;height:32px;font-size:11px;background:linear-gradient(135deg,#2F55E0,#7500C0)">${initialsOf(c.name)}</span><span class="min-w-0"><b>${esc(c.name)}</b><span class="block text-[12px] text-mute">${esc(c.role)} · ${esc(c.hora)} · ${esc(c.lugar)}</span></span>${svg("msg")}</button>`).join("")}</div>` : ""}
    </article>`;
  }
  function startQrTimer() {
    clearInterval(qrTimer); qrEpoch = qrEpochNow();
    qrTimer = setInterval(() => {
      const el = $("#myQr"); if (!el) { clearInterval(qrTimer); return; }
      const l = $("#qrLeft"); if (l) l.textContent = 30 - Math.floor(Date.now() / 1000) % 30;
      if (qrEpochNow() !== qrEpoch) { qrEpoch = qrEpochNow(); el.innerHTML = qrSVG(PERSONAS[A.ind].name + "|" + qrEpoch, "me"); const t = $("#qrTok2"); if (t) t.textContent = qrToken(); }
    }, 1000);
  }
  async function simulateScan() {
    const my = ++scanRun, p = PERSONAS[A.ind], used = (A.qrConn || []).map(x => x.name).concat(A.connections);
    const pool = SUMMIT_POOL.filter(([n]) => !used.includes(n));
    const body = $("#qsBody");
    if (!pool.length) { body.innerHTML = `<div class="mh"><h3 id="qsTitle" class="font-display font-bold text-xl">Ya conectaste con todos</h3><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div><p class="text-mute">En esta demo no quedan más asistentes por escanear tu QR.</p>`; if ($("#m-qrscan").hidden) openModal("qrscan"); return; }
    const [n, role] = pool[Math.floor(Math.random() * pool.length)], now = new Date();
    const shared = p.interests.slice(0, Math.random() < .5 ? 1 : 2);
    scanCur = { name: n, role, lugar: QR_PLACES[Math.floor(Math.random() * QR_PLACES.length)], hora: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), fecha: now.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }), at: now.getTime(), interests: shared };
    body.innerHTML = `
      <div class="mh"><div><span class="chip chip-cyan">${svg("qr")}Simulación en vivo</span><h3 id="qsTitle" class="font-display font-bold text-xl" style="margin-top:10px">Escaneando tu QR…</h3></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <div class="qs-scan"><div class="qs-phone"><div class="qs-cam">${qrSVG(p.name + "|" + qrEpochNow(), "scan")}<span class="qs-beam"></span><span class="ar-corner tl"></span><span class="ar-corner tr"></span><span class="ar-corner bl"></span><span class="ar-corner br"></span></div></div>
        <p class="text-[14px] text-mute" style="text-align:center"><b class="text-ink">${esc(n)}</b> está escaneando tu código desde su app KNET.</p></div>`;
    if ($("#m-qrscan").hidden) openModal("qrscan");
    await sleep(1800); if (my !== scanRun || $("#m-qrscan").hidden) return;
    const c = scanCur;
    body.innerHTML = `
      <div class="mh"><div><span class="chip chip-accent"><span class="pend-dot"></span>Nueva solicitud de conexión</span><h3 id="qsTitle" class="font-display font-bold text-xl" style="margin-top:10px">${esc(first(n))} quiere conectar contigo</h3></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <div class="qs-req reveal-in">
        <div class="flex items-center gap-3"><span class="avatar" style="width:52px;height:52px;font-size:17px;background:linear-gradient(135deg,#2F55E0,#7500C0)">${initialsOf(n)}</span><div class="min-w-0"><div class="font-display font-bold text-[18px]">${esc(n)}</div><div class="text-[13px] text-mute">${esc(role)}</div></div></div>
        <div class="qs-log">
          <div><span>Hora</span><b class="tabular">${c.hora}</b></div>
          <div><span>Lugar</span><b>${esc(c.lugar)}</b></div>
          <div><span>Método</span><b>QR dinámico de KNET</b></div>
        </div>
        <div><div class="av-lbl" style="margin-bottom:6px">Contexto que intercambian</div><div class="flex flex-wrap gap-1.5">${shared.map(x => `<span class="chip chip-accent">${svg("check")}${esc(x)}</span>`).join("")}<span class="chip">${svg("users")}Perfil profesional</span></div></div>
      </div>
      <div class="av-foot"><button type="button" class="btn btn-ghost btn-sm" data-qs="decline">${svg("x")}Rechazar</button><button type="button" class="btn btn-emerald" data-qs="accept">${svg("check")}Aceptar conexión · +100 XP</button></div>`;
    const acc = $('[data-qs="accept"]'); if (acc) acc.focus();
  }
  function acceptScan() {
    const c = scanCur; if (!c) return; scanCur = null;
    award(() => { (A.qrConn = A.qrConn || []).push(c); if (!A.connections.includes(c.name)) A.connections.push(c.name); }, CONN_XP, `Conexión por QR con ${c.name}`, "qr", "conn");
    apiRun({ t: "conn", id: c.name, state: "accepted", source: "qr", context: (c.interests || []).join(", ").slice(0, 280) });
    $("#qsBody").innerHTML = `
      <div class="mh"><div><span class="chip chip-emerald">${svg("check")}Conexión registrada</span><h3 id="qsTitle" class="font-display font-bold text-xl" style="margin-top:10px">¡Conexión lista con ${esc(first(c.name))}!</h3></div><button class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>
      <div class="qs-done reveal-in">
        <div class="qs-xp"><span class="qs-xp-n tabular" id="qsXp">+0</span><span class="mono text-[12px]">XP SUMADOS AUTOMÁTICAMENTE</span></div>
        <div class="qs-log">
          <div><span>Con</span><b>${esc(c.name)} · ${esc(c.role)}</b></div>
          <div><span>Hora</span><b class="tabular">${c.hora} · ${esc(c.fecha)}</b></div>
          <div><span>Lugar</span><b>${esc(c.lugar)}</b></div>
          <div><span>Guardado en</span><b>Tu Dossier · sección Conexión</b></div>
        </div>
      </div>
      <div class="av-foot"><button type="button" class="btn btn-ghost btn-sm" data-qs="again">${svg("qr")}Simular otro escaneo</button><button type="button" class="btn btn-primary btn-sm" data-qs="chat" data-v="${esc(c.name)}">${svg("msg")}Chatear con ${esc(first(c.name))}</button></div>`;
    const el = $("#qsXp"), t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 900); if (!el.isConnected) return; el.textContent = "+" + Math.round(100 * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(reduce ? () => { el.textContent = "+100"; } : step);
  }
  $("#m-qrscan").addEventListener("click", (e) => {
    const b = e.target.closest("[data-qs]"); if (!b) return;
    if (b.dataset.qs === "accept") acceptScan();
    if (b.dataset.qs === "decline") { const n = scanCur && scanCur.name; scanCur = null; closeModal($("#m-qrscan")); toast(`<b>Solicitud rechazada</b>${n ? `<div class="text-[13px] text-mute">${esc(n)} no verá tus datos.</div>` : ""}`, "x"); }
    if (b.dataset.qs === "again") simulateScan();
    if (b.dataset.qs === "chat") { closeModal($("#m-qrscan")); openChat(b.dataset.v); }
  });

  /* ---- Render + routing ---- */
  const VIEWS = {
    perfil: () => { const P = perfilParts(); return `<div class="app-grid-2"><div class="stack">${P.data}</div><div class="stack">${permisosHTML()}</div></div>`; },
    quests: tabQuests,
    miseventos: () => `<div class="me-seg" role="tablist" aria-label="Vista de Mis eventos"><button type="button" role="tab" class="me-seg-b" data-meview="mine" aria-selected="${meView === "mine"}">${svg("calendar")}Mis inscripciones y meetups</button><button type="button" role="tab" class="me-seg-b" data-meview="venue" aria-selected="${meView === "venue"}">${svg("layers")}Recinto</button><button type="button" role="tab" class="me-seg-b" data-meview="explore" aria-selected="${meView === "explore"}">${svg("map")}Explorar próximos eventos</button></div>${meView === "explore" ? tabEventos() : meView === "venue" ? `${myEvIds().length ? evDayBar("main") : ""}${venueHTML()}` : tabMisEventos()}`,
    agenda: () => `<div class="stack">${agendaHTML()}</div>`,
    concierge: tabConcierge,
    red: () => { const P = perfilParts(); return `<div class="stack red-view"><div class="red-grid"><div class="stack">${P.net}${redChipsHTML()}</div><div class="stack">${redCredHTML()}${connsInlineHTML()}</div></div>${redMatchesHTML()}</div>`; },
    recompensas: () => `<div class="stack">${rewardsHTML(true)}</div>`,
    resumen: tabDossier
  };
  let meView = "mine";
  panel.addEventListener("click", (e) => { const b = e.target.closest("[data-meview]"); if (b && meView !== b.dataset.meview) { meView = b.dataset.meview; renderTab(true); } });
  function renderTab(animate) {
    cancelAnimationFrame(graphRaf);
    panel.innerHTML = `<div class="${animate ? "reveal-in" : ""}">${tabHead(curTab)}${VIEWS[curTab]()}</div>`;
    const log = $("#chatLog"); if (log) log.scrollTop = log.scrollHeight;
    if ($("#netGraph")) startGraph();
    if ($("#venueCanvas")) startVenue(); else if (vnStopFn) vnStopFn();
    if ($("#myQr")) startQrTimer(); else clearInterval(qrTimer);
  }
  function refresh() { renderHeader(); if (inApp) { const y = window.scrollY; renderBanner(); renderTabs(); if (!(curTab === "miseventos" && meView === "venue" && (VN.xr || VN.mode !== "overview"))) renderTab(false); window.scrollTo(0, y); } if (!$("#m-res").hidden) renderRes(); if (!$("#m-perm").hidden) renderPerm(); }
  /* Navegación por estado (no depende de eventos de hash del visor) */
  const setHash = (h) => { try { history.replaceState(null, "", "#" + h); } catch (e) {} };
  function applyView() {
    document.body.classList.toggle("is-app", inApp);
    landingView.hidden = inApp; appView.hidden = !inApp;
    $("#mobileMenu").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false");
    if (!inApp) $("#secBtn").hidden = true;
    renderHeader();
  }
  function showTab(tab, target) {
    setTimeout(() => typeof scheduleResponses === "function" && scheduleResponses(), 0);
    if (tab === "dossier") tab = "resumen";
    if (tab === "eventos") { tab = "miseventos"; meView = "explore"; }
    if (tab === "recinto") { tab = "miseventos"; meView = "venue"; }
    if (tab === "perfil" && target === "agendaCard") tab = "agenda";
    if (tab === "perfil" && (target === "networkCard" || target === "qrCard")) tab = "red";
    if (target === "matchesCard") tab = "red";
    if (!TAB_IDS.includes(tab)) tab = "perfil";
    if (!A.connected) { if (hasSaved()) resumeSession(tab); else startConnect(); return; }
    const was = inApp, changed = curTab !== tab || !was;
    inApp = true; curTab = tab; applyView(); setHash(tab);
    renderBanner(); renderTabs(); renderTab(changed);
    const el = target && document.getElementById(target);
    requestAnimationFrame(() => {
      if (el) { scrollToEl(el); flash(el); return; }
      if (!was) { window.scrollTo(0, 0); return; }
      const top = panel.getBoundingClientRect().top + window.scrollY - offsetTop();
      if (window.scrollY > top || !isDesk()) window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---- Tour guiado por las funciones de KNET ---- */
  
  let tourI = -1, tourEl = null;
  function tourTarget(id) {
    if (isDesk()) return document.querySelector(`#appTabs .app-tab[data-tab="${id}"]`);
    return document.getElementById("appPanel");
  }
  function tourPlace() {
    if (!tourEl || tourI < 0) return;
    const spot = tourEl.querySelector(".tour-spot"), card = tourEl.querySelector(".tour-card");
    const step = tourI >= 1 && tourI <= TOUR.length ? TOUR[tourI - 1] : null, tg = step && tourTarget(step[0]);
    if (!tg) { spot.style.opacity = "0"; card.classList.add("is-center"); card.style.left = card.style.top = ""; return; }
    const r = tg.getBoundingClientRect(), pad = 6, desk = isDesk();
    const top = desk ? r.top : Math.max(r.top, 70), h = desk ? r.height : Math.min(r.height, window.innerHeight * .42);
    spot.style.opacity = "1"; Object.assign(spot.style, { left: (r.left - pad) + "px", top: (top - pad) + "px", width: (r.width + pad * 2) + "px", height: (h + pad * 2) + "px" });
    card.classList.remove("is-center");
    if (desk) { const cw = card.offsetWidth, ch = card.offsetHeight; card.style.left = Math.min(window.innerWidth - cw - 16, r.right + 22) + "px"; card.style.top = Math.max(16, Math.min(window.innerHeight - ch - 16, r.top + r.height / 2 - ch / 2)) + "px"; }
    else { card.style.left = ""; card.style.top = ""; }
  }
  function tourRender() {
    const total = TOUR.length, p = PERSONAS[A.ind] || {}, name = A.profile && A.profile.name ? first(A.profile.name) : first(p.name || "");
    const card = tourEl.querySelector(".tour-card"); let html;
    if (tourI === 0) html = `<span class="tour-k">${svg("compass")}Tour guiado · 1 minuto</span><h3>Hola${name ? ", " + esc(name) : ""}. Te muestro KNET</h3><p>Un recorrido rápido por las 8 secciones de tu panel para que sepas dónde está cada cosa.</p>
      <div class="tour-actions"><button type="button" class="btn btn-ghost btn-sm" data-tour="skip">Ahora no</button><button type="button" class="btn btn-primary btn-sm" data-tour="next">Empezar tour${svg("arrow")}</button></div>`;
    else if (tourI > total) html = `<span class="tour-k">${svg("check")}Tour completo</span><h3>¡Listo! Ya conoces KNET</h3><p>Puedes repetir este recorrido cuando quieras con el botón «Tour guiado por KNET» del menú.</p>
      <div class="tour-actions"><button type="button" class="btn btn-primary btn-sm" data-tour="end">Empezar a usar KNET</button></div>`;
    else { const [id, txt] = TOUR[tourI - 1], T = TABS.find(x => x[0] === id);
      html = `<span class="tour-k">${svg(T[3])}Paso ${tourI} de ${total}</span><h3>${esc(t(T[2]))}</h3><p>${txt}</p>
      <div class="tour-dots" aria-hidden="true">${TOUR.map((_, i) => `<i class="${i === tourI - 1 ? "on" : i < tourI - 1 ? "past" : ""}"></i>`).join("")}</div>
      <div class="tour-actions"><button type="button" class="btn btn-ghost btn-sm" data-tour="skip">Saltar</button><span class="tour-sp"></span>${tourI > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-tour="prev">Anterior</button>` : ""}<button type="button" class="btn btn-primary btn-sm" data-tour="next">${tourI === total ? "Terminar" : "Siguiente"}${svg("arrow")}</button></div>`; }
    card.innerHTML = html;
    if (window.KNET_I18N && document.documentElement.lang === "en") window.KNET_I18N.apply("en");
    requestAnimationFrame(() => { tourPlace(); const b = card.querySelector('[data-tour="next"],[data-tour="end"]'); if (b) b.focus({ preventScroll: true }); });
  }
  function tourGo(i) {
    tourI = i;
    if (i >= 1 && i <= TOUR.length) { showTab(TOUR[i - 1][0]); setTimeout(tourPlace, 120); setTimeout(tourPlace, 450); }
    tourRender();
  }
  function tourClose() { if (!tourEl) return; A.tourSeen = true; save(); tourEl.remove(); tourEl = null; tourI = -1; document.removeEventListener("keydown", tourKey, true); window.removeEventListener("resize", tourPlace); window.removeEventListener("scroll", tourPlace, true); const b = document.getElementById("tourBtn"); if (b) b.focus({ preventScroll: true }); }
  function tourKey(e) { if (!tourEl) return; if (e.key === "Escape") { e.preventDefault(); tourClose(); } else if (e.key === "ArrowRight" && tourI <= TOUR.length) { e.preventDefault(); tourGo(tourI + 1); } else if (e.key === "ArrowLeft" && tourI > 1 && tourI <= TOUR.length) { e.preventDefault(); tourGo(tourI - 1); } }
  function startTour(fromStart) {
    if (!A.connected) return; if (tourEl) tourClose();
    tourEl = document.createElement("div"); tourEl.className = "tour"; tourEl.setAttribute("role", "dialog"); tourEl.setAttribute("aria-modal", "true"); tourEl.setAttribute("aria-label", "Tour guiado por KNET");
    tourEl.innerHTML = `<div class="tour-dim"></div><div class="tour-spot" aria-hidden="true"></div><div class="tour-card is-center" aria-live="polite"></div>`;
    document.body.appendChild(tourEl);
    tourEl.addEventListener("click", (e) => { const b = e.target.closest("[data-tour]"); if (!b) return; const a = b.dataset.tour;
      if (a === "next") tourGo(tourI + 1); else if (a === "prev") tourGo(tourI - 1); else if (a === "end") { tourClose(); showTab("perfil"); } else tourClose(); });
    document.addEventListener("keydown", tourKey, true); window.addEventListener("resize", tourPlace); window.addEventListener("scroll", tourPlace, true);
    tourGo(fromStart ? 1 : 0);
  }
  function offerTourWhenIdle() { let n = 0; const tick = () => { if (A.tourSeen || tourEl || ++n > 120) return; const open = document.querySelector(".modal:not([hidden])"); if (inApp && !open) { setTimeout(() => { if (!document.querySelector(".modal:not([hidden])") && !tourEl && !A.tourSeen) startTour(false); else setTimeout(tick, 700); }, 600); return; } setTimeout(tick, 700); }; setTimeout(tick, 1500); }
  document.getElementById("tourBtn").addEventListener("click", () => startTour(false));
  function showLanding(anchor) {
    const was = inApp; inApp = false; applyView(); setHash(anchor || "top");
    if (!was) return;
    const el = anchor && anchor !== "top" && document.getElementById(anchor);
    requestAnimationFrame(() => { if (el) el.scrollIntoView(); else window.scrollTo(0, 0); });
  }
  function route() {
    const h = location.hash.slice(1);
    if (TAB_IDS.includes(h)) { if (A.connected) { if (!inApp || h !== curTab) showTab(h); } else if (hasSaved()) { resumeSession(h); } else { showLanding(); startConnect(); } }
    else if (inApp) showLanding(h);
    else renderHeader();
  }
  $("#appTabs").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) { setSideMenu(false); showTab(b.dataset.tab); } });
  function setSideMenu(open) { const sd = $("#appSide"), tg = $("#sideToggle"); if (!sd || !tg) return; sd.classList.toggle("menu-open", open); tg.setAttribute("aria-expanded", String(open)); }
  $("#sideToggle").addEventListener("click", () => setSideMenu(!$("#appSide").classList.contains("menu-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#appSide").classList.contains("menu-open")) { setSideMenu(false); $("#sideToggle").focus(); } });
  document.addEventListener("click", (e) => { if ($("#appSide").classList.contains("menu-open") && !e.target.closest("#appSide")) setSideMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 639) setSideMenu(false); });
  $("#appTabs").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const list = $$("#appTabs [data-tab]"), i = list.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); const nx = list[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]; nx.focus();
  });
  $("#userChip").addEventListener("click", (e) => { e.preventDefault(); showTab("perfil"); });
  $('#nav a[href="#top"]').addEventListener("click", (e) => { if (inApp) { e.preventDefault(); showLanding(); } });
  /* Botón flotante "Secciones" en móvil y tablet */
  const secBtn = $("#secBtn");
  const secIO = new IntersectionObserver(([en]) => { secBtn.hidden = !inApp || isDesk() || en.isIntersecting; });
  secIO.observe($("#appSide"));
  secBtn.addEventListener("click", () => { const tw = $("#appSide"); window.scrollTo({ top: Math.max(0, tw.getBoundingClientRect().top + window.scrollY - $("#nav").offsetHeight - 8), behavior: reduce ? "auto" : "smooth" }); setTimeout(() => { const c = $('#appTabs [aria-current="page"]'); if (c) c.focus({ preventScroll: true }); }, reduce ? 0 : 400); });
  /* Altura real del header para posicionar elementos sticky */
  /* =================== CENTRO DE NOTIFICACIONES =================== */
  
  const notifBtn = $("#notifBtn"), notifPanel = $("#notifPanel");
  function notify(type, title, sub) {
    A.notifs = [{ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type, title, sub, at: Date.now(), read: false }].concat(A.notifs || []).slice(0, 40);
    save(); renderNotifCount(); if (!notifPanel.hidden) renderNotifPanel();
    notifBtn.classList.remove("ring-it"); void notifBtn.offsetWidth; notifBtn.classList.add("ring-it");
  }
  function scheduleSoon(key, se, ms) {
    A.notifDue = (A.notifDue || []).filter(d => d.key !== key).concat({ key, due: Date.now() + ms, title: `“${se[2]}” comienza en 10 minutos`, sub: `${se[3]} · ${se[1]} · ${se[0]}` });
  }
  const agoTxt = (t) => { const m = Math.floor((Date.now() - t) / 60000); return m < 1 ? "Ahora" : m < 60 ? `Hace ${m} min` : m < 1440 ? `Hace ${Math.floor(m / 60)} h` : `Hace ${Math.floor(m / 1440)} d`; };
  function renderNotifCount() {
    const n = (A.notifs || []).filter(x => !x.read).length, el = $("#notifCount");
    el.hidden = !n; el.textContent = n > 9 ? "9+" : n;
    notifBtn.setAttribute("aria-label", n ? `Notificaciones: ${n} sin leer` : "Notificaciones");
  }
  function renderNotifPanel() {
    const list = A.notifs || [];
    notifPanel.innerHTML = `<div class="notif-h"><b>Notificaciones</b>${list.length ? `<button type="button" class="notif-clear" data-nclear>Borrar todo</button>` : ""}</div>
      <div class="notif-list">${list.length ? list.map(x => { const T = NOTIF_T[x.type] || NOTIF_T.xp;
        return `<button type="button" class="notif-item ${x.read ? "" : "new"}" data-ngo="${T.go}" style="--c:${T.c}"><span class="notif-ic">${x.type === "level" ? lvlBadge(lvl(), 30) : svg(T.ic)}</span><span class="min-w-0"><span class="notif-t">${esc(x.title)}</span><span class="notif-s">${esc(x.sub || "")}</span><span class="notif-a">${agoTxt(x.at)}</span></span></button>`; }).join("")
        : `<div class="notif-empty">${svg("check")}<span>No tienes notificaciones todavía. Aquí verás tus XP, subidas de nivel, conexiones y recordatorios de eventos.</span></div>`}</div>`;
  }
  function openNotif() { closeLang(); renderNotifPanel(); notifPanel.hidden = false; notifBtn.setAttribute("aria-expanded", "true"); (A.notifs || []).forEach(x => x.read = true); save(); renderNotifCount(); }
  function closeNotif() { if (notifPanel.hidden) return; notifPanel.hidden = true; notifBtn.setAttribute("aria-expanded", "false"); $$(".notif-item.new").forEach(e => e.classList.remove("new")); }
  notifBtn.addEventListener("click", (e) => { e.stopPropagation(); notifPanel.hidden ? openNotif() : closeNotif(); });
  notifPanel.addEventListener("click", (e) => {
    if (e.target.closest("[data-nclear]")) { A.notifs = []; save(); renderNotifPanel(); renderNotifCount(); return; }
    const it = e.target.closest("[data-ngo]"); if (it) { closeNotif(); showTab(it.dataset.ngo); }
  });
  document.addEventListener("click", (e) => { if (!notifPanel.hidden && !e.target.closest("#notifWrap")) closeNotif(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !notifPanel.hidden) { closeNotif(); notifBtn.focus(); } });
  /* Recordatorios "a punto de comenzar": cola persistente revisada cada 5 s */
  setInterval(() => {
    if (!A.connected) return;
    if (!A.soonSeeded) { A.soonSeeded = true; const se = IND[A.ind].agenda[0]; scheduleSoon("seed", se, 45000); save(); }
    const now = Date.now(), due = (A.notifDue || []).filter(d => d.due <= now);
    if (!due.length) return;
    A.notifDue = A.notifDue.filter(d => d.due > now);
    due.forEach(d => { notify("soon", d.title, d.sub); toast(`<b>${esc(d.title)}</b><div class="text-[13px] text-mute">${esc(d.sub)}</div>`, "clock"); });
  }, 5000);

  function fitNav() {
    const row = $(".nav-row"); if (!row) return;
    const LEVELS_NAV = ["sub2", "compact", "nosub", "nobrand", "tight"];
    row.classList.remove(...LEVELS_NAV);
    const over = () => row.scrollWidth > row.clientWidth + 1;
    for (const lv of LEVELS_NAV) { if (!over()) break; row.classList.add(lv); }
    const over2 = row.classList.contains("compact");
    if (!over2 && window.matchMedia("(min-width: 1024px)").matches) { $("#mobileMenu").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }
    document.documentElement.style.setProperty("--nav-h", $("#nav").offsetHeight + "px");
  }
  const navRO = new ResizeObserver(() => fitNav());
  navRO.observe($("#nav"));

  /* =================== LEGAL: documentos, consentimientos y almacenamiento =================== */
  /* Datos del Responsable del tratamiento: complétalos antes de publicar en producción. */
  
  
  const L = (k) => String(LEGAL[k]).startsWith("[") ? `<mark class="todo" title="Dato por completar">${esc(LEGAL[k])}</mark>` : esc(LEGAL[k]);
  
  const idBlock = () => `<div class="lg-id"><div><span>Responsable</span><b>${L("responsable")}</b></div>${LEGAL.nit ? `<div><span>NIT / documento</span><b>${L("nit")}</b></div>` : ""}<div><span>Domicilio</span><b>${L("domicilio")}</b></div><div><span>Correo</span><b><a href="mailto:${esc(LEGAL.correo)}">${L("correo")}</a></b></div><div><span>Teléfono</span><b><a href="tel:${esc(LEGAL.telefono.replace(/\s/g, ""))}">${L("telefono")}</a></b></div></div>`;
  const DOCS = {
    terminos: { title: "Términos y condiciones de uso", short: "Términos", html: () => `
      <h4>1. Quiénes somos</h4>${idBlock()}
      <p>KNET (Knowledge Network &amp; Event Technology) es un prototipo funcional creado por el Equipo KNET para el Reto 03 de Accenture, «Reinventar la experiencia de un Summit». No es un producto comercial ni un servicio oficial de Accenture ni de LinkedIn. Las marcas Accenture y LinkedIn pertenecen a sus titulares y se mencionan solo para describir el reto y la integración simulada.</p>
      <h4>2. Aceptación</h4>
      <p>Para crear tu perfil debes marcar, por separado, la casilla de estos Términos y la de la Política de privacidad. Ninguna casilla viene marcada. Guardamos la fecha, la hora, el formulario y la versión de cada documento que aceptaste. Si cambiamos estos Términos de forma relevante, te pediremos aceptarlos de nuevo.</p>
      <h4>3. Edad mínima</h4>
      <p>KNET está dirigido a profesionales que asisten a eventos corporativos. Debes ser mayor de 18 años. No tratamos datos de niños, niñas ni adolescentes.</p>
      <h4>4. Tu perfil</h4>
      <p>Puedes crear tu perfil importando datos de LinkedIn, con tu permiso previo, o escribiéndolos a mano. Debes dar datos veraces. Puedes corregirlos en cualquier momento con el lápiz y borrarlos con «Revocar y borrar mis datos», en tu panel. «Cerrar sesión» solo sale de tu cuenta: tus datos quedan guardados en tu navegador.</p>
      <h4>5. Uso permitido</h4>
      <p>No uses KNET para suplantar a otras personas, enviar contenido ilegal u ofensivo, extraer datos de otros asistentes o afectar la seguridad del servicio. Podemos suspender perfiles que incumplan estas reglas.</p>
      <h4>6. Gamificación</h4>
      <p>Los puntos XP, niveles, insignias y rankings no tienen valor monetario, no son canjeables y no se pueden transferir ni reembolsar.</p>
      <h4>7. Contenido generado por inteligencia artificial</h4>
      <p>Las recomendaciones de agenda, matchmaking, resúmenes y el Dossier se generan de forma automática y pueden contener errores. Úsalos como orientación y verifica la información importante.</p>
      <h4>8. Precio</h4>
      <p>El uso de KNET es gratuito. Si en el futuro se cobra algún servicio, se informará el precio total antes de la compra y aplicará la Política de reembolsos.</p>
      <h4>9. Propiedad intelectual</h4>
      <p>El código, el diseño y los textos de KNET pertenecen al Equipo KNET. Los recursos de terceros se usan según sus licencias, detalladas en «Créditos y licencias».</p>
      <h4>10. Responsabilidad</h4>
      <p>Al ser un prototipo, KNET puede tener fallas o cambiar sin aviso. Nada en estos Términos limita los derechos que te reconoce la Ley 1480 de 2011 (Estatuto del Consumidor).</p>
      <h4>11. Peticiones, quejas y reclamos</h4>
      <p>Escríbenos a ${L("correo")}. Te enviaremos constancia de la fecha y hora de recibo. También puedes acudir a la <a href="${SIC_URL}" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>.</p>
      <h4>12. Ley aplicable</h4>
      <p>Estos Términos se rigen por las leyes de la República de Colombia.</p>` },
    privacidad: { title: "Política de tratamiento de datos personales", short: "Privacidad", html: () => `
      <p>Esta política cumple la Ley 1581 de 2012 y su reglamento (Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015).</p>
      <h4>1. Responsable del tratamiento</h4>${idBlock()}
      <h4>2. Qué datos tratamos y para qué</h4>
      <div class="lg-table-wrap"><table class="lg-table"><thead><tr><th>Dato</th><th>¿Obligatorio?</th><th>Para qué</th></tr></thead><tbody>
        <tr><td>Nombre</td><td>Sí</td><td>Identificarte ante tus matches y en tu Dossier.</td></tr>
        <tr><td>Rol o cargo</td><td>Sí</td><td>Elegir sesiones y conexiones afines.</td></tr>
        <tr><td>Industria</td><td>Sí</td><td>Armar tu agenda, misiones y matches.</td></tr>
        <tr><td>Seniority</td><td>Sí</td><td>Conectarte con personas de nivel similar.</td></tr>
        <tr><td>Intereses (1 a 5)</td><td>Sí</td><td>Calcular la afinidad con charlas, personas y eventos.</td></tr>
        <tr><td>Empresa</td><td>No</td><td>Dar contexto a tus conexiones.</td></tr>
        <tr><td>Ciudad</td><td>No</td><td>Sugerir eventos cercanos.</td></tr>
        <tr><td>Apariencia del avatar</td><td>No</td><td>Representarte en el panel y ante tus matches. El estilo que eliges es solo visual: no te preguntamos tu sexo ni tu género.</td></tr>
        <tr><td>Actividad en KNET (XP, misiones, check-ins, conexiones, mensajes al Concierge)</td><td>Se genera al usar la app</td><td>Gamificación, recomendaciones y tu Dossier.</td></tr>
        <tr><td>Registro de consentimiento (fecha, hora, formulario, versión y huella de cada documento, identificador de cuenta, navegador)</td><td>Sí</td><td>Probar que diste tu autorización, como exige el artículo 17 de la Ley 1581.</td></tr>
      </tbody></table></div>
      <p>No pedimos datos sensibles (salud, origen étnico, orientación política o sexual, creencias, datos biométricos). No escribas este tipo de datos en el chat del Concierge. No vendemos tus datos ni los usamos para publicidad.</p>
      <h4>3. Datos de LinkedIn</h4>
      <p>Solo leemos de LinkedIn los campos que tú marques en la pantalla de permiso, y solo después de que aceptes. Lo que no autorices lo puedes escribir a mano. En esta versión del prototipo la conexión con LinkedIn es una simulación: no se accede a ninguna cuenta real.</p>
      <h4>4. Autorización</h4>
      <p>Tratamos tus datos con tu autorización previa, expresa e informada, que das marcando la casilla de esta política. Puedes revocarla en cualquier momento con «Revocar y borrar mis datos», en tu panel, o escribiendo a ${L("correo")}.</p>
      <h4>5. Dónde se guardan</h4>
      <p>Tu perfil y tu progreso se guardan en el almacenamiento de tu propio navegador y, cuando la app está conectada al servidor de KNET, también en su base de datos. El registro de consentimientos se guarda en la base de datos PostgreSQL de KNET, administrada por el Responsable del tratamiento, y tu navegador conserva una copia. Si el servidor no está disponible, el registro queda en tu navegador y se envía al servidor cuando se restablece la conexión. Las fuentes tipográficas (Google Fonts) y la hoja de estilos (Tailwind CSS) se descargan de servidores de terceros, que reciben tu dirección IP.</p>
      <h4>6. Cuánto tiempo</h4>
      <p>Tu perfil y tu progreso: hasta que pulses «Revocar y borrar mis datos» o borres los datos de tu navegador. Cerrar sesión no los borra. El registro de consentimientos: ${L("retencionRegistro")}, para poder atender requerimientos de la Superintendencia de Industria y Comercio.</p>
      <h4>7. Tus derechos</h4>
      <p>Como titular puedes: conocer, actualizar y rectificar tus datos; pedir prueba de tu autorización; saber qué uso les hemos dado; revocar la autorización o pedir que se supriman; acceder a ellos gratis; y presentar quejas ante la SIC.</p>
      <h4>8. Cómo ejercerlos</h4>
      <p>Escribe a ${L("correo")} indicando tu nombre, lo que solicitas y cómo contactarte.</p>
      <ul><li><b>Consultas:</b> respondemos en máximo 10 días hábiles, prorrogables 5 días hábiles más avisándote el motivo.</li>
        <li><b>Reclamos</b> (corrección, actualización, supresión o incumplimiento): respondemos en máximo 15 días hábiles, prorrogables 8 días hábiles más. Si falta información, te la pediremos en los 5 días siguientes; si no la envías en 2 meses, entenderemos que desististe.</li>
        <li>Antes de acudir a la SIC debes haber agotado este trámite con nosotros.</li></ul>
      <p>Dentro de la app puedes ver tus datos, corregirlos con el lápiz, revisar tus aceptaciones y revocar permisos.</p>
      <h4>9. Seguridad</h4>
      <p>Aplicamos medidas razonables: guardamos solo lo necesario, la base de datos solo permite agregar registros de consentimiento (no modificarlos ni borrarlos) y cada evento lleva una huella SHA-256 encadenada que permite detectar alteraciones.</p>
      <h4>10. Cambios y vigencia</h4>
      <p>Si cambiamos esta política de forma sustancial te avisaremos y te pediremos aceptarla de nuevo.</p>` },
    cookies: { title: "Política de cookies y almacenamiento local", short: "Cookies", html: () => `
      <h4>1. ¿KNET usa cookies?</h4>
      <p>No. KNET no instala cookies propias ni de terceros para analítica, rastreo o publicidad.</p>
      <h4>2. Qué guardamos en tu navegador</h4>
      <div class="lg-table-wrap"><table class="lg-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Para qué</th><th>Duración</th></tr></thead><tbody>
        <tr><td><code>knet-demo-v1</code></td><td>Necesario</td><td>Tu perfil y tu progreso, para que la app funcione y los recuperes al volver a entrar.</td><td>Hasta que pulses «Revocar y borrar mis datos»</td></tr>
        <tr><td><code>knet-consent-local</code></td><td>Necesario</td><td>Copia de tus aceptaciones, para que puedas consultarlas.</td><td>Hasta que borres los datos del navegador</td></tr>
        <tr><td><code>knet-storage-pref</code></td><td>Necesario</td><td>Recordar tu elección en el aviso de almacenamiento.</td><td>Hasta que la cambies</td></tr>
        <tr><td><code>knet-lang</code></td><td>Preferencia (opcional)</td><td>Recordar tu idioma entre visitas.</td><td>Hasta que lo rechaces o borres los datos</td></tr>
<tr><td><code>knet-theme</code></td><td>Preferencia (opcional)</td><td>Recordar si usas el modo claro u oscuro.</td><td>Hasta que lo rechaces o borres los datos</td></tr>
      </tbody></table></div>
      <h4>3. Recursos de terceros</h4>
      <p>Para mostrar la página se descargan fuentes de Google Fonts y estilos de Tailwind CSS. Esos servidores reciben tu dirección IP. La plataforma claude.ai, donde se publica KNET, puede usar sus propias cookies de sesión según su propia política.</p>
      <h4>4. ¿Necesitamos tu consentimiento?</h4>
      <p>En Colombia no existe una ley específica de cookies: cuando una cookie o un almacenamiento recoge datos personales se aplica la Ley 1581 de 2012, que exige autorización previa. Por eso: lo necesario para que la app funcione se usa solo cuando tú creas tu perfil, ya con tu autorización; las preferencias (idioma) solo se guardan si las aceptas en el aviso. Puedes cambiar tu elección en «Configurar almacenamiento», al final de la página.</p>` },
    reembolsos: { title: "Política de reembolsos", short: "Reembolsos", html: () => `
      <h4>1. Situación actual</h4>
      <p>KNET es gratuito: hoy no cobramos ningún valor, así que no hay pagos que reembolsar. Los XP, niveles e insignias no tienen valor monetario y no son reembolsables.</p>
      <h4>2. Si en el futuro vendemos entradas o servicios en línea</h4>
      <ul>
        <li><b>Derecho de retracto:</b> podrás retractarte dentro de los 5 días hábiles siguientes a la compra, siempre que el servicio o el evento no haya comenzado con tu consentimiento (artículo 47 de la Ley 1480 de 2011). Te devolveremos todo lo pagado, sin descuentos ni retenciones, en máximo 30 días calendario.</li>
        <li><b>Cancelación o cambio de fecha por nuestra parte:</b> podrás pedir la devolución total de lo pagado.</li>
        <li><b>Reversión del pago:</b> si pagaste con tarjeta u otro medio electrónico y hubo fraude, una operación no solicitada o el servicio no corresponde a lo comprado, puedes pedir la reversión dentro de los 5 días hábiles siguientes a conocer el hecho, avisándonos a nosotros y al emisor del medio de pago (artículo 51 de la Ley 1480 de 2011).</li>
        <li>Antes de pagar te mostraremos el precio total con impuestos, los medios de pago y el procedimiento de retracto.</li>
      </ul>
      <h4>3. Cómo pedir un reembolso</h4>
      <p>Escribe a ${L("correo")} con tu nombre, la fecha de compra y el motivo. Te enviaremos constancia de la fecha y hora de recibo. También puedes acudir a la <a href="${SIC_URL}" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>.</p>` },
    creditos: { title: "Créditos y licencias de recursos", short: "Créditos", html: () => `
      <div class="lg-table-wrap"><table class="lg-table"><thead><tr><th>Recurso</th><th>Dónde se usa</th><th>Origen y licencia</th></tr></thead><tbody>
        <tr><td>Logo de KNET</td><td>Header y llamado final</td><td>Aportado por el Equipo KNET. Sus derechos son del equipo o de quien lo creó.</td></tr>
        <tr><td>Avatares, mapa de Colombia, radar de proximidad, grafo, códigos QR</td><td>Panel y landing</td><td>Generados por el propio código de la página. No usan imágenes de terceros.</td></tr>
        <tr><td>Iconos de línea</td><td>Toda la página</td><td>Dibujados en SVG dentro del código; varios siguen el diseño de Lucide (licencia ISC) y Feather (licencia MIT). © Lucide Contributors y © Cole Bemis.</td></tr>
        <tr><td>Fuentes Plus Jakarta Sans, Inter y JetBrains Mono</td><td>Textos</td><td>Google Fonts, SIL Open Font License 1.1.</td></tr>
        <tr><td>Tailwind CSS</td><td>Estilos</td><td>Licencia MIT, © Tailwind Labs.</td></tr>
        <tr><td>Marcas Accenture, LinkedIn y GitHub</td><td>Textos y enlaces</td><td>Pertenecen a sus titulares. Se mencionan solo para describir el reto, la integración simulada y los perfiles del equipo; no implican patrocinio ni afiliación.</td></tr>
      </tbody></table></div>
      <p>La página no usa fotografías de personas. Las personas, empresas y métricas de la demo son ficticias.</p>` }
  };
  const LEGAL_IDS = Object.keys(DOCS);
  
  const docText = (id) => { const t = document.createElement("div"); t.innerHTML = DOCS[id].html(); return `${DOCS[id].title}\nVersión ${LEGAL.version} · vigente desde ${LEGAL.vigencia}\n${t.textContent.replace(/\s+/g, " ").trim()}`; };
  async function sha256(t) { try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); } catch (e) { return "no-disponible"; } }
  const hashesReady = Promise.all(LEGAL_IDS.map(async id => { DOC_HASH[id] = await sha256(docText(id)); }));
  const docRef = (id) => ({ documento: DOCS[id].title, version: LEGAL.version, vigencia: LEGAL.vigencia, huellaSHA256: DOC_HASH[id] || "calculando" });
  const CHECK_TXT = {
    terminos: `Acepto los Términos y condiciones de uso (versión ${LEGAL.version}).`,
    privacidad: `Autorizo el tratamiento de mis datos personales según la Política de tratamiento de datos personales (versión ${LEGAL.version}), incluida su transferencia a Estados Unidos.`
  };
  const legalChecks = (prefix) => `<div class="lg-checks" role="group" aria-label="Aceptación de documentos">
      <div class="lg-check"><input type="checkbox" id="${prefix}-tyc"><label for="${prefix}-tyc">${CHECK_TXT.terminos}</label><a href="#terminos" data-legal="terminos" class="lg-link">Leer términos ${svg("arrow")}</a></div>
      <div class="lg-check"><input type="checkbox" id="${prefix}-priv"><label for="${prefix}-priv">${CHECK_TXT.privacidad}</label><a href="#privacidad" data-legal="privacidad" class="lg-link">Leer política ${svg("arrow")}</a></div>
    </div>`;

  /* ---- Visor de documentos legales ---- */
  let legalLast = null, legalCur = "terminos";
  function openLegal(id) {
    if (!DOCS[id]) id = "terminos";
    legalCur = id; const m = $("#m-legal"), was = m.hidden;
    if (was) legalLast = document.activeElement;
    $("#legalTabs").innerHTML = LEGAL_IDS.map(k => `<button type="button" class="legal-tab" data-legaltab="${k}" ${k === id ? 'aria-current="page"' : ""}>${DOCS[k].short}</button>`).join("");
    $("#legalBody").innerHTML = `<h3 id="legalTitle" class="font-display font-bold" style="font-size:clamp(20px,2.4vw,26px);line-height:1.2">${DOCS[id].title}</h3>
      <div class="lg-meta">Versión ${LEGAL.version} · vigente desde ${LEGAL.vigencia}${id !== "creditos" ? ` · Huella SHA-256: <code>${(DOC_HASH[id] || "calculando…").slice(0, 16)}…</code>` : ""}</div>
      <div class="lg-doc">${DOCS[id].html()}</div>`;
    $("#legalBody").scrollTop = 0;
    m.hidden = false; document.body.style.overflow = "hidden";
    if (was) setTimeout(() => $("#m-legal [data-legalclose]").focus(), 30);
  }
  function closeLegal() {
    $("#m-legal").hidden = true;
    if ($$(".modal").every(x => x.hidden || x.id === "m-legal")) document.body.style.overflow = "";
    if (legalLast) legalLast.focus();
  }
  document.addEventListener("click", (e) => {
    const l = e.target.closest("[data-legal]"); if (l) { e.preventDefault(); openLegal(l.dataset.legal); return; }
    const t = e.target.closest("[data-legaltab]"); if (t) { openLegal(t.dataset.legaltab); return; }
    if (e.target.closest("[data-legalclose]") || e.target.id === "m-legal") { closeLegal(); return; }
    if (e.target.closest("[data-storagecfg]")) { e.preventDefault(); showStorageBanner(true); }
    if (e.target.closest("[data-registro]")) { e.preventDefault(); openRegistry(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#m-legal").hidden) { e.stopImmediatePropagation(); closeLegal(); } }, true);

  /* ---- Registro trazable de consentimientos ----
     Cada evento se encadena en este navegador (SHA-256 del registro + hash anterior) y se envía a
     POST /api/me/consents, que guarda su propia cadena en PostgreSQL (tabla de solo inserción).
     rec.api = { estado: "pendiente" | "guardado" | "rechazado", id?, hash?, error? } se escribe
     después de calcular la huella local, por eso verifyChain() la excluye. Los registros anteriores
     a esta versión (sin rec.api) no se suben: se aceptaron con otro texto sobre dónde se guardan. */
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || "[]"); } catch (e) { return []; } };
  const writeLocal = (arr) => { try { localStorage.setItem(CONSENT_KEY, JSON.stringify(arr)); } catch (e) {} };
  const cUse = (n) => { try { return window.claude && typeof window.claude.use === "function" ? window.claude.use(n).catch(() => null) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } };
  const localStamp = (d) => { const off = -d.getTimezoneOffset(), s = off >= 0 ? "+" : "-", hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, "0"), mm = String(Math.abs(off) % 60).padStart(2, "0"); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${s}${hh}:${mm}`; };
  let consentQueue = Promise.resolve();
  const enqueueConsent = (fn) => { const run = consentQueue.then(fn); consentQueue = run.catch(() => {}); return run; };
  function logConsent(evt) { return enqueueConsent(() => logConsentNow(evt)); }
  const docIdOf = (d) => LEGAL_IDS.find(k => DOCS[k].title === d.documento) || String(d.documento || "").slice(0, 60);
  function consentToApi(r) {
    const { id, tipo, documentos, hash, hashAnterior, almacenamiento, errorServidor, api: _mark, ...rest } = r;
    const body = { type: tipo, details: { ...rest, documentos, idLocal: id, hashLocal: hash } };
    if (documentos && documentos.length) body.documents = documentos.map(d => ({ id: docIdOf(d), version: String(d.version || "").slice(0, 20), hash: String(d.huellaSHA256 || "").slice(0, 128) }));
    return body;
  }
  async function sendConsent(r) {
    try {
      const { consent } = await api.addConsent(consentToApi(r));
      r.api = { estado: "guardado", id: consent.id, hash: consent.hash }; r.almacenamiento = "servidor"; delete r.errorServidor;
    } catch (e) {
      if (isOffline(e)) throw e;
      r.api = { estado: "rechazado", error: String(e.code || e.status || "desconocido") }; r.errorServidor = r.api.error;
      apiLog(`el servidor rechazó el consentimiento ${r.id}`, e);
    }
  }
  /* Sube en orden los pendientes de `local` (y lo guarda). Se detiene si la API no responde. */
  async function sendPendingConsents(local) {
    let changed = false;
    try { for (const r of local) if (r.api && r.api.estado === "pendiente") { await sendConsent(r); changed = true; } }
    catch (e) { apiLog("sin backend; los consentimientos se enviarán al reconectar", e); }
    if (changed) writeLocal(local);
  }
  const flushConsents = () => enqueueConsent(() => sendPendingConsents(readLocal()));
  async function logConsentNow(evt) {
    await hashesReady;
    const now = new Date();
    const rec = { id: "evt_" + now.getTime().toString(36) + Math.random().toString(36).slice(2, 7), ...evt,
      fechaUTC: now.toISOString(), fechaLocal: localStamp(now), zonaHoraria: (Intl.DateTimeFormat().resolvedOptions().timeZone || ""),
      navegador: navigator.userAgent.slice(0, 300), idiomaNavegador: navigator.language || "", aplicacion: APP_VERSION };
    if (rec.documentos) rec.documentos = rec.documentos.map(docRef);
    const local = readLocal();
    rec.cuentaId = getUserId() || "usuario-demo";
    rec.hashAnterior = local.length ? local[local.length - 1].hash : "inicio";
    rec.hash = await sha256(JSON.stringify(rec));
    rec.almacenamiento = "solo-navegador";
    rec.api = { estado: "pendiente" };
    local.push(rec); writeLocal(local); // primero en local: si la API tarda o falla, la prueba no se pierde
    await sendPendingConsents(local);
    return rec;
  }
  async function verifyChain(evts) { let prevHash = null, ok = true; for (const r of evts) { const { hash, almacenamiento, errorServidor, api: _mark, _cuenta, ...rest } = r; const calc = await sha256(JSON.stringify(rest)); if (calc !== hash || (prevHash && r.hashAnterior !== prevHash)) ok = false; prevHash = hash; } return ok; }
  /* Registro del servidor → forma de las filas locales (los cambios de permiso que registra PATCH /api/me no traen details) */
  function fromApiConsent(c) {
    const p = c.payload || {}, d = p.details || {};
    return { ...d, id: d.idLocal || "srv_" + c.id, tipo: c.type,
      formulario: d.formulario || (p.scope ? "API · PATCH /api/me" : ""),
      detalle: d.detalle || (p.scope ? `Permiso ${p.scope}: ${p.granted ? "concedido" : "retirado"}` : ""),
      documentos: d.documentos || (p.documents || []).map(x => ({ documento: (DOCS[x.id] && DOCS[x.id].title) || x.id, version: x.version, vigencia: "", huellaSHA256: x.hash })),
      fechaUTC: d.fechaUTC || c.createdAt, fechaLocal: d.fechaLocal || c.createdAt,
      hashAnterior: c.prevHash, hash: c.hash, almacenamiento: "servidor", _cuenta: "Tu cuenta KNET" };
  }

  const evtSummary = (r) => `${evtTypeLbl[r.tipo] || r.tipo} · ${r.formulario || ""}`;

  /* Vista del Responsable (dueño o editores del artifact) */
  async function openRegistry() {
    const m = $("#m-registro"), body = $("#regBody");
    body.innerHTML = `<p class="text-mute">Cargando registro…</p>`;
    if (m.hidden) openModal("registro");
    await flushConsents(); // sube lo pendiente antes de leer
    let rows = [], source = "navegador", chain = null;
    try { const r = await api.listConsents(); rows = (r.consents || []).map(fromApiConsent); chain = r.chain; source = "servidor"; }
    catch (e) { apiLog("no se pudo leer el registro del servidor", e); }
    if (source !== "servidor") rows = readLocal().map(ev => ({ ...ev, _cuenta: "Este navegador" }));
    rows.sort((a, b) => String(b.fechaUTC).localeCompare(String(a.fechaUTC)));
    window.__knetRegistro = rows; window.__knetRegistroSrc = source;
    body.innerHTML = `
      <p class="text-[14px] text-mute">${source === "servidor" ? `Registro de tu cuenta guardado en la base de datos PostgreSQL de KNET: ${rows.length} eventos. La base de datos solo permite agregar registros; ninguno se puede modificar ni borrar.${chain && !chain.valid ? " <b>Atención: la cadena de huellas del servidor no es válida.</b>" : ""}` : `Estás viendo solo los eventos guardados en este navegador (${rows.length}): el servidor de KNET no respondió. Los pendientes se enviarán cuando vuelva la conexión.`}</p>
      <div class="flex flex-wrap gap-2" style="margin-block:12px">
        <button type="button" class="btn btn-primary btn-sm" data-regcsv>${svg("file")}Descargar CSV</button>
        <button type="button" class="btn btn-ghost btn-sm" data-regjson>${svg("file")}Copiar JSON</button>
        <button type="button" class="btn btn-ghost btn-sm" data-regverify>${svg("shield")}Verificar integridad</button>
        <span class="text-[13px] text-mute" id="regMsg" role="status"></span>
      </div>
      ${rows.length ? `<div class="lg-table-wrap"><table class="lg-table reg-table"><thead><tr><th>Fecha y hora</th><th>Titular</th><th>Evento</th><th>Método</th><th>Documentos</th><th>Guardado en</th><th>Huella</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td class="tabular">${esc(r.fechaLocal || r.fechaUTC)}</td><td>${esc(r.titular || "—")}<div class="text-mute text-[11px]">${esc(r._cuenta)}</div></td><td>${esc(evtSummary(r))}</td><td>${esc(r.metodo || "—")}</td><td>${(r.documentos || []).map(d => `${esc(d.documento)} v${esc(d.version)}`).join("<br>") || "—"}${r.autorizacion ? `<div class="text-mute text-[11px]">${esc(r.autorizacion.texto || "")}</div>` : ""}</td><td>${r.almacenamiento === "servidor" ? "Servidor" : "Solo navegador"}${r.api && r.api.estado !== "guardado" && r.almacenamiento !== "servidor" ? `<div class="text-mute text-[11px]">${r.api.estado === "pendiente" ? "Envío pendiente" : "Rechazado por el servidor"}</div>` : ""}</td><td><code>${esc(String(r.hash || "").slice(0, 12))}</code></td></tr>`).join("")}
      </tbody></table></div>` : `<div class="dempty">Todavía no hay aceptaciones registradas. Aparecerán aquí cuando alguien cree su perfil.</div>`}`;
  }
  const csvCell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  function registryCSV(rows) {
    const head = ["id", "fecha_local", "fecha_utc", "zona_horaria", "titular", "cuenta", "tipo", "formulario", "metodo", "casillas", "documentos", "autorizacion", "detalle", "navegador", "almacenamiento", "hash_anterior", "hash"];
    const lines = rows.map(r => [r.id, r.fechaLocal, r.fechaUTC, r.zonaHoraria, r.titular, r._cuenta, r.tipo, r.formulario, r.metodo, (r.casillas || []).join(" | "), (r.documentos || []).map(d => `${d.documento} v${d.version} (${d.vigencia}) sha256:${d.huellaSHA256}`).join(" | "), r.autorizacion ? `${r.autorizacion.texto} [${(r.autorizacion.campos || []).join(", ")}]` : "", r.detalle, r.navegador, r.almacenamiento, r.hashAnterior, r.hash].map(csvCell).join(","));
    return "﻿" + [head.join(","), ...lines].join("\n");
  }
  $("#m-registro").addEventListener("click", async (e) => {
    const msg = $("#regMsg"), rows = window.__knetRegistro || [];
    if (e.target.closest("[data-regcsv]")) {
      const dl = await cUse("downloads"), name = `knet-registro-consentimientos-${new Date().toISOString().slice(0, 10)}.csv`;
      if (!dl) { msg.textContent = "Las descargas no están disponibles aquí. Usa «Copiar JSON»."; return; }
      try { await dl.save({ filename: name, data: registryCSV(rows) }); msg.textContent = "Archivo listo."; } catch (err) { msg.textContent = err && err.code === "declined" ? "Descarga cancelada." : "No se pudo descargar. Usa «Copiar JSON»."; }
    }
    if (e.target.closest("[data-regjson]")) { const txt = JSON.stringify(rows.map(({ _cuenta, ...r }) => r), null, 2); try { await navigator.clipboard.writeText(txt); msg.textContent = "JSON copiado."; } catch (err) { msg.textContent = "Tu navegador bloqueó el portapapeles."; } }
    if (e.target.closest("[data-regverify]")) {
      // Registro del servidor: la cadena la recalcula el backend (GET /api/me/consents → chain)
      if (window.__knetRegistroSrc === "servidor") {
        try { const { chain } = await api.listConsents(); msg.textContent = chain.valid ? "Integridad verificada en el servidor: ninguna huella fue alterada." : `Atención: la cadena se rompe en el registro ${chain.brokenAt}.`; }
        catch (err) { msg.textContent = "No se pudo contactar al servidor para verificar."; }
        return;
      }
      const byAcc = {}; rows.forEach(r => (byAcc[r._cuenta] = byAcc[r._cuenta] || []).push(r));
      let ok = true; for (const k of Object.keys(byAcc)) { const ev = byAcc[k].slice().sort((a, b) => String(a.fechaUTC).localeCompare(String(b.fechaUTC))); if (!(await verifyChain(ev))) ok = false; }
      msg.textContent = ok ? "Integridad verificada: ninguna huella fue alterada." : "Atención: hay eventos cuya huella no coincide.";
    }
  });
  (async () => { const u = await cUse("user"); if (u && ((await u.isOwner()) || (await u.canEdit()))) $$(".reg-only").forEach(x => x.hidden = false); })();

  /* ---- Aviso de almacenamiento (cookies) ---- */
  
  let storagePref = null;
  try { storagePref = JSON.parse(localStorage.getItem(PREF_KEY) || "null"); } catch (e) {}
  const prefsAllowed = () => !!(storagePref && storagePref.preferencias);
  function showStorageBanner(force) {
    const b = $("#storageBanner");
    if (!force && storagePref) { b.hidden = true; return; }
    b.hidden = false;
    $("#sbPrefs").checked = prefsAllowed();
  }
  $("#storageBanner").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sb]"); if (!btn) return;
    const prefs = btn.dataset.sb === "all" ? true : btn.dataset.sb === "save" ? $("#sbPrefs").checked : false;
    storagePref = { preferencias: prefs, fecha: new Date().toISOString(), version: LEGAL.version };
    try { localStorage.setItem(PREF_KEY, JSON.stringify(storagePref)); } catch (err) {}
    if (!prefs) { try { localStorage.removeItem("knet-lang"); localStorage.removeItem("knet-theme"); } catch (err) {} }
    else { try { localStorage.setItem("knet-lang", LANG); localStorage.setItem("knet-theme", document.documentElement.classList.contains("theme-light") ? "light" : "dark"); } catch (err) {} }
    $("#storageBanner").hidden = true;
    logConsent({ tipo: "almacenamiento", formulario: "Aviso de almacenamiento local", metodo: `Clic en «${btn.textContent.trim()}»`, detalle: prefs ? "Acepta almacenamiento necesario y de preferencias (idioma)" : "Acepta solo almacenamiento necesario", documentos: ["cookies"], titular: (A.connected && A.profile && A.profile.name) || "Visitante sin perfil" });
    toast(`<b>Preferencia guardada</b><div class="text-[13px] text-mute">${prefs ? "Recordaremos tu idioma." : "Solo usaremos lo necesario."}</div>`, "shield");
  });
  showStorageBanner(false);
  { const fm = $("#ftMail"); if (fm) { fm.href = "mailto:" + LEGAL.correo; fm.textContent = LEGAL.correo; } }
  $("#legalId").innerHTML = `Responsable: ${L("responsable")} · Domicilio: ${L("domicilio")} · Correo: <a href="mailto:${esc(LEGAL.correo)}">${L("correo")}</a> · Teléfono: <a href="tel:${esc(LEGAL.telefono.replace(/\s/g, ""))}">${L("telefono")}</a><br>KNET no está afiliado a LinkedIn ni a Accenture. Autoridad de protección al consumidor y de datos personales: <a href="${SIC_URL}" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>.`;

  /* ---- Conexión: elegir automático o manual ---- */
  let runId = 0, consentGiven = null;
  const showPane = (id) => ["mcpChoice", "mcpPerm", "mcpAuto", "mcpForm"].forEach(k => $("#" + k).hidden = k !== id);
  function startConnect() {
    runId++; consentGiven = null;
    $("#mcpTitle").textContent = "Crea tu perfil del Summit";
    $("#mcpSub").textContent = "Importa tus datos desde LinkedIn o complétalos manualmente. Podrás modificar tus datos más tarde.";
    showPane("mcpChoice"); $("#mcpDone").hidden = true;
    $("#mcpChoice").innerHTML = `
      <button type="button" class="mcp-opt rec" data-mcp="auto"><span class="ico-tile" style="background:rgba(61,107,255,.12);color:var(--t-blue)">${svg("link")}</span><span class="min-w-0"><span class="mcp-opt-t">Importar desde LinkedIn <span class="chip chip-emerald">Recomendado</span></span></span></button>
      <button type="button" class="mcp-opt" data-mcp="manual"><span class="ico-tile" style="background:rgba(161,0,255,.16);color:var(--t-lilac)">${svg("pen")}</span><span class="min-w-0"><span class="mcp-opt-t">Completar manualmente</span></span></button>
      <input type="checkbox" id="mcpIncomplete" hidden>`;
    if ($("#m-mcp").hidden) openModal("mcp");
  }
  $("#mcpChoice").addEventListener("click", (e) => { const b = e.target.closest("[data-mcp]"); if (!b) return; if (b.dataset.mcp === "auto") showLinkedInPermission($("#mcpIncomplete").checked); else showProfileForm(); });

  /* Permiso explícito antes de leer LinkedIn */
  
  
  function showLinkedInPermission(demoMissing) {
    runId++;
    $("#mcpTitle").textContent = "Permiso para conectar LinkedIn";
    $("#mcpSub").textContent = "Elige qué puede leer KNET de tu LinkedIn. Lo que no marques lo podrás escribir tú.";
    showPane("mcpPerm"); $("#mcpDone").hidden = true;
    $("#mcpPerm").innerHTML = `
      <fieldset class="li-fields"><legend class="av-lbl">Datos que KNET podrá leer</legend>
        ${LI_FIELDS.map(([k, l, h, req]) => `<label class="switch-row" for="li-${k}"><span><b class="font-semibold">${l}</b><span class="block text-mute text-[13px]">${h}</span></span><input type="checkbox" role="switch" class="switch" id="li-${k}" ${req ? "checked disabled" : "checked"}></label>`).join("")}
        <div class="li-never">${svg("lock")}<span>Nunca leemos tus contactos, mensajes, correo ni publicaciones.</span></div>
      </fieldset>
      <div class="lg-checks" style="margin-top:14px"><div class="lg-check"><input type="checkbox" id="li-auth"><label for="li-auth">${LI_AUTH_TXT}</label></div></div>
      ${legalChecks("li")}
      <p class="pf-err" id="liErr" role="alert" hidden></p>
      <div class="av-foot" style="margin-top:16px"><button type="button" class="btn btn-ghost btn-sm" data-liback><span class="flip-x">${svg("arrow")}</span>Volver</button><button type="button" class="btn btn-primary" data-ligo>${svg("shield")}Autorizar y conectar</button></div>`;
    $("#mcpPerm").dataset.demo = demoMissing ? "1" : "";
    setTimeout(() => { const f = $("#li-work"); if (f) f.focus(); }, 40);
  }
  $("#mcpPerm").addEventListener("click", (e) => {
    if (e.target.closest("[data-liback]")) { startConnect(); return; }
    if (!e.target.closest("[data-ligo]")) return;
    const need = [["#li-auth", "el permiso para leer LinkedIn"], ["#li-tyc", "aceptar los Términos y condiciones"], ["#li-priv", "autorizar la Política de privacidad"]].filter(([id]) => !$(id).checked);
    const er = $("#liErr");
    if (need.length) { er.hidden = false; er.textContent = `Para continuar falta: ${need.map(n => n[1]).join(", ")}.`; $(need[0][0]).focus(); return; }
    const scopes = { work: $("#li-work").checked, industry: $("#li-industry").checked, skills: $("#li-skills").checked };
    const campos = ["Nombre"].concat(scopes.work ? ["Cargo y empresa"] : [], scopes.industry ? ["Industria y seniority"] : [], scopes.skills ? ["Habilidades e intereses"] : []);
    const ev = { tipo: "aceptacion", formulario: "Pantalla de permiso de LinkedIn MCP", metodo: "Casillas de verificación no premarcadas y clic en «Autorizar y conectar»",
      casillas: [LI_AUTH_TXT, CHECK_TXT.terminos, CHECK_TXT.privacidad], documentos: ["terminos", "privacidad"], autorizacion: { texto: LI_AUTH_TXT, campos }, titular: "Pendiente: se identifica al importar el perfil" };
    consentGiven = { at: new Date(), p: logConsent(ev) };
    connectFlow(null, { scopes, incomplete: $("#mcpPerm").dataset.demo === "1" });
  });

  function showProfileForm(pre = {}, fromMcp = []) {
    runId++;
    showPane("mcpForm"); $("#mcpDone").hidden = true;
    const f = $("#mcpForm"); f.dataset.mcp = fromMcp.join(",");
    $("#mcpTitle").textContent = fromMcp.length ? "Completa lo que falta" : "Completa tu perfil";
    $("#mcpSub").textContent = fromMcp.length ? "Importamos lo que autorizaste. Completa el resto; todo se puede editar después." : "Solo pedimos lo necesario para armar tu agenda, tus matches y tus misiones.";
    const ind = pre.ind || "tech", v = (k) => esc(pre[k] || "");
    const tag = (k) => fromMcp.includes(k) ? `<span class="pf-tag">${svg("link")}LinkedIn</span>` : "";
    const opt = `<span class="pf-opt">opcional</span>`;
    const when = consentGiven ? consentGiven.at.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";
    f.innerHTML = `
      <div class="pf-grid">
        <div class="pf-field"><label for="pf-name">Nombre ${tag("name")}</label><input id="pf-name" class="select" maxlength="60" value="${v("name")}" autocomplete="name" placeholder="Ej. Paola Barros"></div>
        <div class="pf-field"><label for="pf-role">Rol o cargo ${tag("role")}</label><input id="pf-role" class="select" maxlength="60" value="${v("role")}" placeholder="Ej. Gerente de Producto"></div>
        <div class="pf-field"><label for="pf-ind">Industria ${tag("ind")}</label><select id="pf-ind" class="select">${Object.keys(IND).map(k => `<option value="${k}" ${k === ind ? "selected" : ""}>${IND[k].label}</option>`).join("")}</select></div>
        <div class="pf-field"><label for="pf-sen">Seniority ${tag("seniority")}</label><select id="pf-sen" class="select"><option value="">Elige una opción</option>${SENIORITY.map(s => `<option ${s === pre.seniority ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="pf-field"><label for="pf-company">Empresa ${opt} ${tag("company")}</label><input id="pf-company" class="select" maxlength="60" value="${v("company")}" autocomplete="organization" placeholder="Ej. Accenture"></div>
        <div class="pf-field"><label for="pf-loc">Ciudad ${opt} ${tag("location")}</label><input id="pf-loc" class="select" maxlength="60" value="${v("location")}" placeholder="Ej. Bogotá"></div>
        <fieldset class="pf-field pf-wide"><legend>Intereses · elige de 1 a 5 ${tag("interests")}</legend><div class="pf-chips" id="pf-ints">${INTEREST_POOL.map(x => `<button type="button" class="av-chip" data-int="${esc(x)}" aria-pressed="${(pre.interests || []).includes(x)}">${x}</button>`).join("")}</div></fieldset>
      </div>
      ${consentGiven ? `<div class="lg-done">${svg("check")}<span>Ya aceptaste los Términos y la Política de privacidad (v${LEGAL.version}) a las ${when}, en la pantalla de permiso de LinkedIn. Queda en tu registro de consentimientos.</span></div>` : legalChecks("pf")}
      <p class="pf-err" id="pfErr" role="alert" hidden></p>
      <div class="av-foot" style="margin-top:18px"><button type="button" class="btn btn-ghost btn-sm" data-pfback><span class="flip-x">${svg("arrow")}</span>Volver</button><button type="submit" class="btn btn-primary">${svg("check")}Crear mi perfil · +100 XP</button></div>`;
    setTimeout(() => { const empty = [...f.querySelectorAll("input:not([type=checkbox]),select")].find(el => !el.value && !el.closest(".pf-field").querySelector(".pf-opt")); (empty || $("#pf-name")).focus(); }, 40);
  }
  $("#mcpForm").addEventListener("click", (e) => {
    const c = e.target.closest("[data-int]");
    if (c) { const on = c.getAttribute("aria-pressed") === "true", n = $$("#pf-ints [aria-pressed='true']").length; if (!on && n >= 5) { const er = $("#pfErr"); er.hidden = false; er.textContent = "Puedes elegir hasta 5 intereses. Quita uno para agregar otro."; return; } c.setAttribute("aria-pressed", String(!on)); $("#pfErr").hidden = true; return; }
    if (e.target.closest("[data-pfback]")) startConnect();
  });
  $("#mcpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (id) => $(id).value.trim(), ints = $$("#pf-ints [aria-pressed='true']").map(b => b.dataset.int);
    const checks = [["#pf-name", "tu nombre"], ["#pf-role", "tu rol"], ["#pf-sen", "tu seniority"]];
    const missing = checks.filter(([id]) => !val(id)), er = $("#pfErr");
    const names = missing.map(m => m[1]).concat(ints.length ? [] : ["al menos un interés"]);
    const legalMissing = consentGiven ? [] : [["#pf-tyc", "aceptar los Términos y condiciones"], ["#pf-priv", "autorizar la Política de privacidad"]].filter(([id]) => !$(id).checked);
    if (names.length || legalMissing.length) {
      er.hidden = false; er.textContent = `Falta ${names.concat(legalMissing.map(x => x[1])).join(", ")}.`;
      (missing[0] ? $(missing[0][0]) : !ints.length ? $("#pf-ints .av-chip") : $(legalMissing[0][0])).focus(); return;
    }
    const fromMcp = ($("#mcpForm").dataset.mcp || "").split(",").filter(Boolean);
    const profile = { name: val("#pf-name"), role: val("#pf-role"), company: val("#pf-company"), seniority: val("#pf-sen"), interests: ints, location: val("#pf-loc"),
      src: Object.fromEntries(P_FIELDS.map(f => [f, fromMcp.includes(f) ? "mcp" : "manual"])) };
    if (consentGiven) logConsent({ tipo: "vinculacion", formulario: "Formulario «Completa lo que falta»", metodo: "Envío del formulario tras la aceptación en la pantalla de LinkedIn", titular: profile.name, detalle: "Identifica al titular de la aceptación anterior" });
    else logConsent({ tipo: "aceptacion", formulario: "Formulario de perfil manual", metodo: "Casillas de verificación no premarcadas y clic en «Crear mi perfil»", casillas: [CHECK_TXT.terminos, CHECK_TXT.privacidad], documentos: ["terminos", "privacidad"], titular: profile.name });
    finalize(val("#pf-ind"), profile, fromMcp.length ? "mixed" : "manual");
  });

  /* ---- Importación automática (2 s), solo con los campos autorizados ---- */
  async function connectFlow(ind, opts = {}) {
    ind = ind || (A.connected ? A.ind : "tech");
    const sc = opts.scopes || { work: true, industry: true, skills: true }, demo = !!opts.incomplete;
    const my = ++runId, p = BASE_P[ind], role = BASE_ROLE[ind], d = IND[ind], modal = $("#m-mcp");
    const alive = () => my === runId && !modal.hidden;
    if (modal.hidden) openModal("mcp");
    showPane("mcpAuto"); $("#mcpDone").hidden = true;
    $("#mcpTitle").textContent = "Conectando tu perfil profesional";
    $("#mcpSub").textContent = "KNET lee solo los campos que autorizaste. Puedes revocarlos desde tu panel.";
    const bar = $("#mcpBar"); bar.style.transition = "none"; bar.style.width = "0%"; void bar.offsetWidth;
    bar.style.transition = reduce ? "none" : "width 2s linear"; bar.style.width = "100%";
    const NA = "No autorizado", ND = "No disponible";
    const steps = ["Handshake OAuth con linkedin-mcp", "profile.read → nombre" + (sc.work ? ", cargo y empresa" : ""), sc.industry ? "Clasificando industria y seniority" : "Industria: sin permiso", sc.skills ? "interests.infer → temas clave" : "Intereses: sin permiso"];
    const fields = [["Nombre", p.name], ["Rol", sc.work ? role : NA], ["Empresa", !sc.work ? NA : demo ? ND : p.company], ["Industria", sc.industry ? d.label : NA], ["Intereses", !sc.skills ? NA : demo ? ND : p.interests.slice(0, 2).join(" · ")]];
    const fillAt = [[0], [1, 2], [3], [4]];
    $("#mcpSteps").innerHTML = steps.map(x => `<div class="step-row"><span class="dot"></span><span>${x}</span></div>`).join("");
    $("#mcpFields").innerHTML = fields.map(([k]) => `<div class="field"><span class="text-mute">${k}</span><b class="mcp-val"><span class="mcp-sk shimmer"></span></b></div>`).join("");
    for (let i = 0; i < steps.length; i++) {
      if (!alive()) return;
      const row = $("#mcpSteps").children[i]; row.classList.add("active");
      await sleep(500); if (!alive()) return;
      row.classList.replace("active", "done"); row.querySelector(".dot").innerHTML = svg("check");
      fillAt[i].forEach(k => { const el = $$("#mcpFields .mcp-val")[k]; el.textContent = fields[k][1]; if (fields[k][1] === NA || fields[k][1] === ND) el.classList.add("mcp-miss"); });
    }
    const got = { name: p.name, location: p.location };
    const fromMcp = ["name", "location"];
    if (sc.work) { got.role = role; fromMcp.push("role"); if (!demo) { got.company = p.company; fromMcp.push("company"); } }
    if (sc.industry) { got.ind = ind; fromMcp.push("ind"); if (!demo) { got.seniority = p.seniority; fromMcp.push("seniority"); } }
    if (sc.skills && !demo) { got.interests = p.interests.slice(); fromMcp.push("interests"); }
    const missing = ["role", "ind", "seniority", "interests"].filter(k => !fromMcp.includes(k));
    $("#mcpDone").hidden = false;
    if (missing.length || (sc.work && demo)) {
      $("#mcpTitle").textContent = "Faltan algunos datos";
      $("#mcpDone").innerHTML = `<div class="mcp-warn">${svg("info")}<span><b>Importamos lo que autorizaste.</b> Completa a mano los datos que faltan para personalizar tu Summit.</span></div>`;
      await sleep(1400); if (!alive()) return;
      showProfileForm(got, fromMcp);
      return;
    }
    $("#mcpTitle").textContent = "Perfil listo";
    $("#mcpDone").innerHTML = `<div class="mcp-ok">${svg("check")}<span><b>Datos extraídos en 2,0 s.</b> Entrando a tu panel…</span></div>`;
    await sleep(800); if (!alive()) return;
    const prof = profileFromPersona(ind);
    if (consentGiven) logConsent({ tipo: "vinculacion", formulario: "Importación desde LinkedIn MCP", metodo: "Importación automática tras la aceptación en la pantalla de permiso", titular: prof.name, detalle: "Identifica al titular de la aceptación anterior" });
    finalize(ind, prof, "mcp");
  }
  function finalize(ind, profile, via) {
    const modal = $("#m-mcp"), reset = !A.connected || ind !== A.ind;
    if (reset) { const keepAv = A.connected ? A.avatar : null; A = fresh(ind); A.connected = true; A.xp = 100; A.xpLocal = 100; A.avatar = keepAv; selEvent = null; graphIntro = true; }
    A.profile = profile; editField = null; applyProfile();
    A.apiLinked = false; // el perfil recién importado o escrito manda: el próximo sync lo sube a la API
    const p = PERSONAS[ind], d = IND[ind];
    if (reset) A.chat.push({ who: "ai", html: `Hola, ${esc(first(p.name))}. Configuré tu Summit para ${esc(d.role)} en ${d.label}: 4 sesiones, 3 matches y 3 misiones activas. ¿En qué te ayudo?` });
    save(); syncFromApi(); consentGiven = null; closeModal(modal);
    const msg = { mcp: "Perfil importado vía MCP", manual: "Perfil creado manualmente", mixed: "Perfil completado: LinkedIn + datos tuyos" }[via];
    if (reset) { notify("xp", `+100 XP · ${msg}`, "¡Bienvenido a KNET!"); toast(`<b>${msg}</b>${xpLine(100)}`, via === "mcp" ? "link" : "pen"); } else toast(`<b>${msg}</b>`, "link");
    showTab("perfil");
    if (reset) setTimeout(() => { if (!A.avatar && inApp) openAvatar(); }, 900);
    if (reset && !A.tourSeen) offerTourWhenIdle();
  }

  /* ---- Edición con lápiz ---- */
  function kvEditor(field, label) {
    const pr = A.profile; let input;
    if (field === "ind") input = `<select id="pfe" class="select">${Object.keys(IND).map(x => `<option value="${x}" ${x === A.ind ? "selected" : ""}>${IND[x].label}</option>`).join("")}</select><span class="kv-note">Cambiar la industria rehace tu agenda, misiones y matches.</span>`;
    else if (field === "seniority") input = `<select id="pfe" class="select">${SENIORITY.map(s => `<option ${s === pr.seniority ? "selected" : ""}>${s}</option>`).join("")}</select>`;
    else if (field === "interests") input = `<div class="pf-chips" id="pfeInts" role="group" aria-label="Intereses">${[...new Set(INTEREST_POOL.concat(pr.interests))].map(x => `<button type="button" class="av-chip" data-eint="${esc(x)}" aria-pressed="${pr.interests.includes(x)}">${esc(x)}</button>`).join("")}</div><span class="kv-note">Elige de 1 a 5.</span>`;
    else input = `<input id="pfe" class="select" maxlength="60" value="${esc(pr[field] || "")}">`;
    return `<div class="kv-wrap"><div class="kv kv-edit"><label class="kv-k" for="pfe">${label}</label><div class="kv-in">${input}</div><div class="kv-act">${act("pfcancel", field, "Cancelar", "btn btn-ghost btn-sm")}${act("pfsave", field, `${svg("check")}Guardar`, "btn btn-primary btn-sm")}</div></div><p class="pf-err" id="pfeErr" role="alert" hidden></p></div>`;
  }
  function saveField(field) {
    const er = $("#pfeErr"), fail = (m) => { er.hidden = false; er.textContent = m; };
    if (field === "interests") {
      const ints = $$("#pfeInts [aria-pressed='true']").map(b => b.dataset.eint);
      if (!ints.length) return fail("Elige al menos un interés.");
      A.profile.interests = ints;
    } else if (field === "ind") {
      const ni = $("#pfe").value;
      if (ni !== A.ind) { A.profile.src = { ...A.profile.src, ind: "edited" }; switchIndustry(ni);
        applyProfile(); A.chat.push({ who: "ai", html: `Actualicé tu industria a ${IND[ni].label} y rehíce tu agenda, tus matches y tus misiones.` }); save(); apiPatchProfile(["ind"]);
        toast(`<b>Industria actualizada</b><div class="text-[13px] text-mute">Tu agenda y tus matches se recalcularon.</div>`, "pen"); refresh(); return; }
    } else {
      const v = $("#pfe").value.trim();
      if (!v) return fail("Este dato no puede quedar vacío.");
      A.profile[field] = v;
    }
    A.profile.src[field] = "edited"; editField = null; applyProfile(); save(); apiPatchProfile([field]);
    toast("<b>Dato actualizado</b> · KNET usará este valor", "pen"); refresh();
  }
  panel.addEventListener("keydown", (e) => {
    if (e.target.id !== "pfe") return;
    if (e.key === "Enter") { e.preventDefault(); saveField(editField); }
    if (e.key === "Escape") { e.preventDefault(); editField = null; refresh(); }
  });

  /* ---- Eventos ---- */
  $$("[data-connect]").forEach(b => b.addEventListener("click", () => { if (A.connected) showTab(curTab || "perfil"); else if (hasSaved()) resumeSession(); else startConnect(); }));
  /* Cerrar sesión: conserva perfil, avatar y progreso en este navegador */
  $("#logoutBtn").addEventListener("click", () => {
    const b = $("#logoutBtn"); b.classList.add("closing");
    setTimeout(() => {
      b.classList.remove("closing");
      runId++; editField = null; A.connected = false; save(); applyProfile();
      toast(`<b>Sesión cerrada</b><div class="text-[13px] text-mute">Tu perfil y tu progreso quedan guardados en este navegador.</div>`, "lock");
      showLanding();
    }, reduce ? 0 : 380);
  });
  /* Volver a entrar con la sesión guardada */
  const hasSaved = () => !A.connected && !!A.profile;
  function resumeSession(tab) {
    A.connected = true; save(); applyProfile(); syncFromApi();
    toast(`<b>¡Hola de nuevo, ${esc(first(A.profile.name))}!</b><div class="text-[13px] text-mute">Recuperamos tu progreso: ${fmt(A.xp)} XP.</div>`, "check");
    showTab(tab || curTab || "perfil");
  }
  /* Revocar la autorización y borrar los datos (derecho del titular, Ley 1581) */
  function revokeAndErase() {
    logConsent({ tipo: "revocacion", formulario: "Panel · Tus autorizaciones", metodo: "Clic del titular en «Revocar y borrar mis datos» y confirmación", titular: (A.profile && A.profile.name) || "—", detalle: "Revoca la autorización y borra su perfil y progreso de este navegador. El registro de consentimientos se conserva como prueba (Ley 1581 de 2012, art. 17)." });
    runId++; A = fresh(A.ind); editField = null; applyProfile(); try { localStorage.removeItem(KEY); } catch (e) {}
    toast("<b>Autorización revocada.</b> Borramos tu perfil y tu progreso de este navegador.", "shield");
    showLanding();
  }
  const onAct = async (b) => {
    const a = b.dataset.act, v = b.dataset.v;
    if (a === "goto") { goTo(v); return; }
    if (a === "vnopen") { VN.ev = v; if (myEvIds().includes(v)) { A.sel = A.sel || {}; A.sel.main = { ev: v, day: (A.sel.main && A.sel.main.ev === v) ? A.sel.main.day : 0 }; save(); } meView = "venue"; showTab("miseventos"); return; }
    if (a === "ask") { ask(v); return; }
    if (a === "kvinfo") { const box = document.getElementById(v), open = box.hidden; box.hidden = !open; b.setAttribute("aria-expanded", String(open)); return; }
    if (a === "attend") { const s = sessionById(v); if (!s || A.attended.includes(s.id) || isEnded("ev:" + s.ev)) return; award(() => A.attended.push(s.id), CHECKIN_XP, `Check-in · ${s.ttl} (${evById(s.ev).city}, Día ${s.day + 1})`, "qr"); apiRun({ t: "checkin", id: s.id }); return; }
    if (a === "connect") { connectMatch(v); return; }
    if (a === "person") { openPerson(v); return; }
    if (a === "chat") { openChat(v); return; }
    if (a === "qrtoggle") { qrOpen = !qrOpen; refresh(); const c = $("#qrCard"); if (c && qrOpen) flash(c); return; }
    if (a === "qrscan") { simulateScan(); return; }
    if (a === "exppick") { expPick = !expPick; expAsk = null; refresh(); return; }
    if (a === "expchange") { expPick = true; expAsk = null; refresh(); return; }
    if (a === "mepick") { mePick = !mePick; expAsk = null; refresh(); return; }
    if (a === "expno") { expAsk = null; refresh(); return; }
    if (a === "expjoin") { const e = EXPS.find(x => x.id === v); if (!e) return; const expDone = A.exp && isEnded("exp:" + A.exp.id); if (A.exp && A.exp.id === v && !expDone) { expPick = mePick = false; expAsk = null; refresh(); return; } if (expDone && A.ended) delete A.ended["exp:" + A.exp.id];
      if (A.exp && !expDone && b.dataset.confirm !== "1") { expAsk = v; refresh(); const cf = $(".exp-confirm [data-confirm]"); if (cf) { cf.focus(); cf.closest(".exp-confirm").scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); } return; }
      expAsk = null; const isFirst = !A.exp; expPick = false; mePick = false;
      const se = [e.time, "Experiencia", e.name, e.where];
      const mut = () => { A.exp = { id: e.id, at: Date.now() }; notify("event", `Te inscribiste en ${e.name}`, `${e.time} · ${e.where}`); scheduleSoon("exp", se, 30000); };
      if (isFirst) award(mut, EXP_XP, `Misión especial · ${e.name}`, "calendar"); else { mut(); save(); toast(`<b>${expDone ? "Te inscribiste en" : "Cambiaste a"} ${e.name}</b><div class="text-[13px] text-mute">${e.time} · ${e.where}</div>`, "calendar"); refresh(); }
      return; }
    if (a === "rwmore") { rwMore = !rwMore; refresh(); const t = $(rwMore ? "#rwMore" : "#rewardsCard"); if (t) { scrollToEl(t); if (rwMore) flash(t); } return; }
    if (a === "itemclaim") { const it = AV_XHAIR.concat(AV_XACC).find(x => x[0] === v); if (!it || A.xp < it[2] || ownsItem(v)) return; A.items = (A.items || []).concat(v); save(); toast(`<b>¡Recompensa reclamada!</b><div class="text-[13px] text-mute">${it[1]} ya está disponible para tu avatar.</div>`, "trophy"); refresh(); return; }
    if (a === "itemon") { if (!ownsItem(v)) return; if (!A.avatar) { toast("<b>Primero crea tu avatar</b><div class='text-[13px] text-mute'>Luego podrás usar tus recompensas.</div>", "users"); openAvatar(); return; } const isHair = AV_XHAIR.some(h => h[0] === v); A.avatar = { ...A.avatar, [isHair ? "hair" : "acc"]: v }; save(); toast(`<b>${(AV_XHAIR.concat(AV_XACC).find(x => x[0] === v) || [])[1]} equipado</b>`, "star"); refresh(); return; }
    if (a === "itemoff") { if (!A.avatar) return; const isHair = AV_XHAIR.some(h => h[0] === v); A.avatar = { ...A.avatar, [isHair ? "hair" : "acc"]: isHair ? AV_HAIR[A.avatar.gender][0][0] : "ninguno" }; save(); refresh(); return; }
    if (a === "frameclaim") { const f = FRAMES.find(x => x.id === v); if (!f || A.xp < f.xp) return; A.frames = (A.frames || []).concat(v); A.frame = v; save(); toast(`<b>¡Recompensa reclamada!</b><div class="text-[13px] text-mute">${f.name} ya está en tu avatar.</div>`, "trophy"); refresh(); const c = $("#rewardsCard"); if (c) flash(c); return; }
    if (a === "frameon") { A.frame = v; save(); toast(`<b>Marco equipado</b>`, "star"); refresh(); return; }
    if (a === "frameoff") { A.frame = null; save(); refresh(); return; }
    if (a === "complete") { const m = missionPool().find(x => x.id === v); if (!m || A.done.includes(v)) return; award(() => A.done.push(v), m.xp, `Misión completada · ${m.title}`); apiRun({ t: "mission", id: v }); return; }
    if (a === "nfc") { b.classList.remove("tapped"); void b.offsetWidth; b.classList.add("tapped"); setTimeout(() => award(() => {}, 25, "Toque NFC registrado", "nfc"), 120); return; }
    if (a === "flip") { b.classList.toggle("flipped"); return; }
    if (a === "avedit") { openAvatar(); return; }
    if (a === "pfedit") { editField = v; refresh(); const t2 = $("#pfe") || $("#pfeInts .av-chip"); if (t2) { t2.focus(); if (t2.select) t2.select(); } return; }
    if (a === "pfcancel") { editField = null; refresh(); const pen = $(`[data-act="pfedit"][data-v="${v}"]`); if (pen) pen.focus(); return; }
    if (a === "pfsave") { saveField(v); return; }
    if (a === "revoke") {
      if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.innerHTML = `${svg("x")}Confirmar: borrar todo`; b.classList.add("armed"); setTimeout(() => { if (b.isConnected && b.dataset.armed === "1") { b.dataset.armed = ""; b.classList.remove("armed"); b.innerHTML = `${svg("x")}Revocar y borrar mis datos`; } }, 5000); return; }
      revokeAndErase(); return; }
    if (a === "graph") { b.disabled = true; b.classList.add("shimmer"); b.innerHTML = `${svg("users")}<span>Analizando 1.240 asistentes…</span>`; await sleep(900); graphIntro = true; award(() => { A.graph = true; }, 30, "Grafo de contactos generado", "users"); const nc = $("#networkCard"); if (nc) requestAnimationFrame(() => scrollToEl(nc)); return; }
    if (a === "resync") { connectFlow($("#personaSel").value); return; }
    if (a === "evinfo") { openEvent(v); return; }
    if (a === "evselect") { const c = (EVENTS.find(e => e.id === v) || {}).city, cur = selEvent && (EVENTS.find(e => e.id === selEvent) || {}).city; selEvent = cur === c ? null : v; refresh(); if (!selEvent) return; const el = $("#ev-" + v); if (el && window.matchMedia("(max-width: 1023px)").matches) scrollToEl(el); if (el) flash(el); return; }
    if (a === "evsave") { const ev = EVENTS.find(e => e.id === v); if (!ev) return; if (isLockedEv(ev)) { toast(`<b>Evento exclusivo del nivel ${ev.lvl}</b><div class="text-[13px] text-mute">Gana más XP para desbloquearlo.</div>`, "lock"); return; } toggleRegistration(ev); refresh(); return; }
    if (a === "gen") { b.disabled = true; b.innerHTML = `${svg("spark")}<span>Generando…</span>`; b.classList.add("shimmer"); await sleep(1300);
      if (!A.dossierAt) award(() => { A.dossierAt = new Date().toISOString(); }, 0, "Dossier generado", "file"); else { A.dossierAt = new Date().toISOString(); save(); toast("<b>Dossier actualizado</b>", "file"); refresh(); }
      apiSaveDossier(); downloadDossier(); return; }
    if (a === "dospdf") { downloadDossier(); return; }
    if (a === "copy") { const txt = summaryText();
      const fallback = () => { const box = $("#copyFallback"); box.hidden = false; box.innerHTML = `<label for="copyTa" class="text-[13px] text-mute">Tu navegador bloqueó el portapapeles. Selecciona y copia el texto:</label><textarea id="copyTa" class="select" rows="8" readonly style="margin-top:8px;font-family:var(--f-mono);font-size:12px"></textarea>`; const ta = $("#copyTa"); ta.value = txt; ta.focus(); ta.select(); };
      try { navigator.clipboard.writeText(txt).then(() => toast("<b>Resumen copiado</b> al portapapeles", "file"), fallback); } catch (err) { fallback(); }
      return; }
  };
  /* ---- Permisos MCP: tarjeta compacta en Mi perfil que abre una ventana ---- */
  
  function permisosHTML() {
    const sc = A.scopes, scopes = PERM_SCOPES;
    return `<article class="pcard perm-full">
          <header class="pcard-h"><div><span class="pcard-k">Privacidad</span><h2 class="pcard-t">Permisos MCP</h2></div><span class="chip">${svg("shield")}Revocables</span></header>
          <div class="grid gap-2">${scopes.map(([key, ttl, h]) => `<label class="switch-row" for="scope-${key}"><span><b class="font-semibold">${ttl}</b><span class="block text-mute text-[13px]">${h}</span></span><input type="checkbox" role="switch" class="switch" id="scope-${key}" data-scope="${key}" ${sc[key] ? "checked" : ""} ${key === "profile" ? "disabled" : ""}></label>`).join("")}</div>
          <div class="resync">
            <label for="personaSel" class="pcard-k" style="color:var(--muted)">Perfil de demostración</label>
            <div class="resync-row">
              <select id="personaSel" class="select">${Object.keys(IND).map(key => `<option value="${key}" ${key === A.ind ? "selected" : ""}>${PERSONAS[key].name} · ${IND[key].role} · ${IND[key].label}</option>`).join("")}</select>
              ${act("resync", "", `${svg("link")}Sincronizar`, "btn btn-ghost btn-sm")}
            </div>
            <span class="text-[12px] text-mute">Cambiar de perfil reinicia el progreso de la demo.</span>
          </div>
          <div class="resync">
            <span class="pcard-k" style="color:var(--muted)">Tus autorizaciones</span>
            <div class="grid gap-2">${readLocal().filter(r => r.tipo === "aceptacion" || r.tipo === "cambio_permiso").slice(-3).reverse().map(r => `<div class="auth-row">${svg(r.tipo === "aceptacion" ? "check" : "shield")}<span><b>${esc(r.tipo === "aceptacion" ? "Aceptaste " + (r.documentos || []).map(d => d.documento.split(" ")[0] + " v" + d.version).join(" y ") : r.detalle || "")}</b><span class="block text-mute text-[12px]">${esc(r.fechaLocal)} · ${esc(r.formulario)} · ${r.almacenamiento === "servidor" ? "registrado en el servidor" : "registrado en este navegador"}</span></span></div>`).join("") || `<div class="text-[13px] text-mute">No hay aceptaciones guardadas en este navegador.</div>`}</div>
            <div class="flex flex-wrap gap-2"><a href="#privacidad" data-legal="privacidad" class="pill-btn">${svg("file")}Política de privacidad</a><a href="#terminos" data-legal="terminos" class="pill-btn">${svg("file")}Términos</a>${act("revoke", "", `${svg("x")}Revocar y borrar mis datos`, "btn btn-ghost btn-sm danger")}</div>
          </div>
        </article>`;
  }
  function permCardHTML() {
    const on = PERM_SCOPES.filter(([k]) => A.scopes[k]).length;
    return `<button type="button" class="pcard perm-open" data-openperm aria-haspopup="dialog">
      <span class="perm-open-h"><span class="res-open-ic" style="color:var(--t-blue);background:linear-gradient(135deg, rgba(61,107,255,.25), rgba(161,0,255,.18));border-color:rgba(61,107,255,.45)">${svg("shield")}</span><span class="min-w-0"><span class="pcard-k">Privacidad</span><span class="pcard-t" style="display:block">Permisos MCP</span><span class="res-open-flow">${on} de ${PERM_SCOPES.length} permisos activos · revocables cuando quieras</span></span></span>
      <span class="perm-pills">${PERM_SCOPES.map(([k, ttl]) => `<span class="perm-pill ${A.scopes[k] ? "on" : ""}">${svg(A.scopes[k] ? "check" : "lock")}${ttl}</span>`).join("")}</span>
      <span class="res-open-cta" style="justify-content:flex-end"><span class="btn btn-ghost btn-sm">Gestionar permisos ${svg("arrow")}</span></span>
    </button>`;
  }
  function renderPerm() { const body = $("#permBody"), st = body.scrollTop; body.innerHTML = `<div class="res-top"><button type="button" class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>${permisosHTML()}`; body.scrollTop = st; }
  function openPerm() { renderPerm(); $("#permBody").scrollTop = 0; if ($("#m-perm").hidden) openModal("perm"); }
  panel.addEventListener("click", (e) => { if (e.target.closest("[data-openperm]")) openPerm(); });
  $("#m-perm").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "resync" || (b.dataset.act === "revoke" && b.dataset.armed === "1")) closeModal($("#m-perm"));
    onAct(b);
  });
  /* ---- Resumen post-Summit: tarjeta en Mi perfil que abre una ventana ---- */
  function resumenCardHTML() {
    const acts = actions(), done = acts.filter(a => A.actions[a.id]).length;
    const when = A.dossierAt ? new Date(A.dossierAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";
    return `<button type="button" class="pcard res-open" data-openres aria-haspopup="dialog">
      <span class="res-open-ic">${svg("file")}</span>
      <span class="res-open-main"><span class="pcard-k">Resumen post-Summit</span><span class="pcard-t">Tu resumen del Summit</span><span class="res-open-flow">Evento → Insight → Conexión → Acción</span></span>
      <span class="res-open-stats"><span><b class="tabular">${A.attended.length}</b>sesiones</span><span><b class="tabular">${insights().length}</b>insights</span><span><b class="tabular">${A.connections.length}</b>conexiones</span><span><b class="tabular">${done}/${acts.length}</b>acciones</span></span>
      <span class="res-open-cta">${A.dossierAt ? `<span class="chip chip-emerald">${svg("check")}Generado · ${when}</span>` : `<span class="chip">${svg("clock")}Borrador en vivo</span>`}<span class="btn btn-primary btn-sm">Abrir resumen ${svg("arrow")}</span></span>
    </button>`;
  }
  function renderRes() {
    const body = $("#resBody"), st = body.scrollTop;
    body.innerHTML = `<div class="res-top"><button type="button" class="btn btn-ghost btn-sm" style="padding:8px;min-width:40px" data-close aria-label="Cerrar">${svg("x")}</button></div>${tabDossier()}`;
    body.scrollTop = st;
  }
  function openRes() { renderRes(); $("#resBody").scrollTop = 0; if ($("#m-res").hidden) openModal("res"); }
  panel.addEventListener("click", (e) => { if (e.target.closest("[data-openres]")) openRes(); });
  $("#m-res").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "goto") closeModal($("#m-res"));
    onAct(b);
  });
  panel.addEventListener("click", (e) => {
    const c = e.target.closest("[data-eint]");
    if (c) { const on = c.getAttribute("aria-pressed") === "true", n = $$("#pfeInts [aria-pressed='true']").length, er = $("#pfeErr");
      if (!on && n >= 5) { er.hidden = false; er.textContent = "Puedes elegir hasta 5 intereses."; return; } c.setAttribute("aria-pressed", String(!on)); er.hidden = true; return; }
    const b = e.target.closest("[data-act]"); if (b) onAct(b); });
  panel.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("g[data-act]")) { e.preventDefault(); onAct(e.target); } });
  function panelChange(e) {
    const x = e.target;
    if (x.dataset.scope) { A.scopes[x.dataset.scope] = x.checked; save(); logConsent({ tipo: "cambio_permiso", formulario: "Panel · Permisos MCP", metodo: "Interruptor accionado por el titular", titular: (A.profile && A.profile.name) || "—", detalle: `${x.closest("label").querySelector("b").textContent}: ${x.checked ? "concedido" : "revocado"}` }); toast(`<b>Permiso ${x.checked ? "concedido" : "revocado"}</b> · ${x.closest("label").querySelector("b").textContent}`, "shield"); refresh(); if (x.dataset.scope === "network" && x.checked) { const nc = $("#networkCard"); if (nc) { scrollToEl(nc); flash(nc); } } }
    if (x.dataset.action) { A.actions[x.dataset.action] = x.checked; save(); if (x.checked) toast("<b>Acción completada</b> · plan de 30 días", "check"); refresh(); }
  }
  panel.addEventListener("change", panelChange);
  $("#m-res").addEventListener("change", panelChange);
  $("#m-perm").addEventListener("change", panelChange);
  panel.addEventListener("submit", (e) => { if (e.target.id !== "chatForm") return; e.preventDefault(); const inp = $("#chatIn"); const q = inp.value; inp.value = ""; ask(q); });
  window.addEventListener("hashchange", route);
  applyLang();
  window.addEventListener("resize", fitNav);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  (function init() { const h = location.hash.slice(1); if (LEGAL_IDS.includes(h)) { renderHeader(); openLegal(h); return; } if (TAB_IDS.includes(h)) { if (A.connected) showTab(h); else if (hasSaved()) resumeSession(h); else startConnect(); } else renderHeader(); })();

  hydrate();

  /* Modo claro / oscuro */
  (function themeInit() {
    const btn = document.getElementById("themeBtn"), lbl = document.getElementById("themeLbl"); if (!btn) return;
    const sync = () => { const light = document.documentElement.classList.contains("theme-light");
      btn.setAttribute("aria-pressed", String(light)); const t = light ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
      btn.setAttribute("aria-label", t); btn.title = t; lbl.textContent = light ? "Apagar luces" : "Encender luces";
      const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", light ? "#F3EFE7" : "#0A0710"); };
    btn.addEventListener("click", () => { const light = document.documentElement.classList.toggle("theme-light");
      if (typeof prefsAllowed === "function" && prefsAllowed()) { try { localStorage.setItem("knet-theme", light ? "light" : "dark"); } catch (e) {} } sync();
      if (typeof inApp !== "undefined" && inApp && document.getElementById("netGraph")) refresh(); });
    sync();
  })();

  /* Aparición de secciones al hacer scroll (solo en la landing) */
  (function scrollReveal() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = []; document.querySelectorAll("#top > section.band > .wrap > *, #top > section.band > .wrap > div > *").forEach((el, i) => { if (el.closest(".hero-grid")) return; el.classList.add("sr"); els.push(el); });
    document.documentElement.classList.add("js-sr");
    const io = new IntersectionObserver((ents) => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    els.forEach((el, i) => { el.style.setProperty("--srd", `${(i % 3) * .08}s`); io.observe(el); });
  })();

  /* Hero: historia animada. Evento → saca el celular → entra a KNET → recorre sus funciones */
  (function heroStory() {
    const st = document.getElementById("heroStory"); if (!st) return;
    const scr = [...st.querySelectorAll(".hd-s")], dots = [...st.querySelectorAll(".hd-dots i")], cap = document.getElementById("stCap"), step = document.getElementById("stStep"), bar = document.getElementById("stBar");
    const fit = st.querySelector(".st-fit"), dev = st.querySelector(".st-device");
    const T = (x) => (window.KNET_I18N ? window.KNET_I18N.t(x) : x);
    const resize = () => { const w = dev.offsetWidth; if (w) st.style.setProperty("--k", (w / 280).toFixed(4)); };
    new ResizeObserver(resize).observe(dev); resize();
    const APP = ["Tu agenda con IA", "Tu match ideal", "Misiones en el recinto", "El recinto en 3D", "Tu Dossier al final"];
    const TL = [["event", 3200, "Estás en el evento", 1], ["phone", 2400, "Sacas tu celular", 2], ["dive", 1300, "Entras a KNET", 3]]
      .concat(APP.map((c, i) => ["app", 3000, c, 4, i])).concat([["out", 1400, "Así de simple", 4]]);
    let k = -1, timer = null;
    const setScreen = (n) => { scr.forEach((x, i) => { x.classList.toggle("on", i === n); }); dots.forEach((d, i) => d.classList.toggle("on", i === n)); };
    const next = () => {
      k = (k + 1) % TL.length; const [ph, dur, c, n, sc] = TL[k];
      st.dataset.phase = ph; cap.textContent = T(c); step.textContent = n;
      if (ph === "app") setScreen(sc); else if (ph === "event") setScreen(-1);
      bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth; bar.style.transition = `transform ${dur}ms linear`; bar.style.transform = "scaleX(1)";
      timer = setTimeout(next, dur);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { st.dataset.phase = "app"; setScreen(0); cap.textContent = T("Tu agenda con IA"); step.textContent = 4; return; }
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { if (!timer) next(); } else { clearTimeout(timer); timer = null; k = -1; } }, { threshold: .2 });
    io.observe(st);
  })();

  /* Backend: sincroniza al arrancar (sin bloquear la landing ni el 3D) y al recuperar la red */
  syncFromApi();
  window.addEventListener("online", () => syncFromApi());
}
