import SimulatorPreview from "@/components/landing/SimulatorPreview";

/**
 * Simulador interactivo: industria + objetivo → agenda, misiones, matches y concierge generados por la IA (datos de ejemplo).
 */
export default function SimulatorSection() {
  return (
    <section className="band" id="demo">
      <div className="wrap">
        <div className="max-w-3xl">
          <span className="eyebrow" data-i18n="demo.eyebrow">Simulador interactivo en vivo</span>
          {" "}
          <h2 className="h2 mt-4" data-i18n="demo.h2">Elige tu industria. La IA arma tu Summit en segundos.</h2>
          <p className="lede mt-5">Datos de ejemplo. Prueba sin conectar nada.</p>
        </div>
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-6 mt-12 items-start" id="gamificacion">
          {/* Controls */}
          <div className="glass rounded-[24px] p-5 sm:p-7 grid gap-6 min-w-0">
            <fieldset>
              <legend className="mono text-[12px] uppercase tracking-[.12em] text-mute mb-3">1 · Tu industria</legend>
              <div className="grid grid-cols-2 gap-3" id="indGrid" />
            </fieldset>
            <div>
              <label htmlFor="objSel" className="mono text-[12px] uppercase tracking-[.12em] text-mute block mb-3">
                2 · Tu objetivo en el Summit
              </label>
              {" "}
              <select id="objSel" className="select" defaultValue="negocios">
                <option value="aprender">Aprender y traer ideas al equipo</option>
                <option value="negocios">Generar oportunidades de negocio</option>
                <option value="talento">Encontrar talento y aliados</option>
              </select>
            </div>
            {" "}
            <button className="btn btn-primary w-full" id="genBtn">
              <i className="ico" data-i="spark" />
              Generar mi agenda con IA
            </button>
            {" "}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="mono text-[12px] uppercase tracking-[.12em] text-mute">Registro del agente</span>
                {" "}
                <span className="chip" id="agentState">
                  <i className="ico" data-i="check" />
                  Listo
                </span>
              </div>
              <div className="console" id="console" aria-live="polite" />
            </div>
          </div>
          {/* App preview */}
          <SimulatorPreview />
        </div>
      </div>
    </section>
  );
}
