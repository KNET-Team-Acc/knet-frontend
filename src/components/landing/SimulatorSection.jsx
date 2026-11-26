import SimulatorPreview from "@/components/landing/SimulatorPreview";

/**
 * Vista previa de tu evento: industria + objetivo → el evento real del catálogo más afín (src/data/events.js),
 * su formato, misiones de ejemplo y un concierge que responde con los datos del catálogo. Sin charlas, salas ni cargos inventados.
 * Textos con clave sim.* en I18N (src/data/navigation.js); la lógica vive en el motor (knetApp.js, «Simulator»).
 */
export default function SimulatorSection() {
  return (
    <section className="band" id="demo">
      <div className="wrap">
        <div className="max-w-3xl">
          <span className="eyebrow" data-i18n="sim.eyebrow">Vista previa de tu evento</span>
          {" "}
          <h2 className="h2 mt-4" data-i18n="sim.h2">Elige tu industria y mira qué evento real te conviene.</h2>
          <p className="lede mt-5" data-i18n="sim.lede">Eventos reales del catálogo, con fuente oficial. Pruébalo sin crear cuenta.</p>
        </div>
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-6 mt-12 items-start" id="gamificacion">
          {/* Controls */}
          <div className="glass rounded-[24px] p-5 sm:p-7 grid gap-6 min-w-0">
            <fieldset>
              <legend className="mono text-[12px] uppercase tracking-[.12em] text-mute mb-3" data-i18n="sim.ind">1 · Tu industria</legend>
              <div className="grid grid-cols-2 gap-3" id="indGrid" />
            </fieldset>
            <div>
              <label htmlFor="objSel" className="mono text-[12px] uppercase tracking-[.12em] text-mute block mb-3" data-i18n="sim.obj">
                2 · Tu objetivo en el evento
              </label>
              {" "}
              <select id="objSel" className="select" defaultValue="negocios">
                <option value="aprender" data-i18n="sim.objAprender">Aprender y traer ideas al equipo</option>
                <option value="negocios" data-i18n="sim.objNegocios">Generar oportunidades de negocio</option>
                <option value="talento" data-i18n="sim.objTalento">Encontrar talento y aliados</option>
              </select>
            </div>
            {" "}
            <button className="btn btn-primary w-full" id="genBtn">
              <i className="ico" data-i="spark" />
              <span data-i18n="sim.gen">Ver la vista previa de mi evento</span>
            </button>
            {" "}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="mono text-[12px] uppercase tracking-[.12em] text-mute" data-i18n="sim.log">Cómo se armó tu vista previa</span>
                {" "}
                <span className="chip" id="agentState">
                  <i className="ico" data-i="check" />
                  Listo
                </span>
              </div>
              <div className="console" id="console" aria-live="polite" />
            </div>
          </div>
          {/* Event preview */}
          <SimulatorPreview />
        </div>
      </div>
    </section>
  );
}
