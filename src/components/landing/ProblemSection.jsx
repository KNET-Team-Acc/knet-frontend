import CycleScene from "@/components/landing/CycleScene";

/**
 * Escenas 02 y 03 (fijadas): de caos a inteligencia organizada + ciclo Evento → Insight → Conexión → Acción.
 */
export default function ProblemSection() {
  return (
    <section className="band cine-sec" id="problema" aria-labelledby="probTitle">
      <div className="cine-pin" id="chKnow" style={{ "--len": "3.2" }}>
        <div className="cine-sticky">
          <div className="wrap cine-split is-right">
            <div className="cine-copy">
              <span className="eyebrow" data-i18n="prob.eyebrow">El problema</span>
              {" "}
              <h2 className="h2 mt-4" id="probTitle" data-i18n="prob.h2">
                Los Summits generan conocimiento valioso. Casi todo se queda en la sala.
              </h2>
              <p className="cine-kick mono">Del caos a la inteligencia organizada</p>
              <ol className="tx-list">
                <li className="tx">
                  <span className="tx-n">01</span>
                  <s>Networking al azar</s>
                  <i className="ico" data-i="arrow" aria-hidden="true" />
                  <b>Matchmaking con IA</b>
                </li>
                <li className="tx">
                  <span className="tx-n">02</span>
                  <s>Charlas pasivas</s>
                  <i className="ico" data-i="arrow" aria-hidden="true" />
                  <b>Participación gamificada</b>
                </li>
                <li className="tx">
                  <span className="tx-n">03</span>
                  <s>Contactos que se pierden</s>
                  <i className="ico" data-i="arrow" aria-hidden="true" />
                  <b>Contactos con contexto</b>
                </li>
                <li className="tx">
                  <span className="tx-n">04</span>
                  <s>Conocimiento que se evapora</s>
                  <i className="ico" data-i="arrow" aria-hidden="true" />
                  <b>Dossier post-Summit</b>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <CycleScene />
    </section>
  );
}
