/**
 * Aviso de almacenamiento local y preferencias (cumplimiento de privacidad).
 */
export default function StorageBanner() {
  return (
    <section className="storage-banner glass-deep" id="storageBanner" aria-labelledby="sbTitle" hidden>
      <div className="sb-text">
        <h2 id="sbTitle" className="font-display font-bold text-[16px]">Tu privacidad en KNET</h2>
        <p className="text-[13.5px] text-mute">
          No usamos cookies de rastreo ni de publicidad. Guardamos en tu navegador solo lo necesario para que la demo funcione. Con tu permiso, también recordamos tu idioma y si dejaste las luces encendidas.{" "}
          <a href="#cookies" data-legal="cookies">Política de cookies</a>
        </p>
        {" "}
        <label className="mcp-sim" htmlFor="sbPrefs">
          <input type="checkbox" id="sbPrefs" />
          <span>Recordar mi idioma y el modo claro u oscuro entre visitas (preferencias)</span>
        </label>
      </div>
      <div className="sb-actions">
        <button type="button" className="btn btn-ghost btn-sm" data-sb="necessary">Solo lo necesario</button>
        <button type="button" className="btn btn-ghost btn-sm" data-sb="save">Guardar elección</button>
        <button type="button" className="btn btn-primary btn-sm" data-sb="all">Aceptar preferencias</button>
      </div>
    </section>
  );
}
