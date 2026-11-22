/**
 * Industrias, personas de ejemplo, objetivos y perfiles de match del simulador.
 */

export const IND = {
    banca: { label: "Banca", desc: "Riesgo, Open Finance", role: "Head de Riesgo Digital", topic: "riesgo y Open Finance",
      agenda: [
        ["09:00", "Keynote", "IA generativa en el nuevo núcleo bancario", "Auditorio Principal", "Base para tu hoja de ruta de modernización"],
        ["10:30", "Panel", "Riesgo crediticio con modelos explicables", "Sala Nexus", "Coincide con tu foco en scoring y cumplimiento"],
        ["12:00", "Workshop", "Open Finance: APIs reguladas en 90 días", "Lab 2", "3 asistentes de tu nivel ya inscritos"],
        ["15:30", "Roundtable", "Ciberresiliencia en servicios financieros", "Sala Orbit", "Cupo reservado para directivos de banca"]],
      matches: [["DC", "Daniela C.", "Directora de Datos · Aseguradora", 94, "Ambas lideran modelos de scoring con IA"], ["DR", "Diego R.", "CTO · Fintech de pagos", 89, "Busca un banco aliado para piloto de Open Finance"], ["MV", "Mateo V.", "Partner · Riesgo regulatorio", 82, "Expuso sobre explicabilidad de modelos"]],
      missions: [["nfc", "Toca el tótem NFC del stand de Open Finance", "Check-in físico", 120], ["quiz", "Responde el quiz del panel de riesgo", "3 preguntas · 1 min", 80], ["users", "Conecta con 2 líderes de banca", "Intercambio NFC", 200]] },
    tech: { label: "Tecnología", desc: "IA, plataformas, datos", role: "Engineering Manager", topic: "agentes y plataformas de datos",
      agenda: [
        ["09:00", "Keynote", "Agentes autónomos en producción", "Sala Quantum", "Tu equipo evalúa agentes este trimestre"],
        ["10:45", "Deep dive", "Arquitecturas MCP para la empresa", "Lab 1", "Conecta con tu stack de integraciones"],
        ["13:30", "Workshop", "RAG que sí escala: evaluación y costos", "Lab 3", "Habilidad listada en tu perfil: ML Ops"],
        ["16:00", "Panel", "Gobierno de IA sin frenar la entrega", "Auditorio Principal", "Tema recurrente en tu industria"]],
      matches: [["LM", "Laura M.", "VP de Plataforma · Retail", 92, "Migró a una arquitectura de agentes en 2026"], ["SA", "Santiago A.", "Head de Data · Telco", 87, "Comparten interés en evaluación de RAG"], ["CP", "Camila P.", "Founder · Startup de observabilidad", 81, "Busca design partners"]],
      missions: [["qr", "Escanea el QR dinámico del Lab 1", "Check-in a la sesión", 100], ["mic", "Haz una pregunta en el deep dive de MCP", "Participación en vivo", 150], ["users", "Agenda 1 café con un match >85%", "Networking estratégico", 200]] },
    consultoria: { label: "Consultoría", desc: "Estrategia, cambio", role: "Senior Manager, Estrategia", topic: "escalar la IA en clientes",
      agenda: [
        ["09:00", "Keynote", "Del piloto a la escala: casos de IA que rinden", "Auditorio Principal", "Material directo para propuestas"],
        ["11:00", "Panel", "Reinventar la cadena de valor con agentes", "Sala Nexus", "Dos de tus clientes objetivo en el panel"],
        ["14:00", "Workshop", "Gestión del cambio cuando el colega es un agente", "Lab 2", "Encaja con tu práctica de transformación"],
        ["16:30", "Roundtable", "Cómo medir valor de IA ante el C-level", "Sala Orbit", "Cupo para 12 personas, quedan 4"]],
      matches: [["AR", "Andrés R.", "COO · Manufactura", 91, "Explora un programa de IA a escala"], ["VG", "Valentina G.", "CHRO · Retail", 86, "Lidera reskilling para 3.000 personas"], ["JT", "Julián T.", "Director de Innovación · Salud", 80, "Busca casos de uso validados"]],
      missions: [["nfc", "Check-in NFC en el roundtable de C-level", "Check-in físico", 120], ["quiz", "Comparte un insight del keynote", "Aporte al muro colectivo", 90], ["users", "Conecta con 2 decisores de cliente", "Intercambio NFC", 200]] },
    energia: { label: "Energía", desc: "Operaciones, transición", role: "Director de Operaciones", topic: "operaciones y transición energética",
      agenda: [
        ["09:00", "Keynote", "Transición energética guiada por datos", "Auditorio Principal", "Prioridad de tu sector este año"],
        ["10:30", "Deep dive", "Gemelos digitales en plantas de generación", "Lab 3", "Relacionado con tu experiencia en operaciones"],
        ["13:00", "Panel", "Mantenimiento predictivo con IA", "Sala Quantum", "Ponente de una empresa par de tu región"],
        ["15:45", "Workshop", "Cadena de suministro resiliente", "Lab 1", "Encaja con tu objetivo declarado"]],
      matches: [["NS", "Natalia S.", "VP de Sostenibilidad · Utility", 90, "Comparten metas de descarbonización"], ["FL", "Felipe L.", "Head de IoT · Oil & Gas", 85, "Implementó gemelos digitales en 4 plantas"], ["PB", "Paula B.", "Gerente de Compras · Minería", 79, "Busca proveedores con trazabilidad"]],
      missions: [["qr", "Escanea el QR del demo de gemelo digital", "Check-in a la sesión", 100], ["quiz", "Quiz: mantenimiento predictivo", "3 preguntas · 1 min", 80], ["users", "Conecta con 2 líderes de operaciones", "Intercambio NFC", 200]] }
  };

