/**
 * Re-aceptación obligatoria cuando el servidor responde 409 legal_outdated: no se puede cerrar
 * (data-locked) hasta aceptar la versión vigente o cerrar sesión. El motor inserta las casillas.
 */
export default function LegalUpdateModal() {
  return (
    <div className="modal" id="m-legalup" role="dialog" aria-modal="true" aria-labelledby="legalUpTitle" data-locked="1" hidden>
      <div className="modal-card glass-deep" style={{ width: "min(580px,100%)" }}>
        <span className="chip chip-accent mb-3">
          <i className="ico" data-i="shield" />
          Documentos actualizados
        </span>
        <h3 id="legalUpTitle" className="font-display font-bold text-2xl">Actualizamos los Términos y la Política de privacidad</h3>
        <p className="text-mute text-[15px] mt-1">Para seguir usando tu panel, lee y acepta la versión vigente.</p>
        <div id="legalUpBody" className="mt-4" />
        <p className="pf-err" id="legalUpErr" role="alert" hidden />
        <div className="av-foot" style={{ marginTop: "16px" }}>
          <button type="button" className="btn btn-ghost btn-sm" data-legaluplogout="">Cerrar sesión</button>
          <button type="button" className="btn btn-primary" data-legalupaccept="">
            <i className="ico" data-i="check" />
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
