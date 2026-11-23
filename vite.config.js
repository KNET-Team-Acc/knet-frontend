import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { securityHeaders } from "./deploy/security-headers.js";

/** Origen de la API para la CSP de `vite preview` (vacío = sin API) */
function apiOrigin(raw) {
  const v = raw === undefined ? "http://localhost:4000" : String(raw).trim();
  try { return v ? new URL(v).origin : ""; } catch { return ""; }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    // `vite preview` sirve el build con las mismas cabeceras de seguridad que producción (E2E incluidas).
    // La CSP local permite el origen http de la API; en producción solo https (vercel.json, public/_headers).
    preview: {
      headers: securityHeaders({ apiOrigin: apiOrigin(env.VITE_API_URL), production: false }),
    },
    build: {
      // El motor de KNET y el diccionario son grandes: se separan en chunks propios.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react")) return "react";
            if (id.includes("/src/lib/engine/") || id.includes("/src/data/")) return "knet-engine";
            if (id.includes("/src/lib/i18n/")) return "knet-i18n";
          },
        },
      },
    },
  };
});
