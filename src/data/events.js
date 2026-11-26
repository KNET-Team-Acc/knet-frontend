/**
 * Catálogo de eventos reales (con fuente oficial), días, fichas y geografía de Colombia para el mapa. Los ponentes llegan de la API (GET /api/events/:id).
 */

/** Evento principal por defecto (al entrar, agenda, check-in y Dossier activos con días confirmados) */
export const MAIN_EV = "and";

/** Ids de versiones anteriores → evento actual (migración de lo guardado en el navegador y de inscripciones del servidor) */
export const EV_ALIAS = { bog: "and" };

/** Catálogo: solo eventos reales con fuente oficial. tbc = mes anunciado (AAAA-MM) cuando aún no hay días publicados. */
export const EVENTS = [
    { id: "and", city: "Cartagena", name: "Andina Link Smart Cities Expo 2027", venue: "Las Américas Resort and Convention Center · Cartagena", date: "8–11 mar 2027", lat: 10.45, lon: -75.51, tags: ["Datos", "Cloud", "Transición energética", "Gemelos digitales"], ind: ["tech", "energia", "consultoria"], desc: "Feria internacional de telecomunicaciones, tecnologías convergentes y ciudades inteligentes de América Latina.", real: true, org: "Andina Link", url: "https://www.luminik.io/events/andina-link-cartagena/" },
    { id: "ais", city: "Bogotá", name: "AI Summit Colombia 2027", venue: "Sede por confirmar · Bogotá", date: "Mayo 2027 · fecha por confirmar", tbc: "2027-05", lat: 4.71, lon: -74.07, tags: ["Agentes de IA", "Escalar IA", "Métricas de valor", "IA explicable"], ind: ["banca", "tech", "consultoria"], desc: "Encuentro de líderes de negocio y tecnología para llevar la IA del piloto al impacto real, co-creado por Colombia Tech Week y Truora.", real: true, org: "Colombia Tech Week y Truora", url: "https://aisummit.com.co/" },
    { id: "edu", city: "Bogotá", name: "Edutechnia 2027", venue: "Corferias · Bogotá", date: "25–27 ago 2027", lat: 4.63, lon: -74.09, tags: ["Agentes de IA", "Datos", "Cloud", "Gestión del cambio"], ind: ["tech", "consultoria"], desc: "Feria de tecnología para el sector educativo (B2E), con zona de innovación educativa, talleres y laboratorios.", real: true, org: "Corferias y PAFYC", url: "https://www.edutechnia.com/" },
    { id: "adc", city: "Cartagena", name: "ANDICOM 2027", venue: "Sede por confirmar · Cartagena de Indias", date: "Septiembre 2027 · fecha por confirmar", tbc: "2027-09", lat: 10.42, lon: -75.55, tags: ["Datos", "Cloud", "Escalar IA", "Gobierno de datos"], ind: ["tech", "consultoria", "banca", "energia"], desc: "Congreso Internacional de TIC: transformación digital, conectividad y tecnología para empresas y gobierno.", real: true, org: "CINTEL", url: "https://andicom.co/" }
  ];

export const EV_DAYS = { and: ["2027-03-08", "2027-03-09", "2027-03-10", "2027-03-11"], edu: ["2027-08-25", "2027-08-26", "2027-08-27"], ais: [], adc: [] };

export const COL_OUTLINE = [[-71.67,12.46],[-71.32,12.15],[-71.33,11.85],[-71.95,11.6],[-72.25,11.15],[-72.55,10.85],[-72.9,10.45],[-73.05,9.7],[-72.95,9.2],[-72.72,8.9],[-72.45,8.4],[-72.38,7.9],[-72.48,7.42],[-72.2,7.35],[-71.85,7.05],[-71.0,6.98],[-70.4,7.05],[-69.9,6.6],[-69.45,6.12],[-68.6,6.15],[-67.85,6.3],[-67.6,5.6],[-67.82,4.95],[-67.85,4.5],[-67.65,3.75],[-67.35,3.3],[-67.3,2.85],[-67.25,2.35],[-67.1,1.75],[-66.87,1.23],[-67.45,2.05],[-68.2,1.75],[-69.15,1.75],[-69.85,1.7],[-69.6,1.05],[-70.05,0.6],[-70.04,-0.2],[-69.6,-0.6],[-69.4,-1.15],[-69.6,-2.5],[-69.95,-4.2],[-70.3,-3.8],[-70.7,-3.8],[-71.4,-2.4],[-72.2,-2.45],[-72.9,-2.45],[-73.6,-1.3],[-74.4,-0.9],[-75.2,-0.1],[-75.6,0.08],[-76.4,0.3],[-77.4,0.4],[-78.0,1.0],[-78.85,1.42],[-78.6,1.8],[-78.2,2.6],[-77.7,3.3],[-77.4,3.9],[-77.35,4.5],[-77.45,5.5],[-77.35,6.0],[-77.5,6.6],[-77.9,7.2],[-77.75,7.6],[-77.35,7.95],[-77.36,8.67],[-76.85,8.3],[-76.72,8.05],[-76.82,8.65],[-76.3,9.3],[-75.8,9.42],[-75.6,9.55],[-75.62,10.0],[-75.55,10.4],[-75.3,10.75],[-74.85,11.1],[-74.2,11.25],[-73.5,11.3],[-72.9,11.55],[-72.4,11.75],[-72.15,12.2]];

