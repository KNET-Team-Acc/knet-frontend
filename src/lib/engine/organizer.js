/**
 * Panel de creador de eventos (knet-frontend#21): «Mis eventos › Mis eventos creados», solo para cuentas con
 * accountRole organizer/admin. Asistente por pasos contra /api/admin/* (api.admin en src/services/api.js):
 *   1 Detalles · 2 Días y agenda · 3 Charlas · 4 Speakers · 5 Misiones · 6 Recinto 3D · 7 Vista previa y publicar.
 * Un admin elige entre «Mis eventos» y «Todos los eventos» (st.scope): ve y edita los de cualquier organizador; los del
 * catálogo sembrado (catalog: true) salen en solo lectura porque db:seed los reescribe en cada despliegue.
 * Un admin también añade eventos reales externos al catálogo (curated: web oficial obligatoria, sin charlas ni
 * misiones: CAT_STEPS), genera recintos (venueGen.js: zonas → plano 3D, también desde una descripción) y tiene un
 * asistente de IA (POST /api/admin/ai/assist) que propone contenido; cada propuesta se aplica a mano.
 * Cada paso guarda en el servidor (borrador). Publicar lo hace visible en GET /api/events: el motor lo integra
 * como evento hosted (mergeEvents) con su agenda, misiones y recinto.
 *
 * El motor (knetApp.js) crea el panel con createOrganizer(ctx) y le delega los clics, envíos y cambios de
 * #appPanel que tengan data-org. Todos los textos van por ctx.t / ctx.tf (claves org.* de I18N en navigation.js).
 */

import { MAX_ZONES, VENUE_GROUNDS, ZONE_SIZES, ZONE_TYPES, cleanZone, generateVenue, parseVenueBrief, venuePlanSVG, zonesFromVenue } from "./venueGen.js";

export const ORG_STEPS = ["details", "days", "sessions", "speakers", "missions", "venue", "preview"];
// Evento real externo del catálogo (curated): su agenda la arma el motor, como la de los eventos sembrados
export const CAT_STEPS = ["details", "days", "speakers", "venue", "preview"];
const AI_HISTORY = 10;
const KINDS = ["Keynote", "Panel", "Taller", "Charla", "Networking"];
const MISSION_TYPES = ["presencial", "networking", "contenido", "quiz"];
const FORMATS = ["Presencial", "Híbrido", "Virtual"];
const DEFAULT_INFO = { tone: ["#1E1452", "#0E3A4A"], accent: "#BE82FF", lema: "", para: "", formato: ["Presencial"], agenda: [], llevas: [] };
const URL_RE = /^https?:\/\/[^\s"'<>`]+$/i;
const HEX_RE = /^#[0-9a-f]{6}$/i;

const clone = (o) => JSON.parse(JSON.stringify(o));
// JSON con las claves ordenadas: PostgreSQL (jsonb) no conserva el orden de las claves del recinto
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v));
const lines = (v, max, len) => String(v || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, max).map((x) => x.slice(0, len));
const list = (v, max, len) => String(v || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, max).map((x) => x.slice(0, len));
// Lo que se guarda en la ficha va en español (la fuente): el inglés lo aplica el diccionario al mostrarlo
const daysTxt = (n) => (n === 1 ? "1 día" : `${n} días`);
const hashStr = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

/** «10–11 may 2027», «30 may – 2 jun 2027» o «10 may 2027» a partir de los días AAAA-MM-DD */
export function dateLabelOf(days, locale = "es-CO") {
  if (!days.length) return "";
  const d = (iso) => new Date(`${iso}T12:00:00`);
  const a = d(days[0]), b = d(days[days.length - 1]);
  const day = (x) => x.getDate(), mon = (x) => x.toLocaleDateString(locale, { month: "short" }).replace(".", ""), yr = (x) => x.getFullYear();
  if (days.length === 1) return `${day(a)} ${mon(a)} ${yr(a)}`;
  if (a.getMonth() === b.getMonth() && yr(a) === yr(b)) return `${day(a)}–${day(b)} ${mon(a)} ${yr(a)}`;
  return `${day(a)} ${mon(a)}${yr(a) === yr(b) ? "" : " " + yr(a)} – ${day(b)} ${mon(b)} ${yr(b)}`;
}

