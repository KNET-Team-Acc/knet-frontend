/**
 * Recintos 3D por evento: tamaño, suelos, zonas, nodos de ruta y escenas.
 */

export const SCENES = [
    { i: "moon", k: "El problema", t: "Las luces se apagan y el conocimiento se va con ellas.", s: "Networking al azar, charlas pasivas, contactos perdidos." },
    { i: "link", k: "Onboarding MCP", t: "Un clic. Tu perfil profesional, listo.", s: "El agente lee rol e industria con tu consentimiento." },
    { i: "trophy", k: "Gamificación", t: "Cada sesión es una misión.", s: "NFC, quizzes en vivo, XP e insignias con propósito." },
    { i: "bot", k: "AI Concierge", t: "La persona correcta, en la sala de al lado.", s: "Matchmaking con la razón del match a la vista." },
    { i: "file", k: "Dossier", t: "El Summit termina. Tu plan de acción empieza.", s: "Aprendizajes con citas, contactos y plan a 30 días." }
  ];

export const VENUES = {
    bog: { size: 78, floor: [-31, 31, -22, 22], ground: "conv", aisle: 6, ent: "E", totems: ["N", "S", "W", "K"],
      nodes: { E: [0, 20.5], S: [0, 10.5], C: [0, 0], N: [0, -10.5], W: [-15, 0], K: [15, 0] }, edges: [["E", "S"], ["S", "C"], ["C", "N"], ["C", "W"], ["C", "K"]],
      z: [["Main Stage", "stage", "purple", "Keynotes y paneles principales con aforo para 600 personas.", [-27, -3, -18, -3], [-3, -10.5], "N"], ["Expo", "booths", "lime", "Stands de startups, demos de IA y tótems NFC de misiones.", [3, 27, -18, -3], [3, -10.5], "N"], ["Lounge", "lounge", "orange", "Networking, café de especialidad y reuniones 1:1.", [-27, -3, 3, 18], [-3, 10.5], "S"], ["Labs", "labs", "blue", "Talleres prácticos y laboratorios con código en vivo.", [3, 27, 3, 18], [3, 10.5], "S"]] },
    med: { size: 64, floor: [-36, 36, -16, 16], ground: "concrete", aisle: 6, ent: "E", totems: ["n3", "n1"], deco: "lamps",
      nodes: { E: [35, 0], n4: [26, 0], n3: [12, 0], n2: [2, 0], n1: [-12, 0] }, edges: [["E", "n4"], ["n4", "n3"], ["n3", "n2"], ["n2", "n1"]],
      z: [["Auditorio Ruta N", "stage", "blue", "Charlas principales del foro y demo day.", [-34, -15, -14, 14], [-15, 0], "n1"], ["Startup Alley", "booths", "orange", "Stands de startups del distrito y fondos de inversión.", [-9, 34, -14, -4], [12, -4], "n3"], ["Open Labs", "labs", "purple", "Laboratorios abiertos con agentes y MCP en vivo.", [-9, 13, 4, 14], [2, 4], "n2"], ["Terraza Makers", "lounge", "lime", "Café, networking y mentorías informales.", [17, 34, 4, 14], [26, 4], "n4"]] },
    baq: { size: 60, floor: [-32, 32, -20, 20], ground: "stone", aisle: 5, ent: "E", totems: ["j", "a"], deco: "water-front",
      nodes: { E: [-31, 1], a: [-18, 1], b: [-12, 1], j: [9, 1], k: [9, -6], m: [9, 6.5], t: [15, 6.5] }, edges: [["E", "a"], ["a", "b"], ["b", "j"], ["j", "k"], ["j", "m"], ["m", "t"]],
      z: [["Gran Salón Caribe", "stage", "orange", "Keynotes y paneles sobre datos y nube para el Caribe.", [-30, 6, -18, -2], [-12, -2], "b"], ["Muelle Cloud", "booths", "blue", "Stands de nube, datos y puertos inteligentes.", [12, 30, -18, 4], [12, -6], "k"], ["Sala Energía", "labs", "lime", "Talleres de transición energética y mantenimiento predictivo.", [-30, -6, 4, 18], [-18, 4], "a"], ["Terraza del Río", "lounge", "purple", "Networking frente al río Magdalena.", [0, 30, 9, 18], [15, 9], "t"]] },
    x2: { size: 40, floor: [-22, 22, -15, 15], ground: "industrial", aisle: 4, ent: "E", totems: ["u"], deco: "pillars",
      nodes: { E: [10, 14.5], p: [10, 10], q: [10, 4], u: [10, 0], r: [10, -6], v: [0, -6] }, edges: [["E", "p"], ["p", "q"], ["q", "u"], ["u", "r"], ["r", "v"]],
      z: [["Escenario de pitches", "stage", "purple", "Presentaciones ante el jurado y premiación.", [-20, 20, -14, -8], [0, -8], "v"], ["Mesas de equipos", "labs", "blue", "Donde los equipos construyen durante 24 horas.", [-20, 8, -4, 13], [8, 4], "q"], ["Zona de mentores", "lounge", "lime", "Mentorías en agentes, MCP y RAG.", [12, 20, -4, 4], [12, 0], "u"], ["Café 24 h", "lounge", "orange", "Comida, café y descanso toda la noche.", [12, 20, 7, 13], [12, 10], "p"]] },
    x3: { size: 20, floor: [-15, 15, -11, 11], ground: "wood", aisle: 3, ent: "E", totems: [],
      nodes: { E: [2, 10.5], a: [2, 4], c: [-5, 4], d: [9, 4] }, edges: [["E", "a"], ["a", "c"], ["a", "d"]],
      z: [["Mesa redonda", "dinner", "purple", "La mesa cerrada de 20 personas.", [-13, 3, -9, 2], [-5, 2], "c"], ["Sala de casos", "labs", "blue", "Casos de integración presentados por los participantes.", [6, 13, -9, 2], [9, 2], "d"], ["Café privado", "lounge", "orange", "Café con los participantes.", [-13, 0, 6, 10], [-5, 6], "c"], ["Recepción", "booths", "lime", "Registro y bienvenida.", [4, 13, 6, 10], [9, 6], "d"]] },
    x4: { size: 28, floor: [-22, 22, -17, 17], ground: "terracotta", aisle: 3, ent: "E", totems: [], deco: "columns",
      nodes: { E: [0, 16.5], BM: [0, 9.5], BL: [-11.5, 9.5], LM: [-11.5, 0], TL: [-11.5, -9.5], TM: [0, -9.5], TR: [11.5, -9.5], RM: [11.5, 0], BR: [11.5, 9.5] },
      edges: [["E", "BM"], ["BM", "BL"], ["BL", "LM"], ["LM", "TL"], ["TL", "TM"], ["TM", "TR"], ["TR", "RM"], ["RM", "BR"], ["BR", "BM"]],
      z: [["Patio central", "dinner", "orange", "La cena con los speakers bajo las estrellas.", [-9, 9, -7, 7], [0, 7], "BM", { fountain: true }], ["Salón de cóctel", "lounge", "purple", "Cóctel de bienvenida con los speakers.", [-20, 20, -16, -12], [0, -12], "TM"], ["Biblioteca", "labs", "blue", "Conversación guiada sobre casos de IA a 2027.", [-20, -14, -9, 9], [-14, 0], "LM"], ["Terraza", "lounge", "lime", "Acuerdos y cierre con vista a la ciudad amurallada.", [14, 20, -9, 9], [14, 0], "RM"]] },
    x5: { size: 36, floor: [-32, 32, -22, 22], ground: "sand", aisle: 3, ent: "E", totems: ["s2"], deco: "palms water-back",
      nodes: { E: [0, 21], s1: [0, 12], s2: [0, 0], s3: [0, -11], s4: [0, -13] }, edges: [["E", "s1"], ["s1", "s2"], ["s2", "s3"], ["s3", "s4"]],
      z: [["Domo de keynotes", "stage", "lime", "Sesiones con líderes C-level frente al mar.", [-26, -8, -18, -4], [-8, -11], "s3"], ["Playa de retos", "booths", "orange", "Retos de futuro en equipos.", [6, 28, -18, -8], [6, -13], "s4"], ["Cabañas 1:1", "lounge", "purple", "Sesiones 1:1 con líderes de la región.", [-28, -10, 6, 18], [-10, 12], "s1"], ["Laboratorio verde", "labs", "blue", "Laboratorios con startups y fondos.", [8, 26, 4, 16], [8, 12], "s1"]] }
  };

export const GROUND = { conv: [[243, 239, 231], [26, 19, 38]], concrete: [[226, 225, 221], [30, 30, 38]], stone: [[238, 230, 214], [30, 25, 36]], industrial: [[212, 210, 206], [19, 19, 24]], wood: [[222, 196, 160], [48, 34, 28]], terracotta: [[228, 176, 146], [58, 32, 28]], sand: [[240, 224, 184], [56, 46, 34]] };
