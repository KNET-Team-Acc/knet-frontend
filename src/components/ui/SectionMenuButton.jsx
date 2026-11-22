/**
 * Botón flotante para volver al menú de secciones en celular.
 */
export default function SectionMenuButton() {
  return (
    <button type="button" className="sec-btn" id="secBtn" hidden aria-label="Ir al menú de secciones">
      <i className="ico" data-i="menu" />
      <span>Secciones</span>
    </button>
  );
}
