/**
 * Las 4 experiencias clave: pestañas que cambian solas al hacer scroll (contenido lo pinta el motor).
 */
export default function ExperiencesSection() {
  return (
    <section className="band xp-sec" id="caracteristicas" style={{ background: "linear-gradient(180deg, transparent, rgba(var(--d-rgb),.4) 20%, rgba(var(--d-rgb),.4) 80%, transparent)" }}>
      <div className="cine-pin xp-pin" id="chXp" style={{ "--len": "4" }}>
        <div className="cine-sticky">
          <div className="wrap">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="eyebrow" data-i18n="feat.eyebrow">Las 4 experiencias clave</span>
                {" "}
                <h2 className="h2 mt-4" data-i18n="feat.h2">Un recorrido inteligente, del registro al día después.</h2>
              </div>
            </div>
            <div className="grid lg:grid-cols-[380px_1fr] gap-6 mt-12 items-start">
              <div role="tablist" aria-label="Experiencias KNET" aria-orientation="vertical" className="grid gap-2" id="xpTabs" />
              <div className="stage glass-deep p-5 sm:p-8 min-w-0" id="xpStage" role="tabpanel" tabIndex="0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
