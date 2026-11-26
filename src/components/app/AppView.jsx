/**
 * Contenedor del panel (SPA): menú lateral, tour guiado y el panel que pinta cada pestaña.
 */
export default function AppView() {
  return (
    <main id="appView" className="app-main" hidden>
      <div className="wrap app-layout">
        <aside className="app-side" id="appSide" aria-label="Navegación del panel">
          <div id="sideMe" />
          {" "}
          <button type="button" className="side-toggle" id="sideToggle" aria-expanded="false" aria-controls="appTabs" />
          {" "}
          <nav className="app-tabs" aria-label="Secciones de KNET" id="appTabs" />
          {" "}
          <button type="button" className="side-inv" id="invBtn" />
          {" "}
          <button type="button" className="side-tour" id="tourBtn">
            <i className="ico" data-i="compass" />
            <span>Tour guiado por KNET</span>
          </button>
        </aside>
        <section id="appPanel" className="app-panel" tabIndex="-1" />
      </div>
    </main>
  );
}
