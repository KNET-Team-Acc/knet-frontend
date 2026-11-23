/**
 * Cabeceras de seguridad del frontend. Fuente única para `vite preview` (vite.config.js), con el que
 * corren las pruebas E2E. Las copias estáticas de producción viven en vercel.json y public/_headers
 * (Netlify / Cloudflare Pages): si cambias algo aquí, cámbialo también allí.
 *
 * - script-src 'self': el build de Vite no usa scripts inline ni eval.
 * - style-src 'unsafe-inline': el motor pinta estilos en atributos style (paneles, barras, avatar).
 * - img-src https:: fotos de perfil de LinkedIn. connect-src: la propia web + el origen de la API.
 */
export function contentSecurityPolicy({ apiOrigin = "", production = true } = {}) {
  const connect = ["'self'", production ? "https:" : "", apiOrigin].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src ${connect}`,
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    production ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join("; ");
}

export function securityHeaders(opts = {}) {
  return {
    "Content-Security-Policy": contentSecurityPolicy(opts),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}
