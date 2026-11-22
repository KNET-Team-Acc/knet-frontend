/**
 * Fondo fijo de la página: retícula ambiental + lienzo WebGL del universo 3D (#cine).
 */
export default function Backdrop() {
  return (
    <>
      <div className="ground" aria-hidden="true" />
      <canvas id="cine" aria-hidden="true" />
    </>
  );
}
