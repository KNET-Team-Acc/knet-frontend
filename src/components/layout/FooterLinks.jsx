/**
 * Columnas del footer: marca con logo, producto, legal y contacto.
 */
export default function FooterLinks() {
  return (
    <div className="ft-grid">
      <div className="ft-brand">
        <img className="ft-logo" alt="Logo de KNET" width="72" height="47" hidden />
        {" "}
        <b className="ft-word">KNET</b>
        {" "}
        <span className="ft-sub">{"Knowledge Network & Event Technology"}</span>
        {" "}
        <p>La plataforma que mantiene vivo el conocimiento de tus eventos.</p>
      </div>
      <nav className="ft-col" aria-label="Producto">
        <h4>Producto</h4>
        {" "}
        <a href="#caracteristicas">Características</a>
        {" "}
        <a href="#demo">Demo interactiva</a>
        {" "}
        <a href="#arquitectura">Cómo funciona</a>
        {" "}
        <a href="#" data-open="video">Ver video</a>
      </nav>
      <nav className="ft-col legal-links" aria-label="Documentos legales">
        <h4>Legal</h4>
        {" "}
        <a href="#terminos" data-legal="terminos">Términos y condiciones</a>
        {" "}
        <a href="#privacidad" data-legal="privacidad">Política de privacidad</a>
        {" "}
        <a href="#cookies" data-legal="cookies">Política de cookies</a>
        {" "}
        <a href="#reembolsos" data-legal="reembolsos">Política de reembolsos</a>
        {" "}
        <a href="#creditos" data-legal="creditos">Créditos y licencias</a>
        {" "}
        <a href="#registro" data-registro="" className="reg-only" hidden>Registro de consentimientos</a>
      </nav>
      <div className="ft-col">
        <h4>Contacto</h4>
        {" "}
        <a id="ftMail" href="#">Correo</a>
        {" "}
        <a href="#cookies" data-storagecfg="">Configurar almacenamiento</a>
        {" "}
        <details className="ft-legal">
          <summary>Datos del responsable</summary>
          <p className="legal-id" id="legalId" />
        </details>
      </div>
    </div>
  );
}
