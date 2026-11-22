/**
 * Detalle técnico desplegable: MCP, NFC + QR dinámico, LLM + RAG y orquestación de agentes.
 */
export default function TechDetails() {
  return (
    <details className="ar-tech-box glass mt-5">
      <summary>
        <i className="ico" data-i="layers" />
        <span>Ver el detalle técnico</span>
      </summary>
      <div className="ar-tech-grid">
        <div>
          <h4>Capa de contexto · Model Context Protocol</h4>
          <p>
            Un servidor MCP expone el perfil profesional como herramientas tipadas. El agente nunca recibe más datos que los autorizados por el asistente.
          </p>
          <div className="code" role="region" aria-label="Ejemplo de llamada MCP" tabIndex="0"><span className="c">{"// tools/call · servidor linkedin-mcp"}</span>{"\n{\n  "}<span className="k">{"\"name\""}</span>{": "}<span className="s">{"\"profile.read\""}</span>{",\n  "}<span className="k">{"\"arguments\""}</span>{": {\n    "}<span className="k">{"\"fields\""}</span>{": ["}<span className="s">{"\"headline\""}</span>{", "}<span className="s">{"\"industry\""}</span>{",\n               "}<span className="s">{"\"skills\""}</span>{", "}<span className="s">{"\"seniority\""}</span>{"],\n    "}<span className="k">{"\"consent_id\""}</span>{": "}<span className="s">{"\"cns_7f2a…\""}</span>{"\n  }\n}"}</div>
          <dl className="spec">
            <dt>Tools</dt>
            <dd>profile.read · interests.infer · contact.exchange</dd>
            <dt>Auth</dt>
            <dd>OAuth 2.0 + scopes por campo, revocables</dd>
            <dt>Salida</dt>
            <dd>Perfil normalizado (rol, industria, seniority)</dd>
          </dl>
        </div>
        <div>
          <h4>Capa física · NFC + QR dinámicos</h4>
          <dl className="spec">
            <dt>NFC</dt>
            <dd>Feedback háptico y visual en menos de 0,5 s</dd>
            <dt>QR</dt>
            <dd>TOTP de 30 s + firma HMAC por sesión</dd>
            <dt>Tótems</dt>
            <dd>Check-in a misiones y mapa de calor de salas</dd>
          </dl>
          <h4>Capa cognitiva · LLM + RAG</h4>
          <dl className="spec">
            <dt>Ingesta</dt>
            <dd>Transcripción → chunks → embeddings</dd>
            <dt>Recuperación</dt>
            <dd>Híbrida: vectorial + filtros por perfil</dd>
            <dt>Generación</dt>
            <dd>Agenda, matches y Dossier con citas</dd>
            <dt>Guardrails</dt>
            <dd>PII enmascarada, sin datos fuera del evento</dd>
          </dl>
          <h4>Orquestación</h4>
          <dl className="spec">
            <dt>Agentes</dt>
            <dd>Concierge, Matchmaker, Curador, Redactor</dd>
            <dt>Tiempo real</dt>
            <dd>Eventos de misiones y XP por WebSocket</dd>
          </dl>
        </div>
      </div>
    </details>
  );
}
