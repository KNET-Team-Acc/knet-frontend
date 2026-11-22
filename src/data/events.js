/**
 * Eventos (reales y de demostración), días, fichas, ponentes ficticios y geografía de Colombia para el mapa.
 */

export const SUMMIT_POOL = [["Andrea P.", "Head de Producto · Telco"], ["Ricardo M.", "CIO · Retail"], ["Juliana C.", "Data Scientist · Banca"], ["Tomás V.", "Arquitecto Cloud · Seguros"], ["Mariana Q.", "Directora de Innovación · Salud"], ["Sebastián O.", "CTO · Logística"], ["Lucía F.", "Product Manager · Fintech"], ["Esteban R.", "Gerente de Datos · Energía"], ["Óscar N.", "Head de IA · Gobierno"], ["Isabel D.", "VP Estrategia · Consumo"], ["Hernán G.", "Director de TI · Minería"], ["Carolina E.", "Líder de Ciberseguridad · Banca"], ["Manuel K.", "Fundador · Startup de IA"], ["Gabriela H.", "Consultora · Transformación"]];

export const EVENTS = [
    { id: "bog", demo: true, city: "Bogotá", name: "AI & Business Summit", venue: "Centro de Convenciones · UPL Entrenubes", date: "10–11 dic 2026", when: "Próximo mes", lat: 4.71, lon: -74.07, tags: ["Agentes de IA", "IA explicable", "Escalar IA", "Métricas de valor", "Open Finance", "Riesgo crediticio"], ind: ["banca", "consultoria", "tech"], desc: "Dos días de IA aplicada a negocio con casos de banca, retail y sector público." },
    { id: "med", city: "Chía", name: "DevFest Bogotá 2026", venue: "Universidad de La Sabana · Chía (Cundinamarca)", date: "28 nov 2026", when: "Esta semana", lat: 4.86, lon: -74.03, tags: ["Agentes de IA", "Cloud", "Datos", "Plataformas internas"], ind: ["tech", "consultoria"], desc: "El encuentro anual de la comunidad Google Developer Groups de Bogotá: IA, nube y desarrollo.", real: true, org: "GDG Bogotá", url: "https://sessionize.com/devfest-bogota-2026" },
    { id: "and", city: "Cartagena", name: "Andina Link Smart Cities Expo 2027", venue: "Las Américas Resort and Convention Center · Cartagena", date: "8–11 mar 2027", when: "En 3 meses", lat: 10.45, lon: -75.51, tags: ["Datos", "Cloud", "Transición energética", "Gemelos digitales"], ind: ["tech", "energia", "consultoria"], desc: "Feria internacional de telecomunicaciones, tecnologías convergentes y ciudades inteligentes de América Latina.", real: true, org: "Andina Link", url: "https://www.luminik.io/events/andina-link-cartagena/" },
    { id: "baq", city: "Medellín", name: "DevFest Medellín 2026", venue: "Universidad Pontificia Bolivariana · Aula Magna", date: "29 nov 2026", when: "Esta semana", lat: 6.24, lon: -75.59, tags: ["Agentes de IA", "Cloud", "RAG", "Datos"], ind: ["tech", "consultoria", "banca"], desc: "La conferencia anual del Google Developer Group Medellín, con charlas de IA, nube y desarrollo.", real: true, org: "GDG Medellín", url: "https://andresospina.co/eventos-ia/evento/devfest-medellin-2026/" },
    { id: "x2", lvl: 2, city: "Medellín", name: "Hackathon KNET: agentes en 24 horas", venue: "Medellín Innovation District · Sala de makers", date: "6–7 dic 2026", when: "En 3 semanas", lat: 6.25, lon: -75.57, tags: ["Agentes de IA", "MCP", "RAG", "Plataformas internas"], ind: ["tech", "consultoria", "banca"], desc: "24 horas para construir un agente útil con mentores y créditos de nube." },
    { id: "x3", lvl: 3, city: "Bogotá", name: "Roundtable de integradores: datos + IA", venue: "Club de negocios del norte · Salón privado", date: "15 ene 2027", when: "En 2 meses", lat: 4.71, lon: -74.07, tags: ["Datos", "Escalar IA", "Open Finance", "Gobierno de datos"], ind: ["banca", "tech", "consultoria", "energia"], desc: "Mesa cerrada de 20 personas para conectar datos, IA y procesos entre empresas." },
    { id: "x4", lvl: 4, city: "Cartagena", name: "Cena de arquitectos de IA con speakers", venue: "Casa colonial del Centro Histórico", date: "5 feb 2027", when: "En 3 meses", lat: 10.39, lon: -75.51, tags: ["Escalar IA", "Métricas de valor", "Agentes de IA", "Transición energética"], ind: ["banca", "tech", "consultoria", "energia"], desc: "Cena privada con los ponentes del Summit para diseñar la siguiente ola de casos de IA." },
    { id: "x5", lvl: 5, city: "Santa Marta", name: "KNET Innovators Retreat", venue: "Reserva natural frente al mar", date: "12–14 mar 2027", when: "En 4 meses", lat: 11.24, lon: -74.2, tags: ["Escalar IA", "Gestión del cambio", "Startups", "Agentes de IA", "Gemelos digitales"], ind: ["banca", "tech", "consultoria", "energia"], desc: "Tres días con los innovadores del año: acceso VIP, sesiones 1:1 con líderes y retos de futuro." }
  ];

