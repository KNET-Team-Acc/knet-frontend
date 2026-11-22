/**
 * Registro de consentimientos del titular.
 */
export default function ConsentLogModal() {
  return (
    <div className="modal" id="m-registro" role="dialog" aria-modal="true" aria-labelledby="regTitle" hidden>
      <div className="modal-card glass-deep" style={{ width: "min(1100px,100%)" }}>
        <div className="mh">
          <div>
            <span className="chip chip-accent mb-3">
              <i className="ico" data-i="shield" />
              Ley 1581 de 2012 · art. 17
            </span>
            <h3 id="regTitle" className="font-display font-bold text-2xl">Registro de consentimientos</h3>
            <p className="text-mute text-[14px] mt-1">
              Prueba de cuándo y cómo cada persona aceptó los Términos, la Política de privacidad y los permisos de LinkedIn.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px", minWidth: "40px" }} data-close="" aria-label="Cerrar">
            <i className="ico" data-i="x" />
          </button>
        </div>
        <div id="regBody" style={{ marginTop: "16px" }} />
      </div>
    </div>
  );
}
