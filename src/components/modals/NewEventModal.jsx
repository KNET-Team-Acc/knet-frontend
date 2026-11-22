/**
 * Modal #m-newev: su contenido lo genera el motor de la app.
 */
export default function NewEventModal() {
  return (
    <div className="modal" id="m-newev" role="dialog" aria-modal="true" aria-labelledby="neTitle" hidden>
      <div className="modal-card glass-deep ne-card" id="neBody" />
    </div>
  );
}