export const CO_CITIES = [["Bogotá", 4.71, -74.07], ["Medellín", 6.25, -75.57], ["Barranquilla", 10.98, -74.79], ["Cali", 3.45, -76.53], ["Cartagena", 10.4, -75.51], ["Cúcuta", 7.89, -72.5], ["Pasto", 1.21, -77.28]];

export const EV_INFO = {
    and: { tone: ["#0E2E4A", "#3B1A6E"], accent: "#7DD3FC", lema: "Feria anual de telecomunicaciones y ciudades inteligentes, con más de 30 años de trayectoria.",
      para: "Operadores, ISPs, empresas TIC y líderes de telecomunicaciones de la región.", formato: ["Presencial", "4 días", "Feria y congreso"],
      agenda: [["Feria", "Exposición", "Expositores de telecomunicaciones y TIC"], ["Congreso", "Académico", "Sesiones y cursos técnicos"], ["Networking", "Negocios", "Encuentros de la industria"]],
      llevas: ["Panorama del sector de telecomunicaciones", "Contactos con proveedores y operadores", "Tendencias en ciudades inteligentes"] },
    ais: { tone: ["#3B1A6E", "#0E3A4A"], accent: "#BE82FF", lema: "Del piloto al impacto real: IA aplicada a resultados de negocio.",
      para: "Líderes de negocio y tecnología que deciden cómo escalar la IA en sus empresas.", formato: ["Presencial", "Fecha por confirmar", "Español"],
      agenda: [["Por confirmar", "Agenda", "El organizador publicará charlas y speakers"], ["Por confirmar", "Casos", "IA aplicada a resultados de negocio"], ["Por confirmar", "Networking", "Conecta con líderes del ecosistema"]],
      llevas: ["Casos de IA con resultados de negocio", "Contactos del ecosistema de IA en Colombia", "Ideas para pasar del piloto a producción"] },
    edu: { tone: ["#064E3B", "#1E1452"], accent: "#34D399", lema: "La feria B2E de tecnología para la educación, en Corferias.",
      para: "Instituciones educativas, docentes, directivos y empresas de tecnología educativa.", formato: ["Presencial", "3 días", "Feria"],
      agenda: [["Feria", "Exposición", "Expositores de tecnología educativa"], ["Innovación", "Zona de Innovación Educativa", "Talleres y laboratorios"], ["Networking", "Negocios", "Encuentros entre instituciones y proveedores"]],
      llevas: ["Panorama de la tecnología educativa", "Contactos con proveedores e instituciones", "Ideas aplicables en el aula y la gestión"] },
    adc: { tone: ["#1E3A8A", "#3B1A6E"], accent: "#818CF8", lema: "El congreso de las TIC en Colombia, organizado por CINTEL.",
      para: "Líderes de tecnología, telecomunicaciones, empresas y gobierno.", formato: ["Presencial", "Fecha por confirmar", "Congreso"],
      agenda: [["Por confirmar", "Congreso", "Transformación digital y conectividad"], ["Por confirmar", "Muestra", "Soluciones de empresas TIC"], ["Por confirmar", "Networking", "Encuentros de la industria"]],
      llevas: ["Tendencias de transformación digital", "Contactos del sector TIC", "Visión de política pública y conectividad"] }
  };

export const NE_TYPES = ["Meetup", "Taller práctico", "Charla", "Networking", "Panel"];

export const NE_CITIES = ["Bogotá", "Medellín", "Barranquilla", "Cali", "Cartagena", "Bucaramanga", "Virtual"];
