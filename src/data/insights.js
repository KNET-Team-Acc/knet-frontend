/**
 * Contenido del Dossier y del grafo de conocimiento: ideas, respuestas de ejemplo y fuentes citadas.
 */

export const AI_ANS = [
    "En <b>Sala Orbit</b> hay 3 personas de tu industria. <b>Laura M.</b> (92% afinidad) estará libre a las 11:15.",
    "Keynote en 3 ideas: 1) agentes medidos por resultado, 2) datos propios como ventaja, 3) gobierno desde el día uno. Lo añadí a tu Dossier.",
    "Listo. Café con <b>Santiago A.</b> a las 11:00 en el Lounge B. Les envié a ambos el tema: evaluación de RAG. <b>+50 XP</b> por networking."
  ];

export const INSIGHTS = {
    banca: ["La IA generativa en el core bancario empieza por procesos internos, no por el cliente final.", "Un modelo de riesgo explicable acorta la aprobación regulatoria.", "Open Finance escala cuando las APIs se gestionan como producto, con SLA y versionado.", "La ciberresiliencia se mide en tiempo de recuperación, no solo en prevención."],
    tech: ["Los agentes en producción se evalúan por tarea completada, no por precisión aislada.", "MCP convierte integraciones punto a punto en un contrato por herramienta.", "El costo de RAG se controla en la recuperación, no en el modelo.", "El gobierno de IA funciona cuando vive dentro del pipeline de entrega."],
    consultoria: ["Los casos de IA que escalan tienen un dueño de negocio desde el día uno.", "Reinventar la cadena de valor exige rediseñar roles, no solo automatizar tareas.", "La adopción crece cuando el equipo co-diseña cómo trabaja con el agente.", "El C-level compra valor medido en flujo de caja, no en pilotos."],
    energia: ["La transición energética necesita datos operativos en tiempo real como base.", "Los gemelos digitales rinden más en activos críticos con historial de fallas.", "El mantenimiento predictivo reduce paradas cuando se integra a la orden de trabajo.", "La resiliencia del suministro exige visibilidad de proveedores de nivel 2 y 3."]
  };

export const STEP_C = { evento: ["161,0,255", "#DCAFFF"], insight: ["117,0,192", "#CF9BFF"], conexion: ["61,107,255", "#9DB4FF"], accion: ["16,185,129", "#6EE7B7"] };

export const SRC_INFO = {
    "profile.read": "Leído con la herramienta <b>profile.read</b> del servidor linkedin-mcp. Permiso usado: Titular y rol actual.",
    "profile.read+": "Leído con <b>profile.read</b>. Permiso usado: Industria y seniority. Puedes revocarlo en Permisos MCP.",
    "interests.infer": "Inferido por <b>interests.infer</b> a partir de tus habilidades y publicaciones. Permiso usado: Habilidades e intereses.",
    "off": "No compartido: revocaste este permiso. KNET usa valores genéricos y el matchmaking pierde precisión.",
    "manual": "Lo escribiste tú al crear tu perfil. KNET lo usa igual que un dato importado de LinkedIn.",
    "edited": "Lo corregiste tú con el lápiz. Este valor reemplaza al de LinkedIn hasta que vuelvas a sincronizar."
  };

export const G_ROLES = [["cliente", "Clientes / Líderes", "briefcase", "251,191,36"], ["experto", "Expertos", "bulb", "96,165,250"], ["speaker", "Speakers", "mic", "244,114,182"], ["partner", "Partners", "handshake", "163,230,53"]];

export const G_SING = { cliente: "Cliente / Líder", experto: "Experto", speaker: "Speaker", partner: "Partner" };

export const G_SUGGEST = { cliente: ["experto", "partner"], experto: ["cliente", "speaker"], speaker: ["cliente", "experto"], partner: ["cliente", "experto"] };

export const G_WHY = { cliente: "Como cliente o líder, te conviene ver expertos y partners que resuelvan tus retos.", experto: "Como experto, te conviene ver clientes y líderes con retos reales, y speakers de tu tema.", speaker: "Como speaker, te conviene ver a tu audiencia: clientes, líderes y expertos.", partner: "Como partner, te conviene ver clientes y líderes con necesidades, y expertos para aliarte." };

export const HX_TYPE = { ev: ["map", "Evento"], ses: ["mic", "Sesión"], my: ["spark", "Meetup propio"], exp: ["users", "Actividad presencial"] };

export const TAG_IDEA = {
    "IA explicable": "La explicabilidad no es un extra: es lo que permite que un modelo pase de piloto a producción en sectores regulados.",
    "Riesgo crediticio": "Los modelos de riesgo ganan confianza cuando cada decisión queda trazada y se puede explicar al cliente.",
    "Gobierno de datos": "Sin datos gobernados no hay IA escalable: el primer entregable es un catálogo con dueños claros.",
    "Escalar IA": "Los casos que escalan tienen un dueño de negocio y una métrica de valor desde el día uno.",
    "Métricas de valor": "Medir horas ahorradas no basta: hay que conectar cada caso de IA con ingresos, costo o riesgo.",
    "Gestión del cambio": "La adopción depende más de rediseñar roles y procesos que de la tecnología.",
    "Open Finance": "Open Finance escala cuando las APIs son estándar y el consentimiento del cliente es explícito.",
    "Agentes de IA": "Los agentes se evalúan por tareas completadas de punta a punta, no por respuestas aisladas.",
    "APIs abiertas": "Una API bien documentada acelera más alianzas que cualquier presentación comercial.",
    "MCP": "MCP convierte integraciones a la medida en un contrato común entre modelos y herramientas.",
    "Plataformas internas": "Una plataforma interna de IA reduce el tiempo de cada nuevo caso de meses a semanas.",
    "Gemelos digitales": "Los gemelos digitales rinden más en activos críticos con historial de fallas.",
    "Startups": "Las alianzas con startups funcionan mejor con un problema acotado y un piloto de 90 días.",
    "IoT industrial": "Los sensores solo generan valor cuando sus alertas se convierten en órdenes de trabajo.",
    "RAG": "La calidad de RAG depende más de cómo se recupera y evalúa que del modelo que genera.",
    "Evaluación de modelos": "Sin un conjunto de pruebas versionado, cualquier mejora de un modelo es una opinión.",
    "Datos": "El dato operativo en tiempo real es la base de cualquier decisión automatizada.",
    "Transición energética": "La transición energética necesita datos de operación confiables para integrar renovables.",
    "Mantenimiento predictivo": "El mantenimiento predictivo paga primero en los activos que más paran la operación.",
    "Operaciones": "Automatizar sin rediseñar el proceso solo hace más rápido un problema existente.",
    "Cloud": "Migrar a la nube es el comienzo: el valor llega al modernizar datos y procesos."
  };

export const SUM_INFO = "Resumen simulado para la demo. En producción, la IA lo redacta a partir de la transcripción del evento.";
