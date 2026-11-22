/**
 * Modal #m-qrscan: su contenido lo genera el motor de la app.
 */
export default function QrScanModal() {
  return (
    <div className="modal" id="m-qrscan" role="dialog" aria-modal="true" aria-labelledby="qsTitle" hidden>
      <div className="modal-card glass-deep qs-card" id="qsBody" />
    </div>
  );
}
