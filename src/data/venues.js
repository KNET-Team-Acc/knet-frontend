/**
 * Recintos 3D por evento (planos ilustrativos, no el mapa oficial): tamaño, suelos, zonas, nodos de ruta y escenas.
 */

export const SCENES = [
    { i: "moon", k: "El problema", t: "Las luces se apagan y el conocimiento se va con ellas.", s: "Networking al azar, charlas pasivas, contactos perdidos." },
    { i: "link", k: "Onboarding MCP", t: "Un clic. Tu perfil profesional, listo.", s: "El agente lee rol e industria con tu consentimiento." },
    { i: "trophy", k: "Gamificación", t: "Cada sesión es una misión.", s: "NFC, quizzes en vivo, XP e insignias con propósito." },
    { i: "bot", k: "AI Concierge", t: "La persona correcta, en la sala de al lado.", s: "Matchmaking con la razón del match a la vista." },
    { i: "file", k: "Dossier", t: "El Summit termina. Tu plan de acción empieza.", s: "Aprendizajes con citas, contactos y plan a 30 días." }
  ];

export const VENUES = {
    and: { size: 78, floor: [-31, 31, -22, 22], ground: "conv", aisle: 6, ent: "E", totems: ["N", "S", "W", "K"],
      nodes: { E: [0, 20.5], S: [0, 10.5], C: [0, 0], N: [0, -10.5], W: [-15, 0], K: [15, 0] }, edges: [["E", "S"], ["S", "C"], ["C", "N"], ["C", "W"], ["C", "K"]],
      z: [["Congreso", "stage", "purple", "Sesiones y cursos técnicos del congreso.", [-27, -3, -18, -3], [-3, -10.5], "N"], ["Feria de expositores", "booths", "lime", "Stands de telecomunicaciones, TIC y ciudades inteligentes.", [3, 27, -18, -3], [3, -10.5], "N"], ["Zona de networking", "lounge", "orange", "Encuentros de negocios y reuniones 1:1.", [-27, -3, 3, 18], [-3, 10.5], "S"], ["Salas técnicas", "labs", "blue", "Talleres y demostraciones de producto.", [3, 27, 3, 18], [3, 10.5], "S"]] },
    ais: { size: 60, floor: [-32, 32, -20, 20], ground: "stone", aisle: 5, ent: "E", totems: ["j", "a"],
      nodes: { E: [-31, 1], a: [-18, 1], b: [-12, 1], j: [9, 1], k: [9, -6], m: [9, 6.5], t: [15, 6.5] }, edges: [["E", "a"], ["a", "b"], ["b", "j"], ["j", "k"], ["j", "m"], ["m", "t"]],
      z: [["Escenario principal", "stage", "orange", "Charlas y paneles del summit.", [-30, 6, -18, -2], [-12, -2], "b"], ["Zona de aliados", "booths", "blue", "Stands de empresas del ecosistema de IA.", [12, 30, -18, 4], [12, -6], "k"], ["Salas de trabajo", "labs", "lime", "Sesiones prácticas en grupos pequeños.", [-30, -6, 4, 18], [-18, 4], "a"], ["Networking", "lounge", "purple", "Café y reuniones 1:1.", [0, 30, 9, 18], [15, 9], "t"]] },
    edu: { size: 64, floor: [-36, 36, -16, 16], ground: "concrete", aisle: 6, ent: "E", totems: ["n3", "n1"], deco: "lamps",
      nodes: { E: [35, 0], n4: [26, 0], n3: [12, 0], n2: [2, 0], n1: [-12, 0] }, edges: [["E", "n4"], ["n4", "n3"], ["n3", "n2"], ["n2", "n1"]],
      z: [["Auditorio", "stage", "blue", "Charlas principales de la feria.", [-34, -15, -14, 14], [-15, 0], "n1"], ["Feria de expositores", "booths", "orange", "Stands de tecnología educativa.", [-9, 34, -14, -4], [12, -4], "n3"], ["Zona de Innovación Educativa", "labs", "purple", "Talleres y laboratorios prácticos.", [-9, 13, 4, 14], [2, 4], "n2"], ["Zona de networking", "lounge", "lime", "Encuentros entre instituciones y proveedores.", [17, 34, 4, 14], [26, 4], "n4"]] },
    adc: { size: 78, floor: [-31, 31, -22, 22], ground: "conv", aisle: 6, ent: "E", totems: ["N", "S", "W", "K"],
      nodes: { E: [0, 20.5], S: [0, 10.5], C: [0, 0], N: [0, -10.5], W: [-15, 0], K: [15, 0] }, edges: [["E", "S"], ["S", "C"], ["C", "N"], ["C", "W"], ["C", "K"]],
      z: [["Plenaria", "stage", "purple", "Conferencias principales del congreso.", [-27, -3, -18, -3], [-3, -10.5], "N"], ["Muestra comercial", "booths", "lime", "Stands de empresas TIC.", [3, 27, -18, -3], [3, -10.5], "N"], ["Networking", "lounge", "orange", "Encuentros de la industria.", [-27, -3, 3, 18], [-3, 10.5], "S"], ["Salas temáticas", "labs", "blue", "Sesiones paralelas por tema.", [3, 27, 3, 18], [3, 10.5], "S"]] }
  };

export const GROUND = { conv: [[243, 239, 231], [26, 19, 38]], concrete: [[226, 225, 221], [30, 30, 38]], stone: [[238, 230, 214], [30, 25, 36]], industrial: [[212, 210, 206], [19, 19, 24]], wood: [[222, 196, 160], [48, 34, 28]], terracotta: [[228, 176, 146], [58, 32, 28]], sand: [[240, 224, 184], [56, 46, 34]] };