export const EV_DAYS = { bog: ["2026-12-10", "2026-12-11"], med: ["2026-11-28"], baq: ["2026-11-29"], and: ["2027-03-08", "2027-03-09", "2027-03-10", "2027-03-11"], x2: ["2026-12-06", "2026-12-07"], x3: ["2027-01-15"], x4: ["2027-02-05"], x5: ["2027-03-12", "2027-03-13", "2027-03-14"] };

export const COL_OUTLINE = [[-71.67,12.46],[-71.32,12.15],[-71.33,11.85],[-71.95,11.6],[-72.25,11.15],[-72.55,10.85],[-72.9,10.45],[-73.05,9.7],[-72.95,9.2],[-72.72,8.9],[-72.45,8.4],[-72.38,7.9],[-72.48,7.42],[-72.2,7.35],[-71.85,7.05],[-71.0,6.98],[-70.4,7.05],[-69.9,6.6],[-69.45,6.12],[-68.6,6.15],[-67.85,6.3],[-67.6,5.6],[-67.82,4.95],[-67.85,4.5],[-67.65,3.75],[-67.35,3.3],[-67.3,2.85],[-67.25,2.35],[-67.1,1.75],[-66.87,1.23],[-67.45,2.05],[-68.2,1.75],[-69.15,1.75],[-69.85,1.7],[-69.6,1.05],[-70.05,0.6],[-70.04,-0.2],[-69.6,-0.6],[-69.4,-1.15],[-69.6,-2.5],[-69.95,-4.2],[-70.3,-3.8],[-70.7,-3.8],[-71.4,-2.4],[-72.2,-2.45],[-72.9,-2.45],[-73.6,-1.3],[-74.4,-0.9],[-75.2,-0.1],[-75.6,0.08],[-76.4,0.3],[-77.4,0.4],[-78.0,1.0],[-78.85,1.42],[-78.6,1.8],[-78.2,2.6],[-77.7,3.3],[-77.4,3.9],[-77.35,4.5],[-77.45,5.5],[-77.35,6.0],[-77.5,6.6],[-77.9,7.2],[-77.75,7.6],[-77.35,7.95],[-77.36,8.67],[-76.85,8.3],[-76.72,8.05],[-76.82,8.65],[-76.3,9.3],[-75.8,9.42],[-75.6,9.55],[-75.62,10.0],[-75.55,10.4],[-75.3,10.75],[-74.85,11.1],[-74.2,11.25],[-73.5,11.3],[-72.9,11.55],[-72.4,11.75],[-72.15,12.2]];

