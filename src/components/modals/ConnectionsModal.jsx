/**
 * Modal #m-conns: su contenido lo genera el motor de la app.
 */
export default function ConnectionsModal() {
  return (
    <div className="modal" id="m-conns" role="dialog" aria-modal="true" aria-labelledby="connsTitle" hidden>
      <div className="modal-card glass-deep conns-card" id="connsBody" />
    </div>
  );
}
