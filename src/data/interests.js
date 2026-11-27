/**
 * Catálogo de intereses del onboarding y de «Mi perfil», agrupado por categoría tech.
 * Los valores son el texto canónico en español: es lo que se guarda en el perfil y se envía a la API
 * (`interests`: strings libres de hasta 60 caracteres). El motor añade a este catálogo los tags de los
 * eventos reales y los intereses de los perfiles base, y el usuario puede escribir los suyos.
 * `label` es una clave de I18N (src/data/navigation.js); INTEREST_EN traduce solo la etiqueta visible.
 */

export const INTEREST_MIN = 1;
export const INTEREST_MAX = 5;
export const INTEREST_CUSTOM_LEN = 40;

export const INTEREST_CATS = [
  { id: "ai", label: "int.cat.ai", items: ["Agentes de IA", "LLMs", "IA generativa", "RAG", "MCP", "Evaluación de modelos", "IA explicable", "Escalar IA"] },
  { id: "cloud", label: "int.cat.cloud", items: ["Cloud", "DevOps", "Kubernetes", "Plataformas internas", "Observabilidad", "FinOps", "Serverless"] },
  { id: "dev", label: "int.cat.dev", items: ["Desarrollo web", "Mobile", "APIs", "Arquitectura de software", "Open source", "Calidad de software"] },
  { id: "data", label: "int.cat.data", items: ["Datos", "Gobierno de datos", "Ingeniería de datos", "Analítica", "Machine Learning", "Gemelos digitales"] },
  { id: "sec", label: "int.cat.sec", items: ["Ciberseguridad", "Zero Trust", "Privacidad", "Identidad digital", "Gestión de riesgos"] },
  { id: "product", label: "int.cat.product", items: ["Producto digital", "UX", "Experiencia de cliente", "Métricas de valor", "Gestión del cambio"] },
  { id: "startup", label: "int.cat.startup", items: ["Startups", "Emprendimiento", "Venture capital", "Fintech", "Open Finance"] },
  { id: "hw", label: "int.cat.hw", items: ["IoT", "Edge computing", "Robótica", "Mantenimiento predictivo", "Semiconductores"] },
];

/* Etiqueta en inglés de los intereses cuyo nombre cambia (el resto se muestra igual en los dos idiomas) */
export const INTEREST_EN = {
  "Agentes de IA": "AI agents", "IA generativa": "Generative AI", "Evaluación de modelos": "Model evaluation", "IA explicable": "Explainable AI", "Escalar IA": "Scaling AI",
  "Plataformas internas": "Internal platforms", "Observabilidad": "Observability",
  "Desarrollo web": "Web development", "Arquitectura de software": "Software architecture", "Calidad de software": "Software quality",
  "Datos": "Data", "Gobierno de datos": "Data governance", "Ingeniería de datos": "Data engineering", "Analítica": "Analytics", "Gemelos digitales": "Digital twins",
  "Ciberseguridad": "Cybersecurity", "Privacidad": "Privacy", "Identidad digital": "Digital identity", "Gestión de riesgos": "Risk management",
  "Producto digital": "Digital product", "Experiencia de cliente": "Customer experience", "Métricas de valor": "Value metrics", "Gestión del cambio": "Change management",
  "Emprendimiento": "Entrepreneurship", "Robótica": "Robotics", "Mantenimiento predictivo": "Predictive maintenance", "Semiconductores": "Semiconductors",
  "Sostenibilidad": "Sustainability", "Transición energética": "Energy transition", "Riesgo crediticio": "Credit risk",
};