export const OBJ = { aprender: "aprender", negocios: "negocios", talento: "talento y aliados" };

export const PERSONAS = {
    banca: { name: "Carlos Restrepo", initials: "CR", company: "Banco Pacífico Andino", seniority: "Directivo", interests: ["Riesgo crediticio", "Open Finance", "IA explicable"], location: "Bogotá, Colombia" },
    tech: { name: "Daniela Ortiz", initials: "DO", company: "Nubia Software", seniority: "Gerencia", interests: ["Agentes de IA", "MCP", "RAG"], location: "Medellín, Colombia" },
    consultoria: { name: "Sofía Herrera", initials: "SH", company: "Andes Advisory", seniority: "Gerencia", interests: ["Escalar IA", "Gestión del cambio", "Métricas de valor"], location: "Lima, Perú" },
    energia: { name: "Martín Rojas", initials: "MR", company: "Energía del Valle", seniority: "Directivo", interests: ["Gemelos digitales", "Mantenimiento predictivo", "Transición energética"], location: "Cali, Colombia" }
  };

export const MATCH_INFO = {
    "Daniela C.": { int: ["Riesgo crediticio", "IA explicable", "Gobierno de datos"], likes: ["Ciclismo de ruta", "Podcasts de fintech"], goal: "validar modelos de scoring con pares de banca" },
    "Diego R.": { int: ["Open Finance", "Pagos en tiempo real", "APIs abiertas"], likes: ["Café de especialidad", "Hackathons"], goal: "encontrar un banco aliado para un piloto de Open Finance" },
    "Mateo V.": { int: ["IA explicable", "Regulación financiera", "Riesgo crediticio"], likes: ["Ajedrez", "Libros de no ficción"], goal: "reunir casos reales para un estudio regulatorio" },
    "Laura M.": { int: ["Agentes de IA", "MCP", "Plataformas internas"], likes: ["Trail running", "Open source"], goal: "compartir lo que aprendió migrando a agentes" },
    "Santiago A.": { int: ["RAG", "Evaluación de modelos", "Datos"], likes: ["Fotografía", "Juegos de mesa"], goal: "comparar costos de RAG con otros equipos" },
    "Camila P.": { int: ["Agentes de IA", "Observabilidad", "Startups"], likes: ["Escalada", "Diseño de producto"], goal: "conseguir design partners para su producto" },
    "Andrés R.": { int: ["Escalar IA", "Operaciones", "Manufactura"], likes: ["Fútbol", "Historia empresarial"], goal: "lanzar un programa de IA a escala en sus plantas" },
    "Valentina G.": { int: ["Gestión del cambio", "Reskilling", "Cultura"], likes: ["Yoga", "Mentoría"], goal: "liderar el reskilling de 3.000 personas" },
    "Julián T.": { int: ["Métricas de valor", "Escalar IA", "Innovación en salud"], likes: ["Senderismo", "Startups de salud"], goal: "encontrar casos de uso ya validados" },
    "Natalia S.": { int: ["Transición energética", "Gemelos digitales", "ESG"], likes: ["Kitesurf", "Energía solar en casa"], goal: "sumar aliados para sus metas de descarbonización" },
    "Felipe L.": { int: ["Gemelos digitales", "Mantenimiento predictivo", "IoT industrial"], likes: ["Drones", "Robótica"], goal: "escalar los gemelos digitales que ya tiene en 4 plantas" },
    "Paula B.": { int: ["Transición energética", "Cadena de suministro", "Trazabilidad"], likes: ["Cocina", "Viajes"], goal: "encontrar proveedores con trazabilidad" }
  };

export const OTHERS = [["Valentina G.", 1480], ["Diego R.", 1310], ["Santiago A.", 1120], ["Camila P.", 980], ["Mateo V.", 760], ["Julián T.", 540]];

export const SENIORITY = ["Analista", "Profesional", "Gerencia", "Directivo", "C-level"];
