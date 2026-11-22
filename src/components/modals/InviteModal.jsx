/**
 * Modal #m-invite: su contenido lo genera el motor de la app.
 */
export default function InviteModal() {
  return (
    <div className="modal" id="m-invite" role="dialog" aria-modal="true" aria-labelledby="ivTitle" hidden>
      <div className="modal-card glass-deep iv-card" id="ivBody" />
    </div>
  );
}