export const CO_CITIES = [["Bogotá", 4.71, -74.07], ["Medellín", 6.25, -75.57], ["Barranquilla", 10.98, -74.79], ["Cali", 3.45, -76.53], ["Cartagena", 10.4, -75.51], ["Cúcuta", 7.89, -72.5], ["Pasto", 1.21, -77.28]];

export const SPEAKER_NAMES = ["Laura M.", "Natalia S.", "Andrea P.", "Óscar N.", "Mariana Q."];

export const EV_SPEAKERS = {
    bog: [
      { n: "Catalina Velasco", role: "Directora de IA Responsable", org: "Banco Andino Digital", ses: "Keynote · Día 1", talk: "Gobierno de IA que acelera, no frena", bio: "15 años en riesgo y analítica. Lideró el primer comité de ética de IA de su banco y hoy asesora a reguladores de la región.", tags: ["IA explicable", "Riesgo crediticio", "Gobierno de datos"], av: { gender: "mujer", skin: 2, hair: "bob", hairColor: 0, outfit: 0, acc: "gafas", beard: false } },
      { n: "Sergio Villegas", role: "Socio de Estrategia Digital", org: "Consultora de transformación", ses: "Casos reales · Día 1", talk: "Del piloto al P&L: cómo escalar la IA", bio: "Ha acompañado a más de 30 empresas a pasar de pilotos a programas de IA con retorno medible.", tags: ["Escalar IA", "Métricas de valor", "Gestión del cambio"], av: { gender: "hombre", skin: 1, hair: "corto", hairColor: 1, outfit: 1, acc: "credencial", beard: true } },
      { n: "Valeria Ochoa", role: "CTO", org: "Fintech de pagos inmediatos", ses: "Taller · Día 2", talk: "Open Finance en 90 días", bio: "Construyó la plataforma de APIs abiertas de su compañía y la conectó con 12 entidades financieras.", tags: ["Open Finance", "Agentes de IA", "APIs abiertas"], av: { gender: "mujer", skin: 3, hair: "largo", hairColor: 0, outfit: 2, acc: "audifonos", beard: false } }
    ],
  };

