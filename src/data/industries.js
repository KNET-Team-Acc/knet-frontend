/**
 * Industrias, objetivos e intereses sugeridos. Los matches llegan de la API (GET /api/contacts).
 */

export const IND = {
    banca: { label: "Banca", desc: "Riesgo, Open Finance", role: "Head de Riesgo Digital", topic: "riesgo y Open Finance",
      agenda: [
        ["09:00", "Keynote", "IA generativa en el nuevo núcleo bancario", "Auditorio Principal", "Base para tu hoja de ruta de modernización"],
        ["10:30", "Panel", "Riesgo crediticio con modelos explicables", "Sala Nexus", "Coincide con tu foco en scoring y cumplimiento"],
        ["12:00", "Workshop", "Open Finance: APIs reguladas en 90 días", "Lab 2", "3 asistentes de tu nivel ya inscritos"],
        ["15:30", "Roundtable", "Ciberresiliencia en servicios financieros", "Sala Orbit", "Cupo reservado para directivos de banca"]],
      missions: [["nfc", "Toca el tótem NFC del stand de Open Finance", "Check-in físico", 120], ["quiz", "Responde el quiz del panel de riesgo", "3 preguntas · 1 min", 80], ["users", "Conecta con 2 líderes de banca", "Intercambio NFC", 200]] },
    tech: { label: "Tecnología", desc: "IA, plataformas, datos", role: "Engineering Manager", topic: "agentes y plataformas de datos",
      agenda: [
        ["09:00", "Keynote", "Agentes autónomos en producción", "Sala Quantum", "Tu equipo evalúa agentes este trimestre"],
        ["10:45", "Deep dive", "Arquitecturas MCP para la empresa", "Lab 1", "Conecta con tu stack de integraciones"],
        ["13:30", "Workshop", "RAG que sí escala: evaluación y costos", "Lab 3", "Habilidad listada en tu perfil: ML Ops"],
        ["16:00", "Panel", "Gobierno de IA sin frenar la entrega", "Auditorio Principal", "Tema recurrente en tu industria"]],
      missions: [["qr", "Escanea el QR dinámico del Lab 1", "Check-in a la sesión", 100], ["mic", "Haz una pregunta en el deep dive de MCP", "Participación en vivo", 150], ["users", "Agenda 1 café con un match >85%", "Networking estratégico", 200]] },
    consultoria: { label: "Consultoría", desc: "Estrategia, cambio", role: "Senior Manager, Estrategia", topic: "escalar la IA en clientes",
      agenda: [
        ["09:00", "Keynote", "Del piloto a la escala: casos de IA que rinden", "Auditorio Principal", "Material directo para propuestas"],
        ["11:00", "Panel", "Reinventar la cadena de valor con agentes", "Sala Nexus", "Dos de tus clientes objetivo en el panel"],
        ["14:00", "Workshop", "Gestión del cambio cuando el colega es un agente", "Lab 2", "Encaja con tu práctica de transformación"],
        ["16:30", "Roundtable", "Cómo medir valor de IA ante el C-level", "Sala Orbit", "Cupo para 12 personas, quedan 4"]],
      missions: [["nfc", "Check-in NFC en el roundtable de C-level", "Check-in físico", 120], ["quiz", "Comparte un insight del keynote", "Aporte al muro colectivo", 90], ["users", "Conecta con 2 decisores de cliente", "Intercambio NFC", 200]] },
    energia: { label: "Energía", desc: "Operaciones, transición", role: "Director de Operaciones", topic: "operaciones y transición energética",
      agenda: [
        ["09:00", "Keynote", "Transición energética guiada por datos", "Auditorio Principal", "Prioridad de tu sector este año"],
        ["10:30", "Deep dive", "Gemelos digitales en plantas de generación", "Lab 3", "Relacionado con tu experiencia en operaciones"],
        ["13:00", "Panel", "Mantenimiento predictivo con IA", "Sala Quantum", "Ponente de una empresa par de tu región"],
        ["15:45", "Workshop", "Cadena de suministro resiliente", "Lab 1", "Encaja con tu objetivo declarado"]],
      missions: [["qr", "Escanea el QR del demo de gemelo digital", "Check-in a la sesión", 100], ["quiz", "Quiz: mantenimiento predictivo", "3 preguntas · 1 min", 80], ["users", "Conecta con 2 líderes de operaciones", "Intercambio NFC", 200]] }
  };

export const OBJ = { aprender: "aprender", negocios: "negocios", talento: "talento y aliados" };

/** Intereses sugeridos por industria (punto de partida del perfil; el usuario los edita) */
export const IND_INTERESTS = { banca: ["Riesgo crediticio", "Open Finance", "IA explicable"], tech: ["Agentes de IA", "MCP", "RAG"], consultoria: ["Escalar IA", "Gestión del cambio", "Métricas de valor"], energia: ["Gemelos digitales", "Mantenimiento predictivo", "Transición energética"] };

export const SENIORITY = ["Analista", "Profesional", "Gerencia", "Directivo", "C-level"];
