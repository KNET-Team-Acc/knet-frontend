/**
 * Modal #m-person: su contenido lo genera el motor de la app.
 */
export default function PersonModal() {
  return (
    <div className="modal" id="m-person" role="dialog" aria-modal="true" aria-labelledby="personName" hidden>
      <div className="modal-card glass-deep person-card" id="personBody" />
    </div>
  );
}
