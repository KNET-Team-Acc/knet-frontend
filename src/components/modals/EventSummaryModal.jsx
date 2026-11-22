/**
 * Modal #m-sum: su contenido lo genera el motor de la app.
 */
export default function EventSummaryModal() {
  return (
    <div className="modal" id="m-sum" role="dialog" aria-modal="true" aria-labelledby="sumTitle" hidden>
      <div className="modal-card glass-deep sum-card" id="sumBody" />
    </div>
  );
}
