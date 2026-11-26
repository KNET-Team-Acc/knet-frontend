/**
 * Animación del hero: una persona en el Summit saca su celular y entra a KNET (5 pantallas).
 */
export default function HeroStory() {
  return (
    <div className="story" id="heroStory" data-phase="event" role="img" aria-label="Animación: una persona en un Summit saca su celular, entra a KNET y recorre su agenda con IA, su match, una misión NFC, el recinto 3D y su Dossier.">
      <div className="st-scene" aria-hidden="true">
        <div className="st-beam l" />
        <div className="st-beam r" />
        <div className="st-screen">
          <span className="st-sk">{"Tu evento"}</span>
          <b>Agentes autónomos en producción</b>
          <span className="st-wave">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="st-stage">
          <span className="st-speaker" />
        </div>
        <div className="st-crowd r1" />
        <div className="st-crowd r2" />
        <div className="st-crowd r3" />
        {" "}
        <svg className="st-person" viewBox="0 0 200 220" aria-hidden="true">
          <path d="M100 18c22 0 38 17 38 40 0 18-9 31-21 37 34 8 63 30 73 66v59H10v-59c10-36 39-58 73-66-12-6-21-19-21-37 0-23 16-40 38-40z" />
        </svg>
      </div>
      <div className="st-phone">
        <svg className="st-hand" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M8 120c6-30 14-52 30-62l10-24c3-7 12-6 13 2l1 14 26-6c8-2 14 8 6 13l-12 7 18 2c8 1 8 12 0 13l-16 2 12 3c7 2 6 12-1 12l-14-1 8 4c6 3 2 12-5 10L60 104c-6 8-10 12-14 16z" />
        </svg>
        {" "}
        <div className="st-device">
          <div className="st-notch" />
          <div className="st-fit">
            <div className="hd" id="heroDevice">
              <div className="hd-top">
                <span className="mono">DÍA 1 · 10:18</span>
                <span className="hd-live">
                  <i />
                  EN VIVO
                </span>
              </div>
              <div className="hd-screens">
                <section className="hd-s on" aria-label="Agenda IA">
                  <div className="hd-k">
                    <i className="ico" data-i="bot" />
                    Agenda IA
                  </div>
                  <h4>Tu día, armado en segundos</h4>
                  <ul className="hd-tl">
                    <li style={{ "--i": "0" }}>
                      <b>09:00</b>
                      <span>Agentes autónomos en producción</span>
                      <em>Keynote</em>
                    </li>
                    <li style={{ "--i": "1" }}>
                      <b>10:30</b>
                      <span>MCP para la empresa</span>
                      <em>Lab 1</em>
                    </li>
                    <li style={{ "--i": "2" }}>
                      <b>12:15</b>
                      <span>Café con tu match</span>
                      <em>Lounge</em>
                    </li>
                    <li style={{ "--i": "3" }}>
                      <b>14:00</b>
                      <span>RAG que sí escala</span>
                      <em>Lab 3</em>
                    </li>
                  </ul>
                </section>
                <section className="hd-s" aria-label="Match estratégico">
                  <div className="hd-k">
                    <i className="ico" data-i="users" />
                    Match estratégico
                  </div>
                  <h4>Tu match está a 2 salas</h4>
                  <div className="hd-match">
                    <span className="hd-av">TÚ</span>
                    <span className="hd-link">
                      <i />
                    </span>
                    <span className="hd-av b">IA</span>
                  </div>
                  <div className="hd-aff">
                    <b>94%</b>
                    <span>afinidad · interés en RAG</span>
                  </div>
                  <div className="hd-btn">Agendar 15 min</div>
                </section>
                <section className="hd-s" aria-label="Misión NFC">
                  <div className="hd-k">
                    <i className="ico" data-i="nfc" />
                    Misión en vivo
                  </div>
                  <h4>Toca el tótem NFC</h4>
                  <div className="hd-nfc">
                    <i />
                    <i />
                    <i />
                    <span>
                      <i className="ico" data-i="nfc" />
                    </span>
                  </div>
                  <div className="hd-xp">+120 XP</div>
                </section>
                <section className="hd-s" aria-label="Recinto 3D">
                  <div className="hd-k">
                    <i className="ico" data-i="map" />
                    Recinto 3D
                  </div>
                  <h4>Llega a tu sala sin perderte</h4>
                  <div className="hd-venue">
                    <div className="hv-floor">
                      <span className="z a" />
                      <span className="z b" />
                      <span className="z c" />
                      <span className="z d" />
                      <i className="hv-route" />
                      <b className="hv-me" />
                    </div>
                  </div>
                  <div className="hd-pdf">
                    <i className="ico" data-i="pin" />
                    Ruta a Labs · 25 m · 1 min
                  </div>
                </section>
                <section className="hd-s" aria-label="Dossier">
                  <div className="hd-k">
                    <i className="ico" data-i="file" />
                    Dossier post-Summit
                  </div>
                  <h4>Tu resumen está listo</h4>
                  <div className="hd-doc">
                    <span style={{ "--w": "92%" }} />
                    <span style={{ "--w": "70%" }} />
                    <span style={{ "--w": "84%" }} />
                    <span style={{ "--w": "56%" }} />
                    <span style={{ "--w": "76%" }} />
                  </div>
                  <div className="hd-pdf">
                    <i className="ico" data-i="file" />
                    3 ideas · 2 contactos · plan de 30 días
                  </div>
                </section>
              </div>
              <div className="hd-dots" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <div className="st-lock">
            <b>10:18</b>
            <span>
              <i className="ico" data-i="spark" />
              KNET · Tu match está a 2 salas
            </span>
          </div>
        </div>
      </div>
      <div className="st-cap" aria-hidden="true">
        <span className="st-step" id="stStep">1</span>
        <span id="stCap">Estás en el evento</span>
        <span className="st-bar">
          <i id="stBar" />
        </span>
      </div>
    </div>
  );
}
