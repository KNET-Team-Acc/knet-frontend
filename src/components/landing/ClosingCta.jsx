import knetEmblemImg from "@/assets/knet-emblem.webp";

/**
 * Escena 09: cierre «Lleva tu Summit más allá del último keynote».
 */
export default function ClosingCta() {
  return (
    <div className="footer-cta glass-deep">
      <div className="cta-grid">
        <div className="min-w-0">
          <span className="eyebrow" data-i18n="cta.eyebrow">Lleva tu Summit más allá del último keynote</span>
          {" "}
          <h2 className="h2 mt-4" data-i18n="cta.h2">
            Que la próxima vez que se apaguen las luces, el conocimiento siga encendido.
          </h2>
          <div className="flex flex-wrap gap-3 mt-8">
            <button className="btn btn-primary" data-connect="">
              <i className="ico" data-i="link" />
              <span className="cta-connect-lbl">Conectar LinkedIn MCP</span>
            </button>
            {" "}
            <a href="#demo" className="btn btn-ghost">
              <i className="ico" data-i="bolt" />
              Probar el simulador
            </a>
          </div>
        </div>
        <div className="cta-logo">
          <span className="cta-logo-glow" aria-hidden="true" />
          {" "}
          <img src={knetEmblemImg} alt="Emblema de KNET: una K con conexiones a networking, ideas, alianzas, crecimiento y un escenario de conferencia" width="760" height="487" decoding="async" />
        </div>
      </div>
    </div>
  );
}
