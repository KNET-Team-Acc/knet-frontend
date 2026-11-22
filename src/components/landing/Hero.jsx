import HeroStory from "@/components/landing/HeroStory";

/**
 * Hero: titular, propuesta de valor, CTAs y la historia animada del celular.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ paddingBlock: "clamp(40px, 7vw, 96px) clamp(56px, 8vw, 112px)" }}>
      <canvas id="net" aria-hidden="true" />
      <div className="wrap relative hero-grid">
        <div className="min-w-0">
          <div className="hero-badge rv" style={{ "--d": ".05s" }}>
            <span className="hero-badge-dot" aria-hidden="true" />
            <b>KNET</b>
            <span>{"Knowledge Network & Event Technology"}</span>
          </div>
          <h1 id="heroTitle" data-i18n-html="hero.h1" className="lights-on font-extrabold rv" style={{ "--d": ".15s", fontSize: "clamp(2.35rem, 5.4vw, 4.5rem)", lineHeight: "1.02", letterSpacing: "-0.035em" }}>
            El conocimiento de un Summit{" "}
            <span className="grad-text">no debería apagarse</span>
            {" "}
            <span className="dim-words">cuando se apagan las luces.</span>
          </h1>
          <p className="lede mt-6 rv" style={{ "--d": ".3s" }} data-i18n-html="hero.lede">
            La plataforma que convierte cada evento en una experiencia viva, y deja tu conocimiento trabajando cuando termina.
          </p>
          <ul className="hero-pills rv" style={{ "--d": ".42s" }} aria-label="Lo que hace KNET">
            <li>
              <i className="ico" data-i="bot" />
              Agenda con IA
            </li>
            <li>
              <i className="ico" data-i="trophy" />
              Misiones gamificadas
            </li>
            <li>
              <i className="ico" data-i="nfc" />
              Networking NFC/QR
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-8 rv" style={{ "--d": ".54s" }}>
            <button className="btn btn-primary hero-cta" data-connect="">
              <i className="ico" data-i="link" />
              <span data-i18n="hero.connect">Conectar LinkedIn MCP</span>
            </button>
            {" "}
            <button className="btn btn-ghost" data-open="video">
              <i className="ico" data-i="play" />
              <span data-i18n="hero.video">Ver cómo funciona</span>
            </button>
          </div>
          {" "}
          <a href="#demo" className="hero-link rv" style={{ "--d": ".64s" }} data-i18n-html="hero.link">
            o prueba el simulador sin conectar{" "}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        {/* Historia: del evento al celular y a KNET */}
        <HeroStory />
      </div>
    </section>
  );
}
