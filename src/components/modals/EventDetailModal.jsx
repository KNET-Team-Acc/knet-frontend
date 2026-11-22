/**
 * Modal #m-event: su contenido lo genera el motor de la app.
 */
export default function EventDetailModal() {
  return (
    <div className="modal" id="m-event" role="dialog" aria-modal="true" aria-labelledby="evTitle" hidden>
      <div className="modal-card glass-deep evm-card" id="evBody" />
    </div>
  );
}