export const EV_INFO = {
    bog: { tone: ["#3B1A6E", "#0E3A4A"], accent: "#BE82FF", lema: "De la curiosidad por la IA a casos de negocio con retorno medible.",
      para: "Líderes de negocio, banca, consultoría y tecnología que deciden en qué invertir con IA.", formato: ["Presencial", "2 días", "Español"],
      agenda: [["Día 1 · mañana", "Keynotes", "Estrategia de IA y gobierno corporativo"], ["Día 1 · tarde", "Casos reales", "Banca y retail con cifras de impacto"], ["Día 2", "Talleres", "Priorizar casos de uso y medir el retorno"]],
      llevas: ["Una plantilla para priorizar casos de IA", "Contactos con decisores de grandes empresas", "Ideas de gobierno y riesgo aplicables el lunes"] },
    med: { tone: ["#0B3B3A", "#1E1452"], accent: "#6EE7B7", lema: "Organiza GDG Bogotá, parte del programa global DevFest de Google Developer Groups.",
      para: "Desarrolladores, estudiantes y personas apasionadas por la tecnología.", formato: ["Presencial", "1 día", "Español"],
      agenda: [["Charlas", "IA", "Inteligencia artificial y agentes"], ["Charlas", "Nube", "Google Cloud y desarrollo"], ["Comunidad", "Networking", "Conecta con la comunidad GDG"]],
      llevas: ["Ideas prácticas de IA y nube", "Contactos de la comunidad de desarrolladores", "Experiencias compartidas por speakers de la comunidad"] },
    baq: { tone: ["#4A1650", "#0E2E4A"], accent: "#FFB27A", lema: "Organiza GDG Medellín, parte del programa global DevFest de Google Developer Groups.",
      para: "Desarrolladores y builders de la comunidad tech de Medellín.", formato: ["Presencial", "1 día", "Entrada gratuita"],
      agenda: [["Track", "IA", "Inteligencia artificial"], ["Track", "Cloud", "Nube y plataformas"], ["Track", "Desarrollo", "Desarrollo de software"]],
      llevas: ["Tendencias de IA y nube", "Contactos de la comunidad GDG Medellín", "Inspiración para tus proyectos"] },
    and: { tone: ["#0E2E4A", "#3B1A6E"], accent: "#7DD3FC", lema: "Feria anual de telecomunicaciones y ciudades inteligentes, con más de 30 años de trayectoria.",
      para: "Operadores, ISPs, empresas TIC y líderes de telecomunicaciones de la región.", formato: ["Presencial", "4 días", "Feria y congreso"],
      agenda: [["Feria", "Exposición", "Expositores de telecomunicaciones y TIC"], ["Congreso", "Académico", "Sesiones y cursos técnicos"], ["Networking", "Negocios", "Encuentros de la industria"]],
      llevas: ["Panorama del sector de telecomunicaciones", "Contactos con proveedores y operadores", "Tendencias en ciudades inteligentes"] },
    x2: { tone: ["#1E3A8A", "#3B1A6E"], accent: "#818CF8", lema: "Construye en equipo un agente que resuelva un problema real en 24 horas.",
      para: "Asistentes desde el nivel Desarrollador que quieren pasar de la teoría al código.", formato: ["Presencial", "24 horas", "Español"],
      agenda: [["Día 1 · 10:00", "Kick-off", "Retos de empresas y formación de equipos"], ["Día 1 · noche", "Build", "Mentorías en agentes, MCP y RAG"], ["Día 2 · 10:00", "Demo", "Presentación ante jurado y premiación"]],
      llevas: ["Un prototipo funcional para tu portafolio", "Créditos de nube para seguir construyendo", "Mentoría de ingenieros senior"] },
    x3: { tone: ["#064E3B", "#1E1452"], accent: "#34D399", lema: "Una mesa cerrada para unir datos, IA y procesos entre empresas.",
      para: "Asistentes desde el nivel Integrador que conectan áreas, datos y sistemas.", formato: ["Presencial", "Medio día", "Cupo de 20"],
      agenda: [["14:00", "Apertura", "Casos de integración que sí escalaron"], ["15:00", "Mesas", "Gobierno de datos, Open Finance y plataformas"], ["17:00", "Networking", "Café privado con los participantes"]],
      llevas: ["Un mapa de integración aplicable a tu empresa", "Contactos con líderes de datos de otras industrias", "Acta con los acuerdos de la mesa"] },
    x4: { tone: ["#4C1D95", "#7C2D12"], accent: "#CF9BFF", lema: "Una cena privada para diseñar la próxima ola de casos de IA con los ponentes.",
      para: "Asistentes desde el nivel Arquitecto que diseñan redes, programas y propuestas.", formato: ["Presencial", "Noche", "Por invitación"],
      agenda: [["19:00", "Bienvenida", "Cóctel con los speakers del Summit"], ["20:00", "Cena", "Conversación guiada: casos de IA a 2027"], ["22:00", "Cierre", "Acuerdos y próximos pasos"]],
      llevas: ["Conversación cercana con los speakers", "Ideas para tu hoja de ruta de IA", "Acceso a la comunidad de arquitectos KNET"] },
    x5: { tone: ["#831843", "#0E7490"], accent: "#FDE68A", lema: "Tres días para quienes ya están cambiando su industria con IA.",
      para: "Solo para quienes alcanzaron el nivel Innovador en KNET.", formato: ["Presencial", "3 días", "Acceso VIP"],
      agenda: [["Día 1", "Llegada", "Sesiones 1:1 con líderes C-level"], ["Día 2", "Retos de futuro", "Laboratorios con startups y fondos"], ["Día 3", "Manifiesto", "Compromisos de innovación para 2027"]],
      llevas: ["Acceso VIP y hospedaje incluido", "Sesiones 1:1 con líderes de la región", "Reconocimiento como Innovador KNET"] }
  };

export const NE_TYPES = ["Meetup", "Taller práctico", "Charla", "Networking", "Panel"];

export const NE_CITIES = ["Bogotá", "Medellín", "Barranquilla", "Cali", "Cartagena", "Bucaramanga", "Virtual"];
