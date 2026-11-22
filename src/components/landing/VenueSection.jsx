/**
 * Escena 06: maqueta 3D del recinto con ruta luminosa a Labs, asistentes y tótems NFC.
 */
export default function VenueSection() {
  return (
    <section className="band cine-sec" id="recinto3d" aria-labelledby="rcTitle">
      <div className="cine-pin" id="chVenue" style={{ "--len": "3" }}>
        <div className="cine-sticky">
          <div className="wrap cine-split is-left">
            <div className="cine-copy">
              <span className="eyebrow">Recinto 3D</span>
              {" "}
              <h2 className="h2 mt-4" id="rcTitle">Llega a tu sala sin perderte.</h2>
              <ol className="stp-list">
                <li className="stp">
                  <span className="stp-k mono">01 · El recinto</span>
                  <p>Auditorio principal, salas, labs y lounge en una maqueta que puedes recorrer.</p>
                </li>
                <li className="stp">
                  <span className="stp-k mono">02 · Tu ruta</span>
                  <p>
                    <b>Ruta a Labs · 25 m · 1 min</b>
                    {" "}La app te guía hasta tu próxima sesión.
                  </p>
                </li>
                <li className="stp">
                  <span className="stp-k mono">03 · Tótems NFC</span>
                  <p>Acerca tu credencial al pasar y tus misiones se registran solas.</p>
                </li>
              </ol>
            </div>
          </div>
          {" "}
          <span className="vl" data-vl="aud">Auditorio</span>
          <span className="vl" data-vl="salas">Salas</span>
          <span className="vl vl-hot" data-vl="labs">Labs</span>
          <span className="vl" data-vl="lounge">Lounge</span>
          <span className="vl vl-route" data-vl="route">
            <i className="ico" data-i="pin" aria-hidden="true" />
            Ruta a Labs · 25 m · 1 min
          </span>
        </div>
      </div>
    </section>
  );
}
