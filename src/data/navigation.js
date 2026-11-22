/**
 * Pestañas del panel, descripciones, pasos del tour guiado, sugerencias del Concierge y textos de UI.
 */

export const TABS = [["perfil", "01", "tab.perfil", "users"], ["miseventos", "02", "tab.miseventos", "calendar"], ["red", "03", "tab.red", "link"], ["agenda", "04", "tab.agenda", "clock"], ["quests", "05", "tab.quests", "trophy"], ["concierge", "06", "tab.concierge", "bot"], ["recompensas", "07", "tab.recompensas", "star"], ["resumen", "08", "tab.resumen", "file"]];

export const TAB_DESC = {
    perfil: ["Mi perfil", "Tus datos personales y permisos de privacidad."],
    quests: ["Misiones", "Tu XP, niveles, insignias, misiones activas y misiones grupales."],
    miseventos: ["Mis eventos", ""],
    agenda: ["Agenda personalizada", "Las charlas que la IA eligió para tu rol en cada evento y día, con check-in por QR."],
    concierge: ["AI Concierge", "Tu asistente del Summit: pregúntale por tu agenda, sesiones, misiones o a quién conocer."],
    recinto: ["Recinto", "El mapa 3D del recinto de cada evento: mira qué pasa ahora, traza tu ruta, recórrelo a pie o entra en VR."],
    red: ["Mi red", "Tu grafo de conocimiento: personas y temas que los unen. Escanea credenciales para sumar contactos con contexto."],
    recompensas: ["Recompensas", "La tienda de marcos, peinados y accesorios que desbloqueas con XP."],
    resumen: ["Dossier", "Encuentra un resumen de tu evento"]
  };

export const PILLS = ["¿Quién está en la sala de al lado?", "¿Cuál es mi próxima sesión?", "Recomiéndame un match", "Resume el keynote", "¿Qué misión me conviene?"];

export const I18N = {
    es: { "tab.perfil": "Mi perfil", "tab.quests": "Misiones", "tab.concierge": "AI Concierge", "tab.dossier": "Resumen", "tab.eventos": "Próximos eventos", "tab.miseventos": "Mis eventos", "tab.agenda": "Agenda personalizada", "tab.red": "Mi red", "tab.recinto": "Recinto", "tab.recompensas": "Recompensas", "tab.resumen": "Dossier", "hi": "Hola", "panel": "Panel del asistente · Día 1", "st.level": "Nivel", "st.missions": "Misiones", "st.conn": "Conexiones", "st.done": "completadas", "st.ctx": "con contexto", "st.to": "para nivel", "connect.l": "Conectar LinkedIn MCP", "connect.s": "Conectar MCP", "mine.l": "Ir a mi panel", "mine.s": "Mi panel", "logout": "Cerrar sesión", "resume.s": "Entrar", "lang.toast": "<b>Idioma: Español</b>" },
    en: { "tab.perfil": "My profile", "tab.quests": "Missions", "tab.concierge": "AI Concierge", "tab.dossier": "Summary", "tab.eventos": "Upcoming events", "tab.miseventos": "My events", "tab.agenda": "Personal agenda", "tab.red": "My network", "tab.recinto": "Venue", "tab.recompensas": "Rewards", "tab.resumen": "Dossier", "hi": "Hi", "panel": "Attendee dashboard · Day 1", "st.level": "Level", "st.missions": "Missions", "st.conn": "Connections", "st.done": "completed", "st.ctx": "with context", "st.to": "to level", "connect.l": "Connect LinkedIn MCP", "connect.s": "Connect MCP", "mine.l": "Go to my dashboard", "mine.s": "Dashboard", "logout": "Log out", "resume.s": "Log in", "lang.toast": "<b>Language: English</b><div class='text-[13px] text-mute'>The whole app is now in English.</div>",
      "nav.features": "Features", "nav.demo": "Interactive Demo", "nav.gam": "Gamification", "nav.arch": "AI Architecture",
      "hero.h1": 'Summit knowledge <span class="grad-text">shouldn’t switch off</span> <span class="dim-words">when the lights go out.</span>',
      "hero.lede": 'The platform that turns every event into a living experience, and keeps your knowledge working after it ends.',
      "hero.connect": "Connect LinkedIn MCP", "hero.video": "See how it works", "hero.link": 'or try the simulator without connecting <span aria-hidden="true">↓</span>',
      "prob.eyebrow": "The problem", "prob.h2": "Summits create valuable knowledge. Most of it stays in the room.", "cmp.old": "The Traditional Summit", "cmp.new": "The KNET Experience", "cyc.h3": "From what happens in the room to what you do on Monday.",
      "feat.eyebrow": "The 4 key experiences", "feat.h2": "A smart journey, from registration to the day after.", "demo.eyebrow": "Live interactive simulator", "demo.h2": "Pick your industry. AI builds your Summit in seconds.",
      "arch.eyebrow": "Technical architecture & innovation", "arch.h2": "Three layers, one knowledge graph.", "cta.eyebrow": "Take your Summit beyond the last keynote", "cta.h2": "Next time the lights go out, keep the knowledge switched on.",
      "team.eyebrow": "KNET Team", "team.h2": "The people behind KNET", "motto.kicker": "Our motto" }
  };

export const DM_PILLS = ["¡Hola! Qué bueno conectar.", "¿Vas a alguna sesión esta tarde?", "¿Nos tomamos un café?", "¿En qué estás trabajando?"];

export const TOUR = [
    ["perfil", "Tu perfil y tu avatar, los datos que autorizaste de LinkedIn y tus permisos de privacidad. Puedes cambiarlos cuando quieras."],
    ["miseventos", "Tus eventos día a día, el recinto 3D de cada uno y la opción de explorar eventos reales próximos para inscribirte."],
    ["red", "Tus contactos con contexto: los matches que te sugiere la IA y el grafo de personas y temas que los unen."],
    ["agenda", "Las charlas que la IA eligió para tu rol, con check-in por QR en cada sesión."],
    ["quests", "Gana XP con misiones en el recinto, quizzes y experiencias presenciales, y sube de nivel."],
    ["concierge", "Tu asistente del Summit: pregúntale por tu agenda, a quién conocer o qué misión te conviene."],
    ["recompensas", "Canjea tu XP por marcos, peinados y accesorios para tu avatar."],
    ["resumen", "Al cerrar el evento, la IA arma tu Dossier con ideas clave, contactos y un plan de 30 días, descargable en PDF."]
  ];

export const NOTIF_T = {
    xp: { ic: "star", c: "16,185,129", go: "quests" },
    level: { ic: "trophy", c: "251,191,36", go: "quests" },
    conn: { ic: "users", c: "6,182,212", go: "red" },
    soon: { ic: "clock", c: "255,92,122", go: "perfil" },
    event: { ic: "calendar", c: "139,92,246", go: "eventos" },
    sum: { ic: "file", c: "167,139,250", go: "miseventos" },
    survey: { ic: "star", c: "251,191,36", go: "miseventos" }
  };
