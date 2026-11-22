import knetLogoImg from "@/assets/knet-logo.webp";

/**
 * Barra superior: marca, idioma, notificaciones, usuario, conexión con LinkedIn y menú móvil.
 */
export default function Navbar() {
  return (
    <header className="nav" id="nav">
      <div className="wrap nav-row">
        <a href="#top" className="nav-brand" aria-label="KNET, inicio">
          <img src={knetLogoImg} alt="" width="62" height="40" className="nav-logo" decoding="async" />
          {" "}
          <span className="brand-text flex flex-col leading-none">
            <span className="wordmark">KNET</span>
            {" "}
            <span className="brand-sub" title={"KNET: Knowledge Network & Event Technology"}>
              <span className="bs-l">Knowledge Network</span>
              <span className="bs-l">{"& Event Technology"}</span>
            </span>
          </span>
        </a>
        {" "}
        <nav className="nav-landing nav-links" aria-label="Secciones">
          <a className="navlink" href="#caracteristicas" data-i18n="nav.features">Características</a>
          {" "}
          <a className="navlink" href="#demo" data-i18n="nav.demo">Demo Interactiva</a>
          {" "}
          <a className="navlink" href="#gamificacion" data-i18n="nav.gam">Gamificación</a>
          {" "}
          <a className="navlink" href="#arquitectura" data-i18n="nav.arch">Arquitectura IA</a>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm theme-btn" id="themeBtn" aria-pressed="false" aria-label="Cambiar a modo claro" title="Cambiar a modo claro">
            <span className="theme-sw" aria-hidden="true">
              <i className="ts-knob" />
              <svg className="ts-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
              </svg>
              <svg className="ts-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </span>
            <span className="theme-lbl" id="themeLbl">Encender luces</span>
          </button>
          {" "}
          <div className="lang" id="langWrap">
            <button className="btn btn-ghost btn-sm lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false" aria-controls="langMenu" aria-label="Idioma / Language">
              <i className="ico" data-i="globe" />
              <span id="langCur">ES</span>
            </button>
            {" "}
            <div className="lang-menu" id="langMenu" role="menu" hidden>
              <button type="button" role="menuitemradio" aria-checked="true" data-lang="es">
                <span>Español</span>
                <span className="mono">ES</span>
              </button>
              {" "}
              <button type="button" role="menuitemradio" aria-checked="false" data-lang="en">
                <span>English</span>
                <span className="mono">EN</span>
              </button>
            </div>
          </div>
          <div className="notif" id="notifWrap" hidden>
            <button type="button" className="btn btn-ghost btn-sm notif-btn" id="notifBtn" aria-haspopup="dialog" aria-expanded="false" aria-controls="notifPanel" aria-label="Notificaciones">
              <svg className="bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="notif-count" id="notifCount" hidden>0</span>
            </button>
            {" "}
            <div className="notif-panel" id="notifPanel" role="dialog" aria-label="Notificaciones" hidden />
          </div>
          {" "}
          <a href="#perfil" id="userChip" className="user-chip" hidden aria-label="Ir a mi perfil" title="Ir a mi perfil" />
          {" "}
          <button className="btn btn-primary btn-sm" data-connect="" id="navConnect">
            <i className="ico" data-i="link" />
            <span className="hidden sm:inline" id="navLblL">Conectar LinkedIn MCP</span>
            <span className="sm:hidden" id="navLblS">Conectar MCP</span>
          </button>
          {" "}
          <button className="btn btn-ghost btn-sm logout-btn" id="logoutBtn" hidden title="Cerrar sesión. Tu progreso queda guardado." aria-label="Cerrar sesión">
            <svg className="door-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 21h18" />
              <path d="M6 21V4h12v17" />
              <g className="door-panel">
                <path d="M6 21V4h12v17z" fill="currentColor" fillOpacity=".2" />
                <path d="M15 12.5v.01" />
              </g>
            </svg>
            <span>Cerrar sesión</span>
          </button>
          {" "}
          <button className="btn btn-ghost btn-sm menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mobileMenu" aria-label="Abrir menú">
            <i className="ico" data-i="menu" />
          </button>
        </div>
      </div>
      <div id="mobileMenu" className="wrap mobile-menu" hidden>
        <div className="glass rounded-2xl p-2 mb-3 grid">
          <div className="mm-brand">
            <b>KNET</b>
            <span>{"Knowledge Network & Event Technology"}</span>
          </div>
          {" "}
          <a className="navlink py-3" href="#caracteristicas" data-i18n="nav.features">Características</a>
          {" "}
          <a className="navlink py-3" href="#demo" data-i18n="nav.demo">Demo Interactiva</a>
          {" "}
          <a className="navlink py-3" href="#gamificacion" data-i18n="nav.gam">Gamificación</a>
          {" "}
          <a className="navlink py-3" href="#arquitectura" data-i18n="nav.arch">Arquitectura IA</a>
        </div>
      </div>
    </header>
  );
}
