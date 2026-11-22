/**
 * Lema: Evento → Insight → Conexión → Acción.
 */
export default function Motto() {
  return (
    <div className="motto" aria-label="Evento, Insight, Conexión, Acción">
      <span className="motto-kicker" data-i18n="motto.kicker">Nuestro lema</span>
      {" "}
      <div className="motto-row">
        <span className="motto-star" aria-hidden="true">✦</span>
        {" "}
        <span className="motto-node" style={{ "--c": "161,0,255", "--fg": "#DCAFFF" }}>
          <i className="ico" data-i="calendar" />
          Evento
        </span>
        {" "}
        <span className="motto-arrow" aria-hidden="true">
          <span />
          <i className="ico" data-i="chev" />
        </span>
        {" "}
        <span className="motto-node" style={{ "--c": "91,60,255", "--fg": "#CF9BFF" }}>
          <i className="ico" data-i="bulb" />
          Insight
        </span>
        {" "}
        <span className="motto-arrow" aria-hidden="true">
          <span />
          <i className="ico" data-i="chev" />
        </span>
        {" "}
        <span className="motto-node" style={{ "--c": "0,242,254", "--fg": "#9DB4FF" }}>
          <i className="ico" data-i="handshake" />
          Conexión
        </span>
        {" "}
        <span className="motto-arrow" aria-hidden="true">
          <span />
          <i className="ico" data-i="chev" />
        </span>
        {" "}
        <span className="motto-node" style={{ "--c": "16,185,129", "--fg": "#6EE7B7" }}>
          <i className="ico" data-i="bolt" />
          Acción
        </span>
        {" "}
        <span className="motto-star" aria-hidden="true">✦</span>
      </div>
    </div>
  );
}
