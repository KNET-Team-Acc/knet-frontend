/**
 * Modal #m-dm: su contenido lo genera el motor de la app.
 */
export default function DirectMessageModal() {
  return (
    <div className="modal" id="m-dm" role="dialog" aria-modal="true" aria-labelledby="dmTitle" hidden>
      <div className="modal-card glass-deep dm-card" id="dmBody" />
    </div>
  );
}