export function createOrganizer(ctx) {
  const { api, ApiError, isOffline, t, tf, esc, svg, toast } = ctx;
  // Plural: «org.x.one» para 1 (p. ej. «1 charla»), «org.x» para el resto
  const tn = (k, n) => tf(n === 1 ? `${k}.one` : k, n);
  const st = { list: null, loading: false, cur: null, step: 0, busy: false, msg: null, ask: null, days: null, agenda: null, sDay: 0, dirty: false, scope: "mine", vz: null, vground: null, ai: { msgs: [], busy: false, draft: "" } };
  const steps = () => (st.cur && st.cur.curated ? CAT_STEPS : ORG_STEPS);
  const stepIx = (k) => steps().indexOf(k);
  const allScope = () => st.scope === "all" && ctx.isAdmin();
  const notMine = (e) => !!(e && e.owner && e.owner.id && e.owner.id !== ctx.myId());
  // Repinta el panel (lo escrito y no guardado se descarta: dirty evita que un refresh() del motor lo borre antes)
  const rr = () => { st.dirty = false; ctx.rerender(); };

  /* ---------- Errores de la API en mensajes claros ---------- */
  function errText(e) {
    if (isOffline(e)) return t("org.err.offline");
    if (e instanceof ApiError) {
      const b = e.body || {};
      if (e.status === 403 && b.error === "forbidden_role") return t("org.err.role");
      if (e.status === 403) return t("org.err.owner");
      if (e.status === 401) return t("org.err.session");
      if (e.status === 404) return t("org.err.gone");
      if (b.error === "validation_error" && Array.isArray(b.issues) && b.issues.length) return b.issues.map((i) => i.message).slice(0, 3).join(" · ");
      if (b.message) return b.message;
    }
    return t("org.err.generic");
  }
  const setMsg = (type, text) => { st.msg = text ? { type, text } : null; };
  /* El aviso se pinta en su sitio, sin repintar el panel: así no se pierde lo escrito en el formulario */
  function paintMsg() {
    const card = document.getElementById("orgCard"); if (!card) return;
    card.querySelectorAll(".org-msg[data-live]").forEach((x) => x.remove());
    const at = card.querySelector(".org-step-t") || card.querySelector(".pcard-h");
    if (at && st.msg) at.insertAdjacentHTML("afterend", msgHTML());
  }
  /* Error de validación del formulario: se avisa y se queda lo escrito */
  const fail = (text) => { setMsg("err", text); paintMsg(); };
  function lock(on) {
    const card = document.getElementById("orgCard"); if (!card) return;
    card.querySelectorAll("button, input, select, textarea").forEach((x) => { if (on) { if (!x.disabled) { x.disabled = true; x.dataset.orgLock = "1"; } } else if (x.dataset.orgLock) { x.disabled = false; delete x.dataset.orgLock; } });
    card.setAttribute("aria-busy", String(on));
  }
  /* Llama a la API con el panel bloqueado. Bien → repinta con lo que devolvió el servidor; mal → avisa sin repintar */
  async function run(fn, okText) {
    if (st.busy) return false;
    st.busy = true; setMsg(null); lock(true);
    try { await fn(); const ok = typeof okText === "function" ? okText() : okText; setMsg(ok ? "ok" : null, ok); st.busy = false; rr(); return true; }
    catch (e) {
      st.busy = false; lock(false); setMsg("err", errText(e)); paintMsg();
      if (e instanceof ApiError && e.status === 403 && (e.body || {}).error === "forbidden_role") ctx.onRoleLost();
      return false;
    }
  }
  const adopt = (r) => { st.cur = r.event; st.days = null; st.agenda = null; st.vz = null; st.vground = null; };

  /* ---------- Carga ---------- */
  async function loadList() {
    if (st.loading) return; st.loading = true;
    try { st.list = (await api.admin.listEvents({ all: allScope() })).events || []; setMsg(null); }
    catch (e) { st.list = st.list || []; setMsg("err", errText(e)); if (e instanceof ApiError && e.status === 403) ctx.onRoleLost(); }
    finally { st.loading = false; rr(); }
  }
  function open() { if (st.list === null && !st.cur) loadList(); }
  function startNew(curated = false) { st.cur = { id: null, name: "", city: "", tags: [], industries: [], description: "", info: null, days: [], sessions: [], speakers: [], missions: [], curated: !!curated && ctx.isAdmin() }; st.step = 0; st.vz = null; st.vground = null; setMsg(null); }
  async function edit(id) {
    await run(async () => { adopt(await api.admin.getEvent(id)); st.step = 0; });
  }
  function backToList() { st.cur = null; st.step = 0; setMsg(null); st.ask = null; loadList(); }

  /* ---------- Vistas ---------- */
  const info = () => ({ ...DEFAULT_INFO, ...clone(st.cur.info || {}) });
  const field = (label, html, wide) => `<label class="gf-f ${wide ? "gf-wide" : ""}"><span>${label}</span>${html}</label>`;
  const statusChip = (s) => s === "published" ? `<span class="chip chip-emerald">${svg("check")}${t("org.published")}</span>` : `<span class="chip">${svg("pen")}${t("org.draft")}</span>`;
  const msgHTML = () => st.msg ? `<p data-live class="org-msg ${st.msg.type === "err" ? "is-err" : "is-ok"}" role="${st.msg.type === "err" ? "alert" : "status"}">${svg(st.msg.type === "err" ? "info" : "check")}<span>${esc(st.msg.text)}</span></p>` : "";
  const busyAttr = () => (st.busy ? "disabled aria-busy=\"true\"" : "");

  function itemActions(e) {
    if (e.catalog) return `<span class="chip" title="${esc(t("org.catalogHint"))}">${svg("lock")}${t("org.catalog")}</span>`;
    return `${e.curated ? `<span class="chip chip-cyan" title="${esc(t("org.cat.hint"))}">${svg("globe")}${t("org.cat.chip")}</span>` : ""}${statusChip(e.status)}<button type="button" class="btn btn-ghost btn-sm" data-org="edit" data-v="${esc(e.id)}" ${busyAttr()}>${svg("pen")}${t("org.edit")}</button>
              <button type="button" class="pill-btn ${st.ask === "del:" + e.id ? "danger" : ""}" data-org="del" data-v="${esc(e.id)}" ${busyAttr()}>${st.ask === "del:" + e.id ? t("org.delSure") : t("org.del")}</button>`;
  }
  function listHTML() {
    const evs = st.list || [], all = allScope();
    return `<article class="pcard" id="orgCard">
      <header class="pcard-h"><div><span class="pcard-k">${t(ctx.isAdmin() ? "org.kickerAdmin" : "org.kicker")}</span><h2 class="pcard-t">${t(all ? "org.titleAll" : "org.title")}</h2><p class="text-mute text-[14px]" style="margin-top:4px">${t(all ? "org.ledeAll" : "org.lede")}</p></div>
        <div class="org-head-a">${ctx.isAdmin() ? `<button type="button" class="btn btn-ghost btn-sm" data-org="newCat" ${busyAttr()}>${svg("globe")}${t("org.cat.add")}</button>` : ""}<button type="button" class="btn btn-primary btn-sm" data-org="new" ${busyAttr()}>${svg("spark")}${t("org.create")}</button></div></header>
      ${ctx.isAdmin() ? `<div class="me-seg org-scope" role="tablist" aria-label="${t("org.scopeLbl")}">${["mine", "all"].map((k) => `<button type="button" role="tab" class="me-seg-b" data-org="scope" data-v="${k}" aria-selected="${st.scope === k}" ${busyAttr()}>${svg(k === "mine" ? "pen" : "globe")}${t("org.scope." + k)}</button>`).join("")}</div>` : ""}
      ${msgHTML()}
      ${st.list === null || st.loading && !evs.length ? `<div class="dempty">${svg("clock")} ${t("org.loading")}</div>`
        : evs.length ? `<ul class="org-list">${evs.map((e) => `<li class="org-item" data-org-ev="${esc(e.id)}">
            <span class="org-cover" style="--a:${esc((e.info && e.info.tone && e.info.tone[0]) || "#1E1452")};--b:${esc((e.info && e.info.tone && e.info.tone[1]) || "#0E3A4A")}" aria-hidden="true">${esc((e.name || "?").slice(0, 1).toUpperCase())}</span>
            <div class="min-w-0"><div class="org-item-t">${esc(e.name)}</div>
              <div class="me-meta">${all && notMine(e) ? `<span class="org-owner">${svg("users")}${esc(tf("org.by", e.owner.name || e.owner.email || "?"))}</span>` : ""}<span>${svg("pin")}${esc(e.city)}</span><span>${svg("calendar")}${esc(e.dateLabel || t("org.noDates"))}</span><span>${svg("mic")}${tn("org.countTalks", e.counts ? e.counts.sessions : 0)}</span><span>${svg("users")}${tn("org.countRegs", e.counts ? e.counts.registrations : 0)}</span></div></div>
            <div class="org-item-a">${itemActions(e)}</div>
          </li>`).join("")}</ul>`
        : `<div class="me-empty">${svg("calendar")}<span>${t(all ? "org.emptyAll" : "org.empty")}</span><button type="button" class="pill-btn" data-org="new">${t("org.create")} ${svg("arrow")}</button></div>`}
    </article>`;
  }

  function stepperHTML() {
    const saved = !!st.cur.id;
    return `<ol class="org-steps" aria-label="${t("org.stepsLbl")}">${steps().map((k, i) => `<li><button type="button" class="org-step ${i === st.step ? "is-cur" : ""} ${done(k) ? "is-done" : ""}" data-org="step" data-v="${i}" ${saved || i === 0 ? "" : "disabled"} ${i === st.step ? 'aria-current="step"' : ""}><span class="org-step-n tabular">${i + 1}</span><span class="org-step-l">${t("org.step." + k)}</span></button></li>`).join("")}</ol>`;
  }
  function done(k) {
    const c = st.cur; if (!c || !c.id) return false;
    return { details: !!c.description, days: c.days.length > 0, sessions: c.sessions.length > 0, speakers: c.speakers.length > 0, missions: c.missions.length > 0, venue: !!c.venue, preview: c.status === "published" }[k];
  }

  function detailsHTML() {
    const c = st.cur, i = info(), cities = ctx.cities();
    const inds = Object.entries(ctx.industries());
    return `<form class="ne-form org-form" data-org-form="details" novalidate>
      ${field(t("org.f.name"), `<input class="input" name="name" maxlength="120" required value="${esc(c.name || "")}" placeholder="${t("org.f.namePh")}">`, true)}
      ${field(t("org.f.city"), `<select class="input" name="city">${cities.map((n) => `<option ${n === c.city ? "selected" : ""}>${esc(n)}</option>`).join("")}${c.city && !cities.includes(c.city) ? `<option selected>${esc(c.city)}</option>` : ""}</select>`)}
      ${field(t("org.f.venue"), `<input class="input" name="venueName" maxlength="160" value="${esc(c.venueName || "")}" placeholder="${t("org.f.venuePh")}">`)}
      ${field(t("org.f.format"), `<select class="input" name="format">${FORMATS.map((f) => `<option value="${f}" ${i.formato[0] === f ? "selected" : ""}>${t("org.fmt." + f)}</option>`).join("")}</select>`)}
      ${field(c.curated ? t("org.cat.url") : `${t("org.f.url")} <span class="text-mute">(${t("org.optional")})</span>`, `<input class="input" name="sourceUrl" type="url" maxlength="500" value="${esc(c.sourceUrl || "")}" placeholder="https://" ${c.curated ? "required" : ""}>`)}
      ${c.curated ? `<p class="gf-wide org-msg is-cat" role="note">${svg("globe")}<span>${t("org.cat.note")}</span></p>` : ""}
      ${field(t("org.f.desc"), `<textarea class="input" name="description" rows="3" maxlength="600" placeholder="${t("org.f.descPh")}">${esc(c.description || "")}</textarea>`, true)}
      ${field(t("org.f.para"), `<input class="input" name="para" maxlength="300" value="${esc(i.para)}" placeholder="${t("org.f.paraPh")}">`, true)}
      ${field(`${t("org.f.tags")} <span class="text-mute">(${t("org.f.tagsHint")})</span>`, `<input class="input" name="tags" maxlength="400" value="${esc((c.tags || []).join(", "))}" placeholder="Datos, IA, Cloud">`, true)}
      <fieldset class="gf-f gf-wide org-inds"><legend>${t("org.f.inds")}</legend><div class="org-chips">${inds.map(([k, d]) => `<label class="org-chk"><input type="checkbox" name="ind" value="${esc(k)}" ${(c.industries || []).includes(k) ? "checked" : ""}><span>${esc(d.label)}</span></label>`).join("")}</div></fieldset>
      ${field(`${t("org.f.llevas")} <span class="text-mute">(${t("org.f.oneLine")})</span>`, `<textarea class="input" name="llevas" rows="3" maxlength="1200">${esc(i.llevas.join("\n"))}</textarea>`, true)}
      <fieldset class="gf-f gf-wide"><legend>${t("org.f.cover")}</legend>
        <div class="org-cover-row"><span class="org-cover org-cover-lg" id="orgCoverPrev" style="--a:${esc(i.tone[0])};--b:${esc(i.tone[1])};--c:${esc(i.accent)}" aria-hidden="true">${esc((c.name || "K").slice(0, 1).toUpperCase())}</span>
          <label class="org-color"><span>${t("org.f.tone1")}</span><input type="color" name="tone0" value="${esc(i.tone[0])}"></label>
          <label class="org-color"><span>${t("org.f.tone2")}</span><input type="color" name="tone1" value="${esc(i.tone[1])}"></label>
          <label class="org-color"><span>${t("org.f.accent")}</span><input type="color" name="accent" value="${esc(i.accent)}"></label></div></fieldset>
      <div class="gf-wide gf-form-foot"><button type="submit" class="btn btn-primary" ${busyAttr()}>${svg("arrow")}${c.id ? t("org.saveNext") : t("org.createDraft")}</button></div>
    </form>`;
  }

  function daysHTML() {
    const c = st.cur, days = st.days || c.days.slice(), agenda = st.agenda || info().agenda.map((r) => r.slice());
    if (!st.days) st.days = days; if (!st.agenda) st.agenda = agenda;
    return `<form class="org-form" data-org-form="days" novalidate>
      <div class="av-lbl">${t("org.days.title")}</div>
      <p class="text-mute text-[13px]">${t("org.days.hint")}</p>
      <div class="org-rows">${days.map((d, i) => `<div class="org-row"><span class="org-row-n tabular">${tf("org.dayN", i + 1)}</span><input class="input" type="date" name="day" value="${esc(d)}" aria-label="${tf("org.dayN", i + 1)}" required><button type="button" class="btn btn-ghost btn-sm" data-org="dayDel" data-v="${i}" aria-label="${tf("org.days.del", i + 1)}">${svg("x")}</button></div>`).join("") || `<div class="dempty">${svg("calendar")} ${t("org.days.none")}</div>`}</div>
      <button type="button" class="pill-btn" data-org="dayAdd" ${days.length >= 14 ? "disabled" : ""}>${svg("calendar")}${t("org.days.add")}</button>
      <div class="av-lbl" style="margin-top:18px">${t("org.agenda.title")}</div>
      <p class="text-mute text-[13px]">${t("org.agenda.hint")}</p>
      <div class="org-rows">${agenda.map((r, i) => `<div class="org-row org-row-3"><input class="input" name="ag0" maxlength="40" value="${esc(r[0])}" placeholder="${t("org.agenda.when")}" aria-label="${t("org.agenda.when")}"><input class="input" name="ag1" maxlength="80" value="${esc(r[1])}" placeholder="${t("org.agenda.what")}" aria-label="${t("org.agenda.what")}"><input class="input" name="ag2" maxlength="200" value="${esc(r[2])}" placeholder="${t("org.agenda.detail")}" aria-label="${t("org.agenda.detail")}"><button type="button" class="btn btn-ghost btn-sm" data-org="agDel" data-v="${i}" aria-label="${t("org.agenda.del")}">${svg("x")}</button></div>`).join("")}</div>
      <button type="button" class="pill-btn" data-org="agAdd" ${agenda.length >= 12 ? "disabled" : ""}>${svg("clock")}${t("org.agenda.add")}</button>
      <div class="gf-form-foot"><button type="submit" class="btn btn-primary" ${busyAttr()}>${svg("arrow")}${t("org.saveNext")}</button></div>
    </form>`;
  }
  /* Lo escrito en el paso 2 antes de agregar o quitar filas (si no, se perdería al repintar) */
  function readDaysForm(f) {
    if (!f) return;
    st.days = [...f.querySelectorAll("[name=day]")].map((x) => x.value);
    const a = [...f.querySelectorAll("[name=ag0]")], b = [...f.querySelectorAll("[name=ag1]")], c = [...f.querySelectorAll("[name=ag2]")];
    st.agenda = a.map((x, i) => [x.value, b[i].value, c[i].value]);
  }

  function sessionsHTML() {
    const c = st.cur;
    if (!c.days.length) return `<div class="me-empty">${svg("calendar")}<span>${t("org.ses.noDays")}</span><button type="button" class="pill-btn" data-org="step" data-v="1">${t("org.step.days")} ${svg("arrow")}</button></div>`;
    const day = Math.min(st.sDay, c.days.length - 1), mine = c.sessions.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
    return `<div class="me-seg org-dayseg" role="tablist" aria-label="${t("org.ses.days")}">${c.days.map((d, i) => `<button type="button" role="tab" class="me-seg-b" data-org="sday" data-v="${i}" aria-selected="${i === day}">${tf("org.dayN", i + 1)} · ${esc(ctx.dayTxt(d))}</button>`).join("")}</div>
      <ul class="org-list">${mine.map((s) => `<li class="org-item org-item-s"><span class="time tabular">${esc(s.time)}</span><div class="min-w-0"><div class="org-item-t">${esc(s.title)}</div><div class="me-meta"><span class="chip">${esc(t("org.kind." + s.kind))}</span>${s.room ? `<span>${svg("pin")}${esc(s.room)}</span>` : ""}${s.speaker ? `<span>${svg("mic")}${esc(s.speaker)}</span>` : ""}</div></div>
        <button type="button" class="btn btn-ghost btn-sm" data-org="sesDel" data-v="${s.id}" aria-label="${tf("org.ses.del", s.title)}" ${busyAttr()}>${svg("x")}</button></li>`).join("") || `<li class="dempty">${svg("mic")} ${t("org.ses.none")}</li>`}</ul>
      <form class="ne-form org-form" data-org-form="session" novalidate>
        <div class="av-lbl gf-wide">${t("org.ses.add")}</div>
        <input type="hidden" name="day" value="${day}">
        ${field(t("org.f.time"), `<input class="input" type="time" name="time" value="09:00" required>`)}
        ${field(t("org.f.kind"), `<select class="input" name="kind">${KINDS.map((k) => `<option value="${k}">${t("org.kind." + k)}</option>`).join("")}</select>`)}
        ${field(t("org.f.title"), `<input class="input" name="title" maxlength="160" required placeholder="${t("org.f.titlePh")}">`, true)}
        ${field(t("org.f.room"), `<input class="input" name="room" maxlength="80" placeholder="${t("org.f.roomPh")}">`)}
        ${field(t("org.f.speaker"), `<input class="input" name="speaker" maxlength="120" list="orgSpk"><datalist id="orgSpk">${c.speakers.map((p) => `<option value="${esc(p.name)}">`).join("")}</datalist>`)}
        ${field(t("org.f.topic"), `<select class="input" name="tag"><option value="">${t("org.f.noTopic")}</option>${(c.tags || []).map((x) => `<option>${esc(x)}</option>`).join("")}</select>`)}
        <div class="gf-wide gf-form-foot"><button type="submit" class="btn btn-primary" ${busyAttr()}>${svg("spark")}${t("org.ses.addBtn")}</button></div>
      </form>`;
  }

  function speakersHTML() {
    const c = st.cur;
    return `<ul class="org-list">${c.speakers.map((p) => `<li class="org-item"><span class="org-spk">${p.avatar ? ctx.avatarSVG(p.avatar, 44) : `<span class="team-avatar" style="width:44px;height:44px;font-size:15px">${esc(ctx.initialsOf(p.name))}</span>`}</span>
        <div class="min-w-0"><div class="org-item-t">${esc(p.name)}</div><div class="text-[13px] text-mute">${esc([p.role, p.org].filter(Boolean).join(" · "))}</div>${p.talk ? `<div class="text-[13px]">${esc(p.talk)}</div>` : ""}</div>
        <button type="button" class="btn btn-ghost btn-sm" data-org="spkDel" data-v="${p.id}" aria-label="${tf("org.spk.del", p.name)}" ${busyAttr()}>${svg("x")}</button></li>`).join("") || `<li class="dempty">${svg("mic")} ${t("org.spk.none")}</li>`}</ul>
      <form class="ne-form org-form" data-org-form="speaker" novalidate>
        <div class="av-lbl gf-wide">${t("org.spk.add")}</div>
        ${field(t("org.f.spkName"), `<input class="input" name="name" maxlength="120" required>`)}
        ${field(t("org.f.spkRole"), `<input class="input" name="role" maxlength="120">`)}
        ${field(t("org.f.spkOrg"), `<input class="input" name="org" maxlength="120">`)}
        ${field(t("org.f.spkTalk"), `<input class="input" name="talk" maxlength="200">`)}
        ${field(t("org.f.spkBio"), `<textarea class="input" name="bio" rows="3" maxlength="800"></textarea>`, true)}
        ${field(t("org.f.avatar"), `<select class="input" name="avatar"><option value="">${t("org.av.initials")}</option>${ctx.avatarStyles().map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join("")}</select>`)}
        <div class="gf-wide gf-form-foot"><button type="submit" class="btn btn-primary" ${busyAttr()}>${svg("users")}${t("org.spk.addBtn")}</button></div>
      </form>`;
  }

  function missionsHTML() {
    const c = st.cur;
    return `<p class="text-mute text-[13px]">${t("org.mis.hint")}</p>
      <ul class="org-list">${c.missions.map((m) => `<li class="org-item"><span class="ico-tile" style="width:40px;height:40px;background:rgba(61,107,255,.1);color:var(--t-blue)">${svg(m.icon)}</span>
        <div class="min-w-0"><div class="org-item-t">${esc(m.title)}</div><div class="text-[13px] text-mute">${esc(t("org.mtype." + ((m.tags || [])[0] || "presencial")))}${m.subtitle ? " · " + esc(m.subtitle) : ""} · +${m.xp} XP</div></div>
        <button type="button" class="btn btn-ghost btn-sm" data-org="misDel" data-v="${esc(m.code)}" aria-label="${tf("org.mis.del", m.title)}" ${busyAttr()}>${svg("x")}</button></li>`).join("") || `<li class="dempty">${svg("trophy")} ${t("org.mis.none")}</li>`}</ul>
      <form class="ne-form org-form" data-org-form="mission" novalidate>
        <div class="av-lbl gf-wide">${t("org.mis.add")}</div>
        ${field(t("org.f.mtype"), `<select class="input" name="type">${MISSION_TYPES.map((k) => `<option value="${k}">${t("org.mtype." + k)}</option>`).join("")}</select>`)}
        ${field(t("org.f.xp"), `<input class="input" type="number" name="xp" min="10" max="500" step="10" value="100" required>`)}
        ${field(t("org.f.mtitle"), `<input class="input" name="title" maxlength="120" required placeholder="${t("org.f.mtitlePh")}">`, true)}
        ${field(t("org.f.cond"), `<input class="input" name="condition" maxlength="200" placeholder="${t("org.f.condPh")}">`, true)}
        <div class="gf-wide gf-form-foot"><button type="submit" class="btn btn-primary" ${busyAttr()}>${svg("trophy")}${t("org.mis.addBtn")}</button></div>
      </form>`;
  }

  /* Generador: zonas editables (st.vz) → plano 3D. Se inicia con las del recinto guardado o con un recinto base */
  const vzOf = () => {
    if (!st.vz) st.vz = st.cur.venue ? zonesFromVenue(st.cur.venue) : [cleanZone({ type: "stage", size: "l" }), cleanZone({ type: "booths", size: "m" }), cleanZone({ type: "lounge", size: "m" })];
    if (!st.vground) st.vground = (st.cur.venue && VENUE_GROUNDS.includes(st.cur.venue.ground)) ? st.cur.venue.ground : "conv";
    return st.vz;
  };
  function readVgen(f) {
    if (!f) return;
    const ty = [...f.querySelectorAll("[name=vzType]")], nm = [...f.querySelectorAll("[name=vzName]")], sz = [...f.querySelectorAll("[name=vzSize]")];
    st.vz = ty.map((x, i) => cleanZone({ type: x.value, name: nm[i].value, size: sz[i].value, description: (st.vz && st.vz[i] && st.vz[i].type === x.value) ? st.vz[i].description : "" }));
    if (f.vground) st.vground = f.vground.value;
  }
  function vgenHTML() {
    const zs = vzOf(), c = st.cur;
    return `<section class="org-vgen" aria-labelledby="orgVgT">
        <div class="av-lbl" id="orgVgT">${t("org.vg.title")}</div>
        <p class="text-mute text-[13px]">${t("org.vg.hint")}</p>
        <form class="org-form org-vbrief" data-org-form="vbrief" novalidate>
          <textarea class="input" name="brief" rows="2" maxlength="600" placeholder="${t("org.vg.briefPh")}" aria-label="${t("org.vg.brief")}"></textarea>
          <button type="submit" class="btn btn-ghost btn-sm" ${busyAttr()}>${svg("bot")}${t("org.vg.propose")}</button>
        </form>
        <form class="org-form" data-org-form="vgen" novalidate>
          <div class="org-rows">${zs.map((z, i) => `<div class="org-row org-row-z">
            <select class="input" name="vzType" aria-label="${tf("org.vg.typeN", i + 1)}">${ZONE_TYPES.map((k) => `<option value="${k}" ${z.type === k ? "selected" : ""}>${t("org.vg.type." + k)}</option>`).join("")}</select>
            <input class="input" name="vzName" maxlength="60" value="${esc(z.name)}" aria-label="${tf("org.vg.nameN", i + 1)}">
            <select class="input" name="vzSize" aria-label="${tf("org.vg.sizeN", i + 1)}">${ZONE_SIZES.map((k) => `<option value="${k}" ${z.size === k ? "selected" : ""}>${t("org.vg.size." + k)}</option>`).join("")}</select>
            <button type="button" class="btn btn-ghost btn-sm" data-org="vzDel" data-v="${i}" aria-label="${tf("org.vg.del", z.name)}" ${zs.length <= 1 ? "disabled" : ""}>${svg("x")}</button></div>`).join("")}</div>
          <div class="org-vgen-foot">
            <button type="button" class="pill-btn" data-org="vzAdd" ${zs.length >= MAX_ZONES ? "disabled" : ""}>${svg("layers")}${t("org.vg.add")}</button>
            <label class="org-vground"><span>${t("org.vg.ground")}</span><select class="input" name="vground">${VENUE_GROUNDS.map((k) => `<option value="${k}" ${st.vground === k ? "selected" : ""}>${t("org.vg.g." + k)}</option>`).join("")}</select></label>
            <button type="submit" class="btn btn-primary btn-sm" ${busyAttr()}>${svg("spark")}${c.venue ? t("org.vg.regen") : t("org.vg.gen")}</button>
          </div>
        </form>
      </section>`;
  }
  function venueHTML() {
    const c = st.cur, tpls = ctx.venueTemplates(), curKey = c.venue ? tpls.find(([, , v]) => canon(v) === canon(c.venue)) : null;
    return `${c.venue ? `<figure class="org-vprev">${venuePlanSVG(c.venue, esc, t("org.vg.planLbl"))}<figcaption class="text-[12.5px] text-mute">${curKey ? tf("org.vg.planTpl", curKey[1]) : t("org.vg.planGen")} · ${tn("org.ven.zones", c.venue.z.length)}</figcaption></figure>` : ""}
      ${vgenHTML()}
      <div class="av-lbl" style="margin-top:18px">${t("org.vg.tpls")}</div>
      <p class="text-mute text-[13px]">${t("org.ven.hint")}</p>
      <div class="org-venues" role="radiogroup" aria-label="${t("org.step.venue")}">
        ${tpls.map(([k, label, v]) => `<button type="button" role="radio" class="org-venue ${curKey && curKey[0] === k ? "is-on" : ""}" aria-checked="${!!(curKey && curKey[0] === k)}" data-org="venue" data-v="${esc(k)}" ${busyAttr()}>
          <span class="org-venue-k">${svg("layers")}${esc(label)}</span><span class="text-[12.5px] text-mute">${tn("org.ven.zones", v.z.length)}</span>
          <span class="org-venue-z">${v.z.map((z) => `<span class="chip">${esc(z[0])}</span>`).join("")}</span></button>`).join("")}
        <button type="button" role="radio" class="org-venue ${!c.venue ? "is-on" : ""}" aria-checked="${!c.venue}" data-org="venue" data-v="" ${busyAttr()}><span class="org-venue-k">${svg("x")}${t("org.ven.none")}</span><span class="text-[12.5px] text-mute">${t("org.ven.noneHint")}</span></button>
      </div>
`;
  }

  function missing() {
    const c = st.cur, m = [];
    if (!c.description) m.push(t("org.miss.desc"));
    if (!c.info) m.push(t("org.miss.info"));
    if (!c.days.length) m.push(t("org.miss.days"));
    if (c.curated) { if (!c.sourceUrl) m.push(t("org.miss.url")); }
    else if (!c.sessions.length) m.push(t("org.miss.sessions"));
    return m;
  }
  function previewHTML() {
    const c = st.cur, i = info(), miss = missing(), pub = c.status === "published";
    const row = (ok, label, k) => `<li class="${ok ? "ok" : ""}">${svg(ok ? "check" : "info")}<span>${label}</span>${ok ? "" : `<button type="button" class="gf-link" data-org="step" data-v="${k}">${t("org.fix")}</button>`}</li>`;
    return `<div class="org-prev" style="--a:${esc(i.tone[0])};--b:${esc(i.tone[1])};--c:${esc(i.accent)}">
        ${statusChip(c.status)}<h3 class="font-display font-bold text-xl">${esc(c.name)}</h3>
        <div class="me-meta"><span>${svg("pin")}${esc(c.city)}${c.venueName ? " · " + esc(c.venueName) : ""}</span><span>${svg("calendar")}${esc(c.dateLabel || t("org.noDates"))}</span></div>
        <p>${esc(c.description || "")}</p>
        <div class="org-prev-tags">${(c.tags || []).map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>
      </div>
      <ul class="org-check">
        ${row(!!c.description && !!c.info, t("org.chk.details"), stepIx("details"))}${c.curated ? row(!!c.sourceUrl, t("org.chk.url"), stepIx("details")) : ""}${row(c.days.length > 0, tn("org.chk.days", c.days.length), stepIx("days"))}${c.curated ? "" : row(c.sessions.length > 0, tn("org.chk.sessions", c.sessions.length), stepIx("sessions"))}
        ${row(c.speakers.length > 0, tn("org.chk.speakers", c.speakers.length), stepIx("speakers"))}${c.curated ? "" : row(c.missions.length > 0, tn("org.chk.missions", c.missions.length), stepIx("missions"))}${row(!!c.venue, c.venue ? t("org.chk.venue") : t("org.chk.noVenue"), stepIx("venue"))}
      </ul>
      ${miss.length && !pub ? `<p class="org-msg is-err" role="status">${svg("info")}<span>${tf("org.missing", miss.join(", "))}</span></p>` : ""}
      <div class="gf-form-foot">${pub ? `<button type="button" class="btn btn-ghost" data-org="unpublish" ${busyAttr()}>${t("org.unpublish")}</button><button type="button" class="btn btn-primary" data-org="explore">${svg("map")}${t("org.seeExplore")}</button>`
        : `<button type="button" class="btn btn-primary" data-org="publish" ${miss.length || st.busy ? "disabled" : ""}>${svg("check")}${t("org.publish")}</button>`}</div>`;
  }

  /* ---------- Asistente de IA ---------- */
  const aiSuggestions = () => {
    const k = st.cur ? steps()[st.step] : null;
    if (!st.cur) return ["org.ai.s.idea", "org.ai.s.catalog", "org.ai.s.venue"];
    return ({ details: ["org.ai.s.desc", "org.ai.s.tags"], days: ["org.ai.s.agenda"], sessions: ["org.ai.s.sessions"], speakers: ["org.ai.s.speakers"], missions: ["org.ai.s.missions"], venue: ["org.ai.s.venue"], preview: ["org.ai.s.review"] })[k] || [];
  };
  function propHTML(m, mi) {
    const p = m.prop || {}, c = st.cur, cat = c && c.curated, done = (k) => m.applied && m.applied[k];
    const btn = (k, label, ic = "check") => `<button type="button" class="pill-btn ${done(k) ? "is-done" : ""}" data-org="aiApply" data-v="${mi}:${k}" ${done(k) || st.busy ? "disabled" : ""}>${svg(done(k) ? "check" : ic)}${done(k) ? t("org.ai.applied") : label}</button>`;
    const group = (title, items, all) => items ? `<div class="org-ai-p"><div class="org-ai-pt">${title}</div>${items}${all || ""}</div>` : "";
    const out = [];
    if (p.details) out.push(group(t("org.ai.p.details"), `<p>${esc(p.details.description)}</p>${p.details.tags.length ? `<div class="org-venue-z">${p.details.tags.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>` : ""}`, btn("details", c ? t("org.ai.useDetails") : t("org.ai.startWith"), "pen")));
    if (p.agenda && p.agenda.length) out.push(group(t("org.ai.p.agenda"), `<ul>${p.agenda.map((r) => `<li><b class="tabular">${esc(r[0])}</b> ${esc(r[1])}${r[2] ? ` · <span class="text-mute">${esc(r[2])}</span>` : ""}</li>`).join("")}</ul>`, btn("agenda", t("org.ai.useAgenda"), "clock")));
    if (!cat && p.sessions && p.sessions.length) out.push(group(t("org.ai.p.sessions"), `<ul>${p.sessions.map((s, j) => `<li><span><b class="tabular">${esc(tf("org.dayN", s.day + 1))} · ${esc(s.time)}</b> ${esc(s.title)} <span class="text-mute">(${esc(t("org.kind." + s.kind))})</span></span>${btn("sessions." + j, t("org.ai.add"), "spark")}</li>`).join("")}</ul>`, p.sessions.length > 1 ? btn("sessions.*", t("org.ai.addAll"), "spark") : ""));
    if (p.speakers && p.speakers.length) out.push(group(t("org.ai.p.speakers"), `<ul>${p.speakers.map((s, j) => `<li><span><b>${esc(s.name)}</b> <span class="text-mute">${esc([s.role, s.org].filter(Boolean).join(" · "))}</span></span>${btn("speakers." + j, t("org.ai.add"), "spark")}</li>`).join("")}</ul>`, p.speakers.length > 1 ? btn("speakers.*", t("org.ai.addAll"), "spark") : ""));
    if (!cat && p.missions && p.missions.length) out.push(group(t("org.ai.p.missions"), `<ul>${p.missions.map((x, j) => `<li><span><b>${esc(x.title)}</b> <span class="text-mute">${esc(t("org.mtype." + x.type))} · +${x.xp} XP</span></span>${btn("missions." + j, t("org.ai.add"), "spark")}</li>`).join("")}</ul>`, p.missions.length > 1 ? btn("missions.*", t("org.ai.addAll"), "spark") : ""));
    if (p.venue && p.venue.zones.length) out.push(group(t("org.ai.p.venue"), `<div class="org-venue-z">${p.venue.zones.map((z) => `<span class="chip">${esc(z.name)} · ${esc(t("org.vg.size." + z.size))}</span>`).join("")}</div>`, btn("venue", t("org.ai.useVenue"), "layers")));
    return out.join("");
  }
  function aiHTML() {
    const a = st.ai, sug = aiSuggestions();
    return `<article class="pcard org-ai" id="orgAi">
      <header class="pcard-h"><div><span class="pcard-k">${t("org.ai.kicker")}</span><h2 class="pcard-t">${t("org.ai.title")}</h2><p class="text-mute text-[14px]" style="margin-top:4px">${st.cur && st.cur.name ? esc(tf("org.ai.ledeEv", st.cur.name)) : t("org.ai.lede")}</p></div><span class="chip chip-accent">${svg("bot")}${t("org.ai.chip")}</span></header>
      <div class="org-ai-log" id="orgAiLog" aria-live="polite">${a.msgs.map((m, i) => `<div class="org-ai-m ${m.role === "user" ? "is-me" : ""} ${m.err ? "is-err" : ""}"><p>${esc(m.content)}</p>${m.prop ? propHTML(m, i) : ""}</div>`).join("")}${a.busy ? `<div class="org-ai-m is-wait"><p>${svg("clock")}${t("org.ai.thinking")}</p></div>` : ""}</div>
      ${!a.msgs.length && sug.length ? `<div class="org-ai-sug">${sug.map((k) => `<button type="button" class="pill-btn" data-org="aiSug" data-v="${k}">${esc(t(k))}</button>`).join("")}</div>` : ""}
      <form class="org-ai-f" data-org-form="ai" novalidate><textarea class="input" name="q" rows="2" maxlength="1500" placeholder="${t("org.ai.ph")}" aria-label="${t("org.ai.ph")}" ${a.busy ? "disabled" : ""}>${esc(a.draft)}</textarea><button type="submit" class="btn btn-primary btn-sm" ${a.busy ? "disabled" : ""}>${svg("arrow")}${t("org.ai.send")}</button></form>
    </article>`;
  }
  /* Repinta solo el asistente: no se pierde lo escrito en el paso abierto */
  function paintAi(focus) {
    const el = document.getElementById("orgAi"); if (!el) { rr(); return; }
    el.outerHTML = aiHTML();
    const log = document.getElementById("orgAiLog"); if (log) log.scrollTop = log.scrollHeight;
    if (focus) { const q = document.querySelector("#orgAi [name=q]"); if (q) q.focus({ preventScroll: true }); }
  }

  function wizardHTML() {
    const k = steps()[st.step], body = { details: detailsHTML, days: daysHTML, sessions: sessionsHTML, speakers: speakersHTML, missions: missionsHTML, venue: venueHTML, preview: previewHTML }[k]();
    return `<article class="pcard" id="orgCard">
      <header class="pcard-h"><div><span class="pcard-k">${st.cur.curated ? t(st.cur.id ? "org.cat.editing" : "org.cat.new") : st.cur.id ? t("org.editing") : t("org.newEv")}</span><h2 class="pcard-t">${esc(st.cur.name || t("org.untitled"))}</h2></div>
        <div class="flex items-center gap-2">${st.cur.id ? statusChip(st.cur.status) : ""}<button type="button" class="btn btn-ghost btn-sm" data-org="back">${svg("chevl")}${t("org.back")}</button></div></header>
      ${notMine(st.cur) ? `<p class="org-msg is-admin" role="note">${svg("shield")}<span>${esc(tf("org.adminEditing", st.cur.owner.name || st.cur.owner.email || "?"))}</span></p>` : ""}
      ${stepperHTML()}
      <section class="org-body" aria-labelledby="orgStepT"><h3 class="org-step-t" id="orgStepT">${tf("org.stepOf", st.step + 1, steps().length)} · ${t("org.step." + k)}</h3>${msgHTML()}${body}</section>
      ${st.cur.id ? `<div class="org-nav">${st.step > 0 ? `<button type="button" class="btn btn-ghost btn-sm" data-org="step" data-v="${st.step - 1}">${svg("chevl")}${t("org.prev")}</button>` : "<span></span>"}${st.step < steps().length - 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-org="step" data-v="${st.step + 1}">${t("org.next")}${svg("chev")}</button>` : ""}</div>` : ""}
    </article>`;
  }

  const html = () => `${st.cur ? wizardHTML() : listHTML()}${aiHTML()}`;

  /* ---------- Acciones ---------- */
  async function saveDetails(f) {
    const c = st.cur, d = {
      name: f.name.value.trim(), city: f.city.value, venueName: f.venueName.value.trim(), sourceUrl: f.sourceUrl.value.trim(), description: f.description.value.trim(),
      tags: list(f.tags.value, 12, 60), industries: [...f.querySelectorAll("[name=ind]:checked")].map((x) => x.value),
    };
    const bad = d.name.length < 3 ? t("org.v.name") : !d.city ? t("org.v.city") : d.description.length < 20 ? t("org.v.desc")
      : c.curated && !d.sourceUrl ? t("org.v.urlReq") : d.sourceUrl && !URL_RE.test(d.sourceUrl) ? t("org.v.url") : !d.industries.length ? t("org.v.inds") : !d.tags.length ? t("org.v.tags") : "";
    if (bad) { fail(bad); return; }
    const pos = ctx.cityPos(d.city), body = { ...d, sourceUrl: d.sourceUrl || null, ...(pos ? { lat: pos[0], lon: pos[1] } : {}) };
    const i = info(), tone = [f.tone0.value, f.tone1.value].map((x, k) => (HEX_RE.test(x) ? x : DEFAULT_INFO.tone[k]));
    const days = c.days.length;
    const nextInfo = { ...i, tone, accent: HEX_RE.test(f.accent.value) ? f.accent.value : DEFAULT_INFO.accent, lema: d.description.slice(0, 300), para: f.para.value.trim().slice(0, 300),
      formato: [f.format.value, ...(days ? [daysTxt(days)] : [])], llevas: lines(f.llevas.value, 8, 160) };
    await run(async () => {
      let r = c.id ? await api.admin.updateEvent(c.id, body) : await api.admin.createEvent(c.curated ? { ...body, curated: true } : body);
      r = await api.admin.setInfo(r.event.id, nextInfo);
      const isNew = !c.id; adopt(r); st.step = 1;
      if (isNew) toast(`<b>${esc(t(c.curated ? "org.cat.t.draft" : "org.t.draft"))}</b><div class="text-[13px] text-mute">${esc(r.event.name)}</div>`, "pen");
    }, t("org.ok.saved"));
  }
  async function saveDays(f) {
    readDaysForm(f);
    const days = st.days.filter(Boolean), agenda = st.agenda.map((r) => r.map((x) => String(x).trim())).filter((r) => r[0] || r[1] || r[2]);
    const bad = !days.length ? t("org.v.days") : days.some((d, i) => i && d <= days[i - 1]) ? t("org.v.dayOrder") : agenda.some((r) => !r[0] || !r[1]) ? t("org.v.agenda") : "";
    if (bad) { fail(bad); return; }
    const lost = st.cur.sessions.filter((s) => s.day >= days.length).length;
    if (lost && st.ask !== "days") { st.ask = "days"; fail(tf("org.v.daysLost", lost)); return; }
    st.ask = null;
    const i = info(), fmt = i.formato.filter((x) => !/\d/.test(x));
    await run(async () => {
      const id = st.cur.id;
      await api.admin.setDays(id, days);
      await api.admin.setInfo(id, { ...i, agenda: agenda.map((r) => [r[0].slice(0, 40), r[1].slice(0, 80), r[2].slice(0, 200)]), formato: [...fmt, daysTxt(days.length)].slice(0, 6) });
      adopt(await api.admin.updateEvent(id, { dateLabel: dateLabelOf(days) }));
      st.step = 2;
    }, t("org.ok.saved"));
  }
  async function addSession(f) {
    const b = { day: +f.day.value, time: f.time.value, kind: f.kind.value, title: f.title.value.trim(), room: f.room.value.trim(), speaker: f.speaker.value.trim(), tag: f.tag.value || null };
    const bad = !/^\d{2}:\d{2}$/.test(b.time) ? t("org.v.time") : b.title.length < 3 ? t("org.v.title") : "";
    if (bad) { fail(bad); return; }
    await run(async () => { await api.admin.addSession(st.cur.id, b); adopt(await api.admin.getEvent(st.cur.id)); }, tf("org.ok.session", b.title));
  }
  async function addSpeaker(f) {
    const name = f.name.value.trim(), style = f.avatar.value;
    if (name.length < 2) { fail(t("org.v.spkName")); return; }
    const b = { name, role: f.role.value.trim(), org: f.org.value.trim(), talk: f.talk.value.trim(), bio: f.bio.value.trim(), avatar: style ? ctx.makeAvatar(style, hashStr(name)) : null };
    await run(async () => { await api.admin.addSpeaker(st.cur.id, b); adopt(await api.admin.getEvent(st.cur.id)); }, tf("org.ok.speaker", name));
  }
  async function addMission(f) {
    const b = { type: f.type.value, title: f.title.value.trim(), condition: f.condition.value.trim(), xp: Math.round(+f.xp.value) };
    const bad = b.title.length < 3 ? t("org.v.title") : !(b.xp >= 10 && b.xp <= 500) ? t("org.v.xp") : "";
    if (bad) { fail(bad); return; }
    await run(async () => { await api.admin.addMission(st.cur.id, b); adopt(await api.admin.getEvent(st.cur.id)); }, tf("org.ok.mission", b.title));
  }
  async function setVenue(key) {
    const tpl = ctx.venueTemplates().find(([k]) => k === key);
    await run(async () => { adopt(await api.admin.setVenue(st.cur.id, tpl ? clone(tpl[2]) : null)); }, tpl ? tf("org.ok.venue", tpl[1]) : t("org.ok.noVenue"));
  }
  async function saveVenueGen(f) {
    readVgen(f);
    if (!st.vz.length) { fail(t("org.vg.v.none")); return; }
    if (st.vz.some((z) => !z.name.trim())) { fail(t("org.vg.v.name")); return; }
    const v = generateVenue({ zones: st.vz, ground: st.vground });
    await run(async () => { adopt(await api.admin.setVenue(st.cur.id, v)); }, tn("org.vg.saved", v.z.length));
  }
  /* Descripción → zonas: con la IA si está disponible; si no, con el traductor local de palabras clave */
  async function proposeZones(f) {
    readVgen(f.closest("#orgCard").querySelector("[data-org-form=vgen]"));
    const brief = f.brief.value.trim();
    if (brief.length < 8) { fail(t("org.vg.v.brief")); return; }
    let how = "ai";
    await run(async () => {
      try {
        const r = await api.admin.assist({ message: brief, eventId: st.cur.id || undefined, focus: "venue", lang: ctx.lang() });
        const zs = r.proposals && r.proposals.venue && r.proposals.venue.zones;
        if (!zs || !zs.length) throw Object.assign(new Error("sin zonas"), { local: true });
        st.vz = zs.map(cleanZone);
      } catch (e) {
        if (!(e.local || isOffline(e))) throw e;
        how = "local"; st.vz = parseVenueBrief(brief);
      }
    }, () => tn(how === "ai" ? "org.vg.aiOk" : "org.vg.localOk", st.vz.length));
  }
  async function sendAi(text) {
    const a = st.ai, q = String(text || "").trim().slice(0, 1500);
    if (!q || a.busy) return;
    const history = a.msgs.filter((m) => !m.err).slice(-AI_HISTORY).map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }));
    a.msgs.push({ role: "user", content: q }); a.busy = true; a.draft = ""; paintAi();
    try {
      const r = await api.admin.assist({ message: q, history, eventId: (st.cur && st.cur.id) || undefined, lang: ctx.lang() });
      a.msgs.push({ role: "assistant", content: r.reply || t("org.ai.empty"), prop: r.proposals || null, applied: {}, ev: st.cur && st.cur.id });
    } catch (e) {
      a.msgs.push({ role: "assistant", content: isOffline(e) ? t("org.ai.off") : e instanceof ApiError && e.status === 429 ? t("org.ai.limit") : errText(e), err: true });
    } finally { a.busy = false; paintAi(true); }
  }
  /* Aplica una propuesta. Lo que va a un formulario (detalles, agenda, recinto) se rellena para revisarlo y
     guardarlo; charlas, speakers y misiones se añaden con los endpoints de siempre */
  async function applyAi(v) {
    const [mi, key] = v.split(":"), m = st.ai.msgs[+mi]; if (!m || !m.prop) return;
    const p = m.prop, [kind, idx] = key.split("."), mark = (k) => { m.applied[k] = true; };
    if (kind === "details") {
      const d = p.details; if (!d) return;
      if (!st.cur) { startNew(false); if (d.name) st.cur.name = d.name; if (d.city && ctx.cities().includes(d.city)) st.cur.city = d.city; }
      Object.assign(st.cur, { description: d.description || st.cur.description, tags: d.tags.length ? d.tags : st.cur.tags });
      if (d.para) st.cur.info = { ...info(), para: d.para };
      st.step = stepIx("details"); mark(key); setMsg("ok", t("org.ai.reviewDetails")); rr(); return;
    }
    if (!st.cur || !st.cur.id) { setMsg("err", t("org.ai.needEvent")); if (st.cur) paintMsg(); else rr(); return; }
    if (m.ev && m.ev !== st.cur.id) { setMsg("err", t("org.ai.otherEv")); paintMsg(); return; }
    if (kind === "agenda") { st.agenda = p.agenda.map((r) => r.slice()); st.days = null; st.step = stepIx("days"); mark(key); setMsg("ok", t("org.ai.reviewAgenda")); rr(); return; }
    if (kind === "venue") { st.vz = p.venue.zones.map(cleanZone); st.step = stepIx("venue"); mark(key); setMsg("ok", t("org.ai.reviewVenue")); rr(); return; }
    const all = idx === "*", list = p[kind] || [], picks = all ? list.map((_, j) => j).filter((j) => !m.applied[`${kind}.${j}`]) : [+idx];
    const add = { sessions: (b) => api.admin.addSession(st.cur.id, { ...b, tag: null }), speakers: (b) => api.admin.addSpeaker(st.cur.id, { ...b, avatar: null }), missions: (b) => api.admin.addMission(st.cur.id, b) }[kind];
    if (!add || !picks.length) return;
    if (kind === "sessions" && !st.cur.days.length) { setMsg("err", t("org.ses.noDays")); paintMsg(); return; }
    let n = 0;
    await run(async () => {
      for (const j of picks) { const b = list[j]; if (!b || (kind === "sessions" && b.day >= st.cur.days.length)) continue; await add(b); mark(`${kind}.${j}`); n++; }
      if (all) mark(key);
      adopt(await api.admin.getEvent(st.cur.id));
      const target = stepIx(kind); if (target >= 0) st.step = target;
    }, () => tn("org.ai.added", n));
  }
  async function publish(on) {
    const ok = await run(async () => { adopt(on ? await api.admin.publish(st.cur.id) : await api.admin.unpublish(st.cur.id)); }, on ? t("org.ok.published") : t("org.ok.unpublished"));
    if (ok) { st.list = null; ctx.afterPublish(); if (on) toast(`<b>${esc(t("org.t.published"))}</b><div class="text-[13px] text-mute">${esc(st.cur.name)}</div>`, "check"); }
  }
  async function del(id) {
    if (st.ask !== "del:" + id) { st.ask = "del:" + id; rr(); setTimeout(() => { if (st.ask === "del:" + id) { st.ask = null; rr(); } }, 4000); return; }
    st.ask = null;
    const ok = await run(async () => { await api.admin.deleteEvent(id); st.list = (st.list || []).filter((e) => e.id !== id); }, t("org.ok.deleted"));
    if (ok) ctx.afterPublish();
  }
  const delChild = (fn, okText) => run(async () => { await fn(); adopt(await api.admin.getEvent(st.cur.id)); }, okText);

  function onClick(e) {
    const b = e.target.closest("[data-org]"); if (!b || b.disabled) return false;
    const k = b.dataset.org, v = b.dataset.v;
    if (k === "new") { startNew(); rr(); }
    else if (k === "newCat") { startNew(true); rr(); }
    else if (k === "vzAdd" || k === "vzDel") {
      readVgen(b.closest("form"));
      if (k === "vzAdd" && st.vz.length < MAX_ZONES) st.vz.push(cleanZone({ type: "labs", size: "m" }));
      if (k === "vzDel" && st.vz.length > 1) st.vz.splice(+v, 1);
      rr();
    }
    else if (k === "aiSug") sendAi(t(v));
    else if (k === "aiApply") applyAi(v);
    else if (k === "edit") edit(v);
    else if (k === "scope") { if (st.scope !== v) { st.scope = v === "all" ? "all" : "mine"; st.list = null; st.ask = null; setMsg(null); rr(); loadList(); } }
    else if (k === "del") del(v);
    else if (k === "back") backToList();
    else if (k === "step") { const card = b.closest("#orgCard"); if (steps()[st.step] === "days" && card) readDaysForm(card.querySelector("[data-org-form=days]")); if (steps()[st.step] === "venue" && card) readVgen(card.querySelector("[data-org-form=vgen]")); st.step = Math.max(0, Math.min(steps().length - 1, +v)); setMsg(null); st.ask = null; rr(); }
    else if (k === "dayAdd" || k === "dayDel" || k === "agAdd" || k === "agDel") {
      readDaysForm(b.closest("form"));
      if (k === "dayAdd") { const last = st.days[st.days.length - 1]; const n = last ? new Date(`${last}T12:00:00`) : new Date(); n.setDate(n.getDate() + (last ? 1 : 30)); st.days.push(n.toISOString().slice(0, 10)); }
      if (k === "dayDel") st.days.splice(+v, 1);
      if (k === "agAdd") st.agenda.push(["", "", ""]);
      if (k === "agDel") st.agenda.splice(+v, 1);
      rr();
    }
    else if (k === "sday") { st.sDay = +v; rr(); }
    else if (k === "sesDel") delChild(() => api.admin.deleteSession(st.cur.id, v), t("org.ok.removed"));
    else if (k === "spkDel") delChild(() => api.admin.deleteSpeaker(st.cur.id, v), t("org.ok.removed"));
    else if (k === "misDel") delChild(() => api.admin.deleteMission(st.cur.id, v), t("org.ok.removed"));
    else if (k === "venue") setVenue(v);
    else if (k === "publish") publish(true);
    else if (k === "unpublish") publish(false);
    else if (k === "explore") ctx.goExplore(st.cur.id);
    else return false;
    return true;
  }
  function onSubmit(e) {
    const f = e.target.closest("[data-org-form]"); if (!f) return false;
    e.preventDefault();
    const k = f.dataset.orgForm;
    if (k === "details") saveDetails(f);
    else if (k === "days") saveDays(f);
    else if (k === "session") addSession(f);
    else if (k === "speaker") addSpeaker(f);
    else if (k === "mission") addMission(f);
    else if (k === "vgen") saveVenueGen(f);
    else if (k === "vbrief") proposeZones(f);
    else if (k === "ai") sendAi(f.q.value);
    return true;
  }
  /* Vista previa de la portada mientras se eligen los colores */
  function onInput(e) {
    if (e.target.closest("[data-org-form=ai]")) { st.ai.draft = e.target.value; st.dirty = true; return true; }
    if (e.target.closest("[data-org-form]")) st.dirty = true;
    const f = e.target.closest("[data-org-form=details]"); if (!f) return false;
    const p = f.querySelector("#orgCoverPrev");
    if (p && ["tone0", "tone1", "accent", "name"].includes(e.target.name)) {
      p.style.setProperty("--a", f.tone0.value); p.style.setProperty("--b", f.tone1.value); p.style.setProperty("--c", f.accent.value);
      p.textContent = (f.name.value.trim() || "K").slice(0, 1).toUpperCase();
    }
    return true;
  }
  /* Nueva sesión de otra cuenta o rol retirado: olvidar lo cargado */
  function reset() { Object.assign(st, { list: null, loading: false, cur: null, step: 0, busy: false, msg: null, ask: null, days: null, agenda: null, sDay: 0, dirty: false, scope: "mine", vz: null, vground: null, ai: { msgs: [], busy: false, draft: "" } }); }

  return { html, open, startNew, onClick, onSubmit, onInput, reset, get editing() { return !!st.cur; }, get dirty() { return st.dirty; } };
}
