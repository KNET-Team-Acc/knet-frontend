/**
 * Documentos legales (términos, privacidad, cookies, reembolsos, créditos).
 */
export default function LegalModal() {
  return (
    <div className="modal legal-modal" id="m-legal" role="dialog" aria-modal="true" aria-labelledby="legalTitle" hidden>
      <div className="modal-card glass-deep legal-card">
        <div className="mh">
          <nav className="legal-tabs" id="legalTabs" aria-label="Documentos" />
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px", minWidth: "40px" }} data-legalclose="" aria-label="Cerrar documento">
            <i className="ico" data-i="x" />
          </button>
        </div>
        <div className="legal-body" id="legalBody" tabIndex="0" />
        <div className="legal-foot">
          <span className="text-[12px] text-mute">
            Documento informativo del prototipo KNET. Revísalo con un abogado antes de usarlo en producción.
          </span>
          <button type="button" className="btn btn-primary btn-sm" data-legalclose="">Entendido</button>
        </div>
      </div>
    </div>
  );
}
