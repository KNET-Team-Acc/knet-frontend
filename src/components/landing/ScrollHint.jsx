/**
 * Indicador «Desliza para recorrer KNET».
 */
export default function ScrollHint() {
  return (
    <a href="#problema" className="scroll-hint" aria-label="Desliza para recorrer KNET">
      <span className="sh-line" aria-hidden="true">
        <i />
      </span>
      <span className="sh-txt">Desliza para recorrer KNET</span>
    </a>
  );
}
