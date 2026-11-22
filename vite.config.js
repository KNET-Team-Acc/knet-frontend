import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
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
});
