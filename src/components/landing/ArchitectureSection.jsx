import TechDetails from "@/components/landing/TechDetails";

/**
 * Cómo funciona KNET: flujo de 4 piezas, 3 tarjetas (perfil, recinto, inteligencia) y detalle técnico.
 */
export default function ArchitectureSection() {
  return (
    <section className="band" id="arquitectura" style={{ background: "linear-gradient(180deg, transparent, rgba(var(--d-rgb),.45) 15%, rgba(var(--d-rgb),.45) 85%, transparent)" }}>
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Cómo funciona KNET</span>
            {" "}
            <h2 className="h2 mt-4">Tres piezas, explicadas en simple.</h2>
          </div>
          <p className="lede lg:max-w-md">
            Tu perfil, el recinto y la inteligencia artificial trabajan juntos para que cada persona viva un Summit a su medida. Siempre con tu permiso.
          </p>
        </div>
        <div className="ar-stage" id="arStage" aria-hidden="true" />
        <ol className="ar-flow" aria-label="Así viajan tus datos en KNET">
          <li>
            <span className="ar-n">1</span>
            <div>
              <b>Lo que tú autorizas</b>
              <span>Tu perfil de LinkedIn, tu agenda y las charlas del evento.</span>
            </div>
          </li>
          <li>
            <span className="ar-n">2</span>
            <div>
              <b>Un puente seguro</b>
              <span>Solo deja pasar los datos que aceptaste.</span>
            </div>
          </li>
          <li className="hl">
            <span className="ar-n">3</span>
            <div>
              <b>Asistentes de IA</b>
              <span>Arman tu agenda, tus matches y tu resumen.</span>
            </div>
          </li>
          <li>
            <span className="ar-n">4</span>
            <div>
              <b>Donde lo usas</b>
              <span>La app, los tótems del recinto y tu credencial.</span>
            </div>
          </li>
        </ol>
        <div className="grid lg:grid-cols-3 gap-5 mt-8">
          <article className="arch-card glass ar-card">
            <div className="flex items-center gap-3">
              <div className="ico-tile" style={{ background: "rgba(61,107,255,.12)", color: "var(--t-blue)" }}>
                <i className="ico" data-i="link" />
              </div>
              <div>
                <div className="mono text-[11px] text-mute uppercase tracking-[.12em]">1 · Tu perfil</div>
                <h3 className="font-display font-bold text-xl">Tú decides qué compartes</h3>
              </div>
            </div>
            <p className="text-mute text-[15px]">
              Conectas LinkedIn y marcas qué datos puede leer KNET: tu cargo, tu industria y tus intereses. Nada más.
            </p>
            <ul className="ar-list">
              <li>
                <i className="ico" data-i="check" />
                Solo se leen los campos que marcas.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Puedes quitar el permiso cuando quieras.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Nunca leemos tus mensajes ni tus contactos.
              </li>
            </ul>
            <p className="ar-tech">Tecnología: Model Context Protocol (MCP) · OAuth 2.0 con permisos por campo</p>
          </article>
          <article className="arch-card glass ar-card">
            <div className="flex items-center gap-3">
              <div className="ico-tile" style={{ background: "rgba(16,185,129,.14)", color: "var(--t-emerald)" }}>
                <i className="ico" data-i="nfc" />
              </div>
              <div>
                <div className="mono text-[11px] text-mute uppercase tracking-[.12em]">2 · El recinto</div>
                <h3 className="font-display font-bold text-xl">Conectas con un toque</h3>
              </div>
            </div>
            <p className="text-mute text-[15px]">
              Tu credencial NFC y tu código QR registran tu asistencia e intercambian contactos con solo acercar el celular.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[.03]">
              <canvas id="qr" width="29" height="29" aria-label="Ilustración de un código QR dinámico" role="img" />
              <div className="min-w-0">
                <div className="mono text-[11px] text-mute uppercase tracking-[.12em]">Tu código cambia solo</div>
                <div className="mono text-sm mt-1 break-all" id="qrTok">kn_…</div>
                <div className="text-[12px] text-mute mt-2 flex items-center gap-1.5">
                  <i className="ico" style={{ width: "14px", height: "14px" }} data-i="clock" />
                  Se renueva en{" "}
                  <span className="mono tabular text-ink" id="qrTtl">30</span>
                  {" "}s
                </div>
              </div>
            </div>
            <ul className="ar-list">
              <li>
                <i className="ico" data-i="check" />
                Responde en menos de medio segundo.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Nadie puede usar una captura de tu código.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Los tótems registran tus misiones.
              </li>
            </ul>
            <p className="ar-tech">Tecnología: NFC · QR con token firmado que rota cada 30 s</p>
          </article>
          <article className="arch-card glass ar-card">
            <div className="flex items-center gap-3">
              <div className="ico-tile" style={{ background: "rgba(161,0,255,.18)", color: "var(--t-lilac)" }}>
                <i className="ico" data-i="layers" />
              </div>
              <div>
                <div className="mono text-[11px] text-mute uppercase tracking-[.12em]">3 · La inteligencia</div>
                <h3 className="font-display font-bold text-xl">La IA escucha las charlas por ti</h3>
              </div>
            </div>
            <p className="text-mute text-[15px]">
              Las charlas se transcriben y la IA las organiza. Así el Concierge responde tus preguntas y arma tu resumen, diciendo de qué charla y de qué minuto sacó cada idea.
            </p>
            <ul className="ar-list">
              <li>
                <i className="ico" data-i="check" />
                Agenda y matches pensados para tu rol.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Cada respuesta dice de dónde salió.
              </li>
              <li>
                <i className="ico" data-i="check" />
                Tus datos personales quedan protegidos.
              </li>
            </ul>
            <p className="ar-tech">Tecnología: modelos de lenguaje (LLM) + búsqueda en las transcripciones (RAG)</p>
          </article>
        </div>
        <TechDetails />
      </div>
    </section>
  );
}
