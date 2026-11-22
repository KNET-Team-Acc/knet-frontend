/**
 * Escena del ciclo KNET: anillo 3D con los 4 pasos que se encienden al hacer scroll.
 */
export default function CycleScene() {
  return (
    <div className="cine-pin" id="chCycle" style={{ "--len": "3" }}>
      <div className="cine-sticky">
        <div className="wrap cyc cyc-pin" aria-labelledby="cycTitle">
          <div className="cyc-top flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="eyebrow">El ciclo KNET</span>
              <h3 id="cycTitle" className="font-display font-extrabold text-2xl sm:text-3xl mt-3" data-i18n="cyc.h3">
                De lo que pasa en la sala a lo que haces el lunes.
              </h3>
            </div>
            {" "}
            <span className="mono text-[12px] text-mute">Evento → Insight → Conexión → Acción</span>
          </div>
          <ol className="cyc-flow">
            <li className="cyc-step" style={{ "--c": "161,0,255", "--fg": "#DCAFFF", "--d": "0s" }}>
              <span className="cyc-ico">
                <i className="ico" data-i="calendar" />
              </span>
              {" "}
              <div className="min-w-0">
                <span className="cyc-num">Paso 1</span>
                {" "}
                <h4 className="cyc-ttl">Evento</h4>
                <div className="cyc-sub">Summit en vivo</div>
                <p className="cyc-txt">Check-ins NFC, charlas y misiones generan señales en tiempo real.</p>
              </div>
            </li>
            <div className="cyc-link" aria-hidden="true" style={{ "--d": "0s" }}>
              <span className="cyc-line" />
              <span className="cyc-head">
                <i className="ico" data-i="chev" />
              </span>
            </div>
            <li className="cyc-step" style={{ "--c": "91,60,255", "--fg": "#CF9BFF", "--d": "1s" }}>
              <span className="cyc-ico">
                <i className="ico" data-i="bulb" />
              </span>
              {" "}
              <div className="min-w-0">
                <span className="cyc-num">Paso 2</span>
                {" "}
                <h4 className="cyc-ttl">Insight</h4>
                <div className="cyc-sub">IA y resúmenes</div>
                <p className="cyc-txt">LLM + RAG convierte cada sesión en ideas clave, citando sesión y minuto.</p>
              </div>
            </li>
            <div className="cyc-link" aria-hidden="true" style={{ "--d": "1s" }}>
              <span className="cyc-line" />
              <span className="cyc-head">
                <i className="ico" data-i="chev" />
              </span>
            </div>
            <li className="cyc-step" style={{ "--c": "0,242,254", "--fg": "#9DB4FF", "--d": "2s" }}>
              <span className="cyc-ico">
                <i className="ico" data-i="handshake" />
              </span>
              {" "}
              <div className="min-w-0">
                <span className="cyc-num">Paso 3</span>
                {" "}
                <h4 className="cyc-ttl">Conexión</h4>
                <div className="cyc-sub">Networking inteligente · NFC</div>
                <p className="cyc-txt">Matches con la razón visible e intercambio de contacto en un toque.</p>
              </div>
            </li>
            <div className="cyc-link" aria-hidden="true" style={{ "--d": "2s" }}>
              <span className="cyc-line" />
              <span className="cyc-head">
                <i className="ico" data-i="chev" />
              </span>
            </div>
            <li className="cyc-step" style={{ "--c": "16,185,129", "--fg": "#6EE7B7", "--d": "3s" }}>
              <span className="cyc-ico">
                <i className="ico" data-i="bolt" />
              </span>
              {" "}
              <div className="min-w-0">
                <span className="cyc-num">Paso 4</span>
                {" "}
                <h4 className="cyc-ttl">Acción</h4>
                <div className="cyc-sub">Plan de 30 días y ejecución</div>
                <p className="cyc-txt">El Dossier traduce lo aprendido en tareas, responsables y seguimientos.</p>
              </div>
            </li>
          </ol>
        </div>
        {" "}
        <span className="vl" data-cl="0" aria-hidden="true">Evento</span>
        <span className="vl" data-cl="1" aria-hidden="true">Insight</span>
        <span className="vl" data-cl="2" aria-hidden="true">Conexión</span>
        <span className="vl" data-cl="3" aria-hidden="true">Acción</span>
      </div>
    </div>
  );
}
