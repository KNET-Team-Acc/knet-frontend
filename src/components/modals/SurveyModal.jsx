/**
 * Modal #m-survey: su contenido lo genera el motor de la app.
 */
export default function SurveyModal() {
  return (
    <div className="modal" id="m-survey" role="dialog" aria-modal="true" aria-labelledby="svTitle" hidden>
      <div className="modal-card glass-deep sv-card" id="svBody" />
    </div>
  );
}
