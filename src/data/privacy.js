/**
 * Permisos de LinkedIn por campo, textos de autorización y tipos de evento del registro de consentimientos.
 */

export const P_FIELDS = ["name", "role", "company", "ind", "seniority", "interests", "location"];

export const evtTypeLbl = { aceptacion: "Aceptación", autorizacion_linkedin: "Permiso LinkedIn", vinculacion: "Titular identificado", revocacion: "Revocación", cambio_permiso: "Cambio de permiso", almacenamiento: "Almacenamiento" };

export const LI_FIELDS = [["basic", "Nombre", "Obligatorio para crear tu perfil", true], ["work", "Cargo y empresa", "Opcional"], ["industry", "Industria y seniority", "Opcional"], ["skills", "Habilidades e intereses", "Opcional"]];

export const LI_AUTH_TXT = "Autorizo a KNET a consultar en mi cuenta de LinkedIn únicamente los datos marcados arriba, con la finalidad de crear mi perfil del Summit.";

export const PERM_SCOPES = [["profile", "Titular y rol actual", "Obligatorio para usar KNET"], ["industry", "Industria y seniority", "Mejora el matchmaking"], ["interests", "Habilidades e intereses", "Sugerencias de charlas y misiones"], ["network", "Red de contactos", "Activa el grafo de contactos del Summit"]];
