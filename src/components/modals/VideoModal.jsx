/**
 * Video del proyecto.
 */
export default function VideoModal() {
  return (
    <div className="modal" id="m-video" role="dialog" aria-modal="true" aria-labelledby="vidTitle" hidden>
      <div className="modal-card wide glass-deep">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <span className="chip chip-accent mb-3">
              <i className="ico" data-i="play" />
              Reto 03 · Pitch
            </span>
            {" "}
            <h3 id="vidTitle" className="font-display font-bold text-2xl">KNET en 60 segundos</h3>
          </div>
          {" "}
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px", minWidth: "40px" }} data-close="" aria-label="Cerrar">
            <i className="ico" data-i="x" />
          </button>
        </div>
        <div className="scene" id="scene" aria-live="polite" />
        <div className="scene-progress mt-4" id="sceneProg" />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <p className="text-mute text-sm" id="vidNote">Storyboard animado del pitch.</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" id="scenePause">
              <i className="ico" data-i="pause" />
              Pausar
            </button>
            {" "}
            <a className="btn btn-primary btn-sm" id="vidLink" href="#" target="_blank" rel="noopener" hidden>
              <i className="ico" data-i="play" />
              Ver video completo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
