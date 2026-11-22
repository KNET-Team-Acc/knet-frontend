/**
 * Modal #m-res: su contenido lo genera el motor de la app.
 */
export default function PostSummitSummaryModal() {
  return (
    <div className="modal" id="m-res" role="dialog" aria-modal="true" aria-label="Resumen post-Summit" hidden>
      <div className="modal-card glass-deep res-card" id="resBody" />
    </div>
  );
}
