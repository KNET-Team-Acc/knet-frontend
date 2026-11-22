/**
 * Escena 08: privacidad y confianza (cúpula 3D + 4 principios).
 */
export default function TrustSection() {
  return (
    <section className="band cine-sec" id="confianza" aria-labelledby="cfTitle">
      <div className="cine-pin" id="chShield" style={{ "--len": "2.6" }}>
        <div className="cine-sticky">
          <div className="wrap cine-split is-right">
            <div className="cine-copy">
              <span className="eyebrow">Privacidad y confianza</span>
              {" "}
              <h2 className="h2 mt-4" id="cfTitle">Tú tienes el control.</h2>
              <div className="cf-list">
                <div className="cf-i glass rounded-2xl p-5 flex gap-3">
                  <i className="ico mt-0.5" style={{ color: "var(--t-lilac)" }} data-i="shield" />
                  <div>
                    <div className="font-semibold">Privacidad primero</div>
                    <div className="text-mute text-sm">Tú das el permiso y puedes borrarlo todo.</div>
                  </div>
                </div>
                <div className="cf-i glass rounded-2xl p-5 flex gap-3">
                  <i className="ico mt-0.5" style={{ color: "var(--t-blue)" }} data-i="bot" />
                  <div>
                    <div className="font-semibold">Un asistente por tarea</div>
                    <div className="text-mute text-sm">Cada asistente de IA hace una sola cosa, y la hace bien.</div>
                  </div>
                </div>
                <div className="cf-i glass rounded-2xl p-5 flex gap-3">
                  <i className="ico mt-0.5" style={{ color: "var(--t-emerald)" }} data-i="bolt" />
                  <div>
                    <div className="font-semibold">Al instante</div>
                    <div className="text-mute text-sm">Tus XP y tus misiones se actualizan en tiempo real.</div>
                  </div>
                </div>
                <div className="cf-i glass rounded-2xl p-5 flex gap-3">
                  <i className="ico mt-0.5" style={{ color: "var(--accent-soft)" }} data-i="globe" />
                  <div>
                    <div className="font-semibold">Presencial o remoto</div>
                    <div className="text-mute text-sm">Quien está lejos juega las mismas misiones.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
