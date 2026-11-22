/**
 * Editor del avatar ilustrado.
 */
export default function AvatarModal() {
  return (
    <div className="modal" id="m-avatar" role="dialog" aria-modal="true" aria-labelledby="avTitle" hidden>
      <div className="modal-card glass-deep av-card" id="avBody" />
    </div>
  );
}
