/**
 * Conexión con LinkedIn vía MCP: elegir importar o completar a mano, permisos por campo y extracción.
 */
export default function LinkedInConnectModal() {
  return (
    <div className="modal" id="m-mcp" role="dialog" aria-modal="true" aria-labelledby="mcpTitle" hidden>
      <div className="modal-card glass-deep" style={{ width: "min(680px,100%)" }}>
        <div className="mh">
          <div>
            <span className="chip chip-cyan mb-3">
              <i className="ico" data-i="link" />
              linkedin-mcp
            </span>
            {" "}
            <h3 id="mcpTitle" className="font-display font-bold text-2xl">Crea tu perfil del Summit</h3>
            <p className="text-mute text-[15px] mt-1" id="mcpSub">Importa tus datos desde LinkedIn o escríbelos tú.</p>
          </div>
          {" "}
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px", minWidth: "40px" }} data-close="" aria-label="Cerrar">
            <i className="ico" data-i="x" />
          </button>
        </div>
        <div id="mcpChoice" className="mcp-choice" />
        <div id="mcpAuto" hidden>
          <div className="mcp-bar mt-6" role="progressbar" aria-label="Progreso de la conexión">
            <span id="mcpBar" />
          </div>
          <div className="mcp-split mt-5">
            <div id="mcpSteps" className="grid" />
            <div id="mcpFields" className="grid gap-2" aria-live="polite" />
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="chip">
              <i className="ico" data-i="shield" />
              Perfil básico
            </span>
            {" "}
            <span className="chip">
              <i className="ico" data-i="shield" />
              Industria y seniority
            </span>
            {" "}
            <span className="chip">
              <i className="ico" data-i="shield" />
              Intereses
            </span>
            {" "}
            <span className="chip">
              <i className="ico" data-i="shield" />
              Red de contactos
            </span>
          </div>
        </div>
        <div id="mcpPerm" hidden />
        <form id="mcpForm" noValidate hidden />
        <div id="mcpDone" className="mt-5" hidden />
      </div>
    </div>
  );
}
