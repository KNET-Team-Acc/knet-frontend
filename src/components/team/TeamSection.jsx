/**
 * Las personas detrás de KNET. Las tarjetas se generan desde src/data/team.js.
 */
export default function TeamSection() {
  return (
    <section className="team-sec" aria-labelledby="teamTitle">
      <div className="team-head">
        <div>
          <span className="eyebrow" data-i18n="team.eyebrow">Equipo KNET</span>
          {" "}
          <h2 id="teamTitle" className="font-display font-extrabold mt-3" style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", lineHeight: "1.1" }} data-i18n="team.h2">
            Las personas detrás de KNET
          </h2>
        </div>
      </div>
      <div className="team-grid" id="team">{/* tarjetas de integrantes generadas desde TEAM */}</div>
    </section>
  );
}
