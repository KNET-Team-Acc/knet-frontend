/**
 * Niveles, XP, insignias, misiones, experiencias presenciales y marcos del avatar.
 */

export const LEVELS = ["Explorador", "Desarrollador", "Integrador", "Arquitecto", "Innovador"];

export const LVL_META = [
    { face: ["#A0683F", "#5E3720"], rim: ["#7A4A2A", "#3E2414"], star: ["#F1F5F9", "#94A3B8"], d: "Llegas al Summit, conectas tu perfil y descubres la plataforma.", grain: true },
    { face: ["#3B82F6", "#1E3A8A"], rim: ["#F1F5F9", "#64748B"], star: ["#E2E8F0", "#64748B"], d: "Interactúas: completas misiones y armas tu agenda.", ring: true, spike: true },
    { face: ["#22C55E", "#065F46"], rim: ["#FDE68A", "#B45309"], star: ["#FDBA74", "#C2410C"], d: "Conectas ideas y personas, como un sistema que une APIs.", spike: true, side: true, glow: "#FBBF24" },
    { face: ["#BE82FF", "#5B21B6"], rim: ["#F1F5F9", "#64748B"], star: ["#E9D5FF", "#7500C0"], d: "Diseñas tu red de contactos y propones charlas o pitches.", spike: true, side: true, wings: ["#F1F5F9", "#94A3B8"], ribbon: ["#BE82FF", "#5B21B6"], glow: "#BE82FF" },
    { face: ["#E879F9", "#6D28D9"], rim: ["#FDE68A", "#D97706"], star: ["#9DB4FF", "#0891B2"], d: "Lideras: tus conexiones y propuestas generan impacto.", spike: true, side: true, wings: ["#F472B6", "#6E8FFF"], ribbon: ["#6E8FFF", "#7500C0"], gems: true, glow: "#E879F9" }
  ];

export const BADGES = [
    { icon: "compass", name: "Explorador", at: 1 },
    { icon: "users", name: "Primer match", at: 150 },
    { icon: "star", name: "Mente activa", at: 300 },
    { icon: "trophy", name: "Top 10%", at: 400 }
  ];

export const XPS = [
    { id: "onb", icon: "link", color: "6,182,212", fg: "#9DB4FF", ttl: "Onboarding inteligente con LinkedIn MCP", sub: "Un clic y el agente extrae tu rol, industria e intereses. Sin formularios eternos." },
    { id: "gam", icon: "trophy", color: "16,185,129", fg: "#6EE7B7", ttl: "Gamificación & Quest Profile", sub: "Misiones en vivo, XP por participar e insignias que reflejan lo que aprendiste." },
    { id: "ai", icon: "bot", color: "139,92,246", fg: "#DCAFFF", ttl: "AI Concierge & Matchmaking", sub: "Un asistente de bolsillo que sugiere charlas y conexiones estratégicas en el momento justo." },
    { id: "dos", icon: "file", color: "99,102,241", fg: "#CF9BFF", ttl: "Dossier Post-Summit", sub: "Al cerrar el evento, la IA redacta tus aprendizajes, contactos y plan de acción." }
  ];

export const ACTIONS = {
    banca: ["Proponer un piloto de scoring explicable al equipo de riesgo", "Mapear 3 APIs candidatas para Open Finance", "Revisar el plan de recuperación ante incidentes con TI"],
    tech: ["Lanzar un piloto MCP con 2 herramientas internas", "Montar un benchmark de costos de RAG", "Definir métricas de tarea completada para agentes"],
    consultoria: ["Armar el caso de negocio de IA a escala para un cliente", "Diseñar un taller de co-creación con agentes", "Preparar un tablero de valor para el comité directivo"],
    energia: ["Priorizar 2 activos críticos para gemelo digital", "Conectar alertas predictivas a órdenes de trabajo", "Mapear proveedores de nivel 2 en la cadena"]
  };

export const COMMON_M = [["nfc", "Toca el tótem NFC del Hub de Innovación", "Check-in físico", 100], ["msg", "Deja una pregunta al ponente del keynote", "Participación en vivo", 120], ["compass", "Visita 3 stands del pabellón de IA", "Exploración", 130], ["star", "Califica una sesión a la que asististe", "Feedback", 50], ["quiz", "Quiz relámpago: tendencias 2027", "3 preguntas · 1 min", 80], ["users", "Intercambia contacto NFC con un match", "Networking", 150]];

export const FRAMES = [
    { id: "neon", name: "Marco Neón Cyber", xp: 300, desc: "Anillo de luz cian y violeta que gira." },
    { id: "fintech", name: "Marco Élite FinTech", xp: 600, desc: "Doble aro dorado y esmeralda." },
    { id: "vip", name: "Marco VIP Speaker", xp: 1000, desc: "Aro dorado con estrella de ponente." }
  ];

export const GROUP_M = [
    { id: "g1", ico: "compass", title: "Dúo explorador: visiten juntos 2 stands de IA", sub: "En pareja · 30 min", xp: 150, tags: ["Agentes de IA", "MCP", "RAG", "Gemelos digitales", "IA explicable", "Observabilidad"] },
    { id: "g2", ico: "coffee", title: "Café de ideas: compartan un aprendizaje del keynote", sub: "En pareja · 15 min", xp: 120, tags: ["Escalar IA", "Métricas de valor", "Gestión del cambio", "Datos", "Evaluación de modelos"] },
    { id: "g3", ico: "bulb", title: "Reto de co-creación: propongan un caso de uso para su industria", sub: "En equipo · 45 min", xp: 200, tags: ["Open Finance", "Riesgo crediticio", "Transición energética", "Mantenimiento predictivo", "Plataformas internas", "Startups"] }
  ];

export const EXPS = [
    { id: "arte", emo: "🎨", ic: "palette", name: "Taller de arte digital", where: "Terraza del recinto", day: 0, time: "Día 1 · 18:00", desc: "Pinta un mural colectivo con herramientas de IA generativa." },
    { id: "cocina", emo: "🍳", ic: "chef", name: "Clase de cocina colombiana", where: "Zona gastronómica", day: 0, time: "Día 1 · 19:00", desc: "Prepara arepas y ajiaco con un chef invitado." },
    { id: "deporte", emo: "⚽", ic: "ball", name: "Partido de fútbol 5", where: "Cancha del recinto", day: 1, time: "Día 2 · 07:00", desc: "Equipos mixtos para arrancar el día 2 con energía." }
  ];
