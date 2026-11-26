/**
 * Vista previa del evento sugerido (datos reales del catálogo): ficha, afinidad, XP de ejemplo, pestañas y otros eventos.
 * El motor (knetApp.js) rellena los contenedores con id.
 */
export default function SimulatorPreview() {
  return (
    <div className="glass-deep rounded-[28px] p-5 sm:p-7 grid gap-5 min-w-0 relative" id="app">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="avatar" id="evTile" aria-hidden="true" style={{ background: "linear-gradient(135deg,#A100FF,#7500C0)", width: "48px", height: "48px" }} />
          <div className="min-w-0">
            <div className="font-display font-bold text-lg leading-tight" id="evName" />
            <div className="text-mute text-sm" id="evSub" />
          </div>
        </div>
        {" "}
        <a className="chip chip-cyan" id="evSrc" href="#demo" target="_blank" rel="noopener noreferrer" hidden>
          <i className="ico" data-i="link" />
          <span data-i18n="sim.source">Fuente oficial</span>
        </a>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.3)" }}>
        <div className="flex justify-between items-center gap-3 mb-2 flex-wrap">
          <span className="font-semibold flex items-center gap-2">
            <i className="ico" style={{ color: "var(--t-emerald)" }} data-i="trophy" />
            <span id="lvlLabel">Nivel 1 · Explorador</span>
          </span>
          {" "}
          <span className="mono text-sm text-[color:var(--t-emerald)] tabular" id="xpLabel">0 XP</span>
        </div>
        <div className="xpbar" role="progressbar" aria-label="Progreso de nivel" aria-valuemin="0" aria-valuemax="100" id="xpBarWrap">
          <span id="xpBar" style={{ width: "0%" }} />
        </div>
        <div className="text-[12px] text-mute mt-2" id="xpNext">500 XP para Nivel 2</div>
      </div>
      <div className="sim-tabs" role="tablist" aria-label="Vistas de la vista previa">
        <button className="sim-tab" role="tab" aria-selected="true" data-view="evento" id="t-evento" data-i18n="sim.tEvent">El evento</button>
        {" "}
        <button className="sim-tab" role="tab" aria-selected="false" data-view="formato" id="t-formato" data-i18n="sim.tFormat">Así es</button>
        {" "}
        <button className="sim-tab" role="tab" aria-selected="false" data-view="misiones" id="t-misiones" data-i18n="sim.tMissions">
          Misiones
        </button>
        {" "}
        <button className="sim-tab" role="tab" aria-selected="false" data-view="concierge" id="t-concierge" data-i18n="sim.tConcierge">
          Concierge
        </button>
      </div>
      <div id="view-evento" className="grid gap-3" role="tabpanel" aria-labelledby="t-evento" />
      <div id="view-formato" className="grid gap-3" role="tabpanel" aria-labelledby="t-formato" hidden />
      <div id="view-misiones" className="grid gap-3" role="tabpanel" aria-labelledby="t-misiones" hidden />
      <div id="view-concierge" className="grid gap-3" role="tabpanel" aria-labelledby="t-concierge" hidden />
      <div>
        <div className="mono text-[12px] uppercase tracking-[.12em] text-mute mb-3" data-i18n="sim.otherK">Otros eventos para ti</div>
        <div className="grid gap-2" id="evOthers" />
      </div>
    </div>
  );
}
