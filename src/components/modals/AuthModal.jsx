/**
 * Cuenta KNET: iniciar sesión o crear cuenta con correo y contraseña, o continuar con LinkedIn.
 * El motor (src/lib/engine/knetApp.js) cambia de pestaña, inserta las casillas legales y envía el formulario.
 */
export default function AuthModal() {
  return (
    <div className="modal" id="m-auth" role="dialog" aria-modal="true" aria-labelledby="authTitle" hidden>
      <div className="modal-card glass-deep" style={{ width: "min(520px,100%)" }}>
        <div className="mh">
          <div>
            <span className="chip chip-accent mb-3">
              <i className="ico" data-i="shield" />
              Cuenta KNET
            </span>
            {" "}
            <h3 id="authTitle" className="font-display font-bold text-2xl">Entra a tu cuenta KNET</h3>
            <p className="text-mute text-[15px] mt-1" id="authSub">Guarda tu perfil y tu progreso en todos tus dispositivos.</p>
          </div>
          {" "}
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px", minWidth: "40px" }} data-close="" aria-label="Cerrar">
            <i className="ico" data-i="x" />
          </button>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Tipo de acceso">
          <button type="button" role="tab" className="auth-tab" data-authtab="login" aria-selected="true">Iniciar sesión</button>
          <button type="button" role="tab" className="auth-tab" data-authtab="register" aria-selected="false">Crear cuenta</button>
        </div>
        <p className="auth-notice" id="authNotice" role="status" hidden />
        <form id="authForm" className="auth-form" noValidate>
          <div className="pf-field" id="authNameRow" hidden>
            <label htmlFor="au-name">Nombre</label>
            <input id="au-name" className="select" maxLength={120} autoComplete="name" placeholder="Ej. Paola Barros" />
          </div>
          <div className="pf-field">
            <label htmlFor="au-email">Correo</label>
            <input id="au-email" type="email" className="select" maxLength={254} autoComplete="email" placeholder="tu@empresa.com" />
          </div>
          <div className="pf-field">
            <label htmlFor="au-pass">Contraseña</label>
            <input id="au-pass" type="password" className="select" maxLength={72} autoComplete="current-password" />
            <span className="kv-note" id="authPassHint" hidden>Mínimo 8 caracteres.</span>
          </div>
          <div id="authLegal" />
          <p className="pf-err" id="authErr" role="alert" hidden />
          <button type="submit" className="btn btn-primary" id="authSubmit">Iniciar sesión</button>
        </form>
        <div id="authLiRow" hidden>
          <div className="auth-or"><span>o</span></div>
          <button type="button" className="btn btn-ghost auth-li" data-authli="">
            <i className="ico" data-i="link" />
            Continuar con LinkedIn
          </button>
        </div>
        <button type="button" className="auth-local" data-authlocal="">Continuar sin cuenta (solo en este navegador)</button>
      </div>
    </div>
  );
}
