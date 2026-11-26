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
    es: { "tab.perfil": "Mi perfil", "tab.quests": "Misiones", "tab.concierge": "AI Concierge", "tab.dossier": "Resumen", "tab.eventos": "Próximos eventos", "tab.miseventos": "Mis eventos", "tab.agenda": "Agenda personalizada", "tab.red": "Mi red", "tab.recinto": "Recinto", "tab.recompensas": "Recompensas", "tab.resumen": "Dossier", "hi": "Hola", "panel": "Panel del asistente · Día 1", "st.level": "Nivel", "st.missions": "Misiones", "st.conn": "Conexiones", "st.done": "completadas", "st.ctx": "con contexto", "st.to": "para nivel", "connect.l": "Conectar LinkedIn MCP", "connect.s": "Conectar MCP", "mine.l": "Ir a mi panel", "mine.s": "Mi panel", "logout": "Cerrar sesión", "resume.s": "Entrar", "lang.toast": "<b>Idioma: Español</b>",
      "inv.btn": "Invitaciones", "inv.none": "Sin pendientes", "inv.one": "1 pendiente", "inv.many": "{0} pendientes", "inv.tabDot": "{0} invitaciones pendientes",
      "inv.kicker": "Acceso rápido", "inv.desc": "Las invitaciones que debes responder y las que enviaste a tu red.", "inv.recv": "Por responder", "inv.sent": "Tus eventos aprobados",
      "inv.coffee": "Te invitó a un café de 15 min · {0}", "inv.accept": "Aceptar · +50 XP", "inv.decline": "Rechazar", "inv.chat": "Abrir chat",
      "inv.waiting": "{0} por confirmar", "inv.confirmed": "{0} confirmados", "inv.noneSent": "Aún no has invitado a nadie.", "inv.invite": "Invitar a mi red",
      "inv.empty": "No tienes invitaciones pendientes.", "inv.emptyHint": "Aquí verás los cafés a los que te inviten y las invitaciones que envíes a los eventos que crees.", "inv.new": "Proponer un evento",
      "sim.eyebrow": "Vista previa de tu evento", "sim.h2": "Elige tu industria y mira qué evento real te conviene.", "sim.lede": "Eventos reales del catálogo, con fuente oficial. Pruébalo sin crear cuenta.",
      "sim.ind": "1 · Tu industria", "sim.obj": "2 · Tu objetivo en el evento", "sim.objAprender": "Aprender y traer ideas al equipo", "sim.objNegocios": "Generar oportunidades de negocio", "sim.objTalento": "Encontrar talento y aliados",
      "sim.gen": "Ver la vista previa de mi evento", "sim.log": "Cómo se armó tu vista previa", "sim.ready": "Listo", "sim.busy": "Buscando", "sim.tabsAria": "Vistas de la vista previa", "sim.otherK": "Otros eventos para ti",
      "sim.tEvent": "El evento", "sim.tFormat": "Así es", "sim.tMissions": "Misiones", "sim.tConcierge": "Concierge",
      "sim.source": "Fuente oficial", "sim.sourceAria": "Fuente oficial de {0} (se abre en una pestaña nueva)", "sim.aff": "Afinidad con tu perfil", "sim.affWhy": "Industria: {0} · intereses en común: {1}", "sim.affNone": "ninguno aún",
      "sim.for": "Para quién es", "sim.take": "Lo que te llevas", "sim.goal": "Con tu objetivo ({0}), aprovecha: {1}.", "sim.org": "Organiza: {0}",
      "sim.agendaNote": "La agenda, las charlas y los ponentes los publica el organizador. KNET no los inventa: los verás aquí cuando estén confirmados.",
      "sim.mNote": "Misiones de ejemplo de la app. En el evento se activan con tu inscripción.", "sim.m1": "Haz check-in con tu QR al llegar", "sim.m1s": "Check-in en el recinto", "sim.m2": "Conecta con 2 asistentes inscritos", "sim.m2s": "Networking con contexto", "sim.m3": "Responde la encuesta al cierre", "sim.m3s": "Feedback del evento",
      "sim.done": "Hecho", "sim.doneSub": "Completada · +{0} XP", "sim.complete": "Completar",
      "sim.hello": "Hola. Te preparé la vista previa de <b>{0}</b>. ¿Qué quieres saber?", "sim.q1": "¿Cuándo y dónde es?", "sim.q2": "¿Para quién es?", "sim.q3": "¿Hay otro evento para mí?", "sim.thinking": "Pensando",
      "sim.a1": "<b>{0}</b> es en {1}. Fecha: {2}.", "sim.a2": "{0}", "sim.a3": "También te puede interesar <b>{0}</b> ({1}, {2}), con {3}% de afinidad.", "sim.a3none": "Por ahora este es el único evento del catálogo afín a tu perfil.",
      "sim.l1": "Catálogo: <span class=\"k\">{0} eventos reales</span> con fuente oficial", "sim.l2": "Industria: <b>{0}</b> · objetivo: {1}", "sim.l3": "Afinidad: <span class=\"k\">{0} eventos</span> de tu industria", "sim.l4": "Sugerido: <b>{0}</b> · {1}%", "sim.l5": "✓ Vista previa lista en {0} s", "sim.empty": "Aún no hay eventos en el catálogo." },
    en: { "tab.perfil": "My profile", "tab.quests": "Missions", "tab.concierge": "AI Concierge", "tab.dossier": "Summary", "tab.eventos": "Upcoming events", "tab.miseventos": "My events", "tab.agenda": "Personal agenda", "tab.red": "My network", "tab.recinto": "Venue", "tab.recompensas": "Rewards", "tab.resumen": "Dossier", "hi": "Hi", "panel": "Attendee dashboard · Day 1", "st.level": "Level", "st.missions": "Missions", "st.conn": "Connections", "st.done": "completed", "st.ctx": "with context", "st.to": "to level", "connect.l": "Connect LinkedIn MCP", "connect.s": "Connect MCP", "mine.l": "Go to my dashboard", "mine.s": "Dashboard", "logout": "Log out", "resume.s": "Log in", "lang.toast": "<b>Language: English</b><div class='text-[13px] text-mute'>The whole app is now in English.</div>",
      "inv.btn": "Invitations", "inv.none": "Nothing pending", "inv.one": "1 pending", "inv.many": "{0} pending", "inv.tabDot": "{0} pending invitations",
      "inv.kicker": "Quick access", "inv.desc": "The invitations you need to answer and the ones you sent to your network.", "inv.recv": "Awaiting your reply", "inv.sent": "Your approved events",
      "inv.coffee": "Invited you to a 15-min coffee · {0}", "inv.accept": "Accept · +50 XP", "inv.decline": "Decline", "inv.chat": "Open chat",
      "inv.waiting": "{0} awaiting reply", "inv.confirmed": "{0} confirmed", "inv.noneSent": "You haven’t invited anyone yet.", "inv.invite": "Invite my network",
      "inv.empty": "You have no pending invitations.", "inv.emptyHint": "Coffee invitations you receive and the invitations you send for events you create will show up here.", "inv.new": "Propose an event",
      "nav.features": "Features", "nav.demo": "Interactive Demo", "nav.gam": "Gamification", "nav.arch": "AI Architecture",
      "hero.h1": 'Summit knowledge <span class="grad-text">shouldn’t switch off</span> <span class="dim-words">when the lights go out.</span>',
      "hero.lede": 'The platform that turns every event into a living experience, and keeps your knowledge working after it ends.',
      "hero.connect": "Connect LinkedIn MCP", "hero.video": "See how it works", "hero.link": 'or try the simulator without connecting <span aria-hidden="true">↓</span>',
      "prob.eyebrow": "The problem", "prob.h2": "Summits create valuable knowledge. Most of it stays in the room.", "cmp.old": "The Traditional Summit", "cmp.new": "The KNET Experience", "cyc.h3": "From what happens in the room to what you do on Monday.",
      "feat.eyebrow": "The 4 key experiences", "feat.h2": "A smart journey, from registration to the day after.", "demo.eyebrow": "Live interactive simulator", "demo.h2": "Pick your industry. AI builds your Summit in seconds.",
      "arch.eyebrow": "Technical architecture & innovation", "arch.h2": "Three layers, one knowledge graph.", "cta.eyebrow": "Take your Summit beyond the last keynote", "cta.h2": "Next time the lights go out, keep the knowledge switched on.",
      "team.eyebrow": "KNET Team", "team.h2": "The people behind KNET", "motto.kicker": "Our motto",
      "sim.eyebrow": "Your event preview", "sim.h2": "Pick your industry and see which real event fits you.", "sim.lede": "Real events from the catalog, with an official source. Try it without an account.",
      "sim.ind": "1 · Your industry", "sim.obj": "2 · Your goal at the event", "sim.objAprender": "Learn and bring ideas back to the team", "sim.objNegocios": "Generate business opportunities", "sim.objTalento": "Find talent and partners",
      "sim.gen": "See my event preview", "sim.log": "How your preview was built", "sim.ready": "Ready", "sim.busy": "Searching", "sim.tabsAria": "Preview views", "sim.otherK": "Other events for you",
      "sim.tEvent": "The event", "sim.tFormat": "What it’s like", "sim.tMissions": "Missions", "sim.tConcierge": "Concierge",
      "sim.source": "Official source", "sim.sourceAria": "Official source for {0} (opens in a new tab)", "sim.aff": "Fit with your profile", "sim.affWhy": "Industry: {0} · shared interests: {1}", "sim.affNone": "none yet",
      "sim.for": "Who it’s for", "sim.take": "What you take away", "sim.goal": "With your goal ({0}), make the most of: {1}.", "sim.org": "Organizer: {0}",
      "sim.agendaNote": "The organizer publishes the agenda, talks and speakers. KNET doesn’t make them up: you’ll see them here once they’re confirmed.",
      "sim.mNote": "Sample missions from the app. At the event they unlock when you register.", "sim.m1": "Check in with your QR when you arrive", "sim.m1s": "Venue check-in", "sim.m2": "Connect with 2 registered attendees", "sim.m2s": "Networking with context", "sim.m3": "Answer the closing survey", "sim.m3s": "Event feedback",
      "sim.done": "Done", "sim.doneSub": "Completed · +{0} XP", "sim.complete": "Complete",
      "sim.hello": "Hi. I put together the preview of <b>{0}</b>. What would you like to know?", "sim.q1": "When and where is it?", "sim.q2": "Who is it for?", "sim.q3": "Is there another event for me?", "sim.thinking": "Thinking",
      "sim.a1": "<b>{0}</b> takes place at {1}. Date: {2}.", "sim.a2": "{0}", "sim.a3": "You might also like <b>{0}</b> ({1}, {2}), with a {3}% fit.", "sim.a3none": "For now this is the only catalog event that fits your profile.",
      "sim.l1": "Catalog: <span class=\"k\">{0} real events</span> with an official source", "sim.l2": "Industry: <b>{0}</b> · goal: {1}", "sim.l3": "Fit: <span class=\"k\">{0} events</span> in your industry", "sim.l4": "Suggested: <b>{0}</b> · {1}%", "sim.l5": "✓ Preview ready in {0} s", "sim.empty": "There are no events in the catalog yet." }
  };

export const DM_PILLS = ["¡Hola! Qué bueno conectar.", "¿Vas a alguna sesión esta tarde?", "¿Nos tomamos un café?", "¿En qué estás trabajando?"];

export const TOUR = [
    ["perfil", "En tu perfil encontrarás tus datos personales, avatar y permisos."],
    ["miseventos", "Tus eventos día a día, el recinto 3D de cada uno y la opción de explorar eventos reales próximos para inscribirte."],
    ["red", "Tus contactos y los matches sugeridos por la IA."],
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
