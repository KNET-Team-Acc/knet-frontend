import { createRoot } from "react-dom/client";
import App from "./App";

/* Estilos en el mismo orden que el diseño original:
   1) capas de la landing cinematográfica, 2) Tailwind, 3) sistema de diseño de KNET. */
import "./styles/root.css";
import "./styles/overrides/01-cinematic-scenes.css";
import "./styles/overrides/02-fit-and-layout.css";
import "./styles/overrides/03-footer-and-team.css";
import "./styles/overrides/04-dark-only.css";
import "./styles/overrides/05-app-polish.css";
import "./styles/tailwind.css";
import "./styles/main/01-foundation.css";
import "./styles/main/02-landing.css";
import "./styles/main/03-app.css";
import "./styles/main/04-editorial.css";
import "./styles/main/05-themes.css";
import "./styles/main/06-venue.css";
import "./styles/main/07-landing-motion.css";
import "./styles/main/08-auth.css";

// KNET se muestra solo en modo oscuro.
document.documentElement.classList.remove("theme-light");
try {
  localStorage.removeItem("knet-theme");
} catch {
  /* almacenamiento no disponible */
}

createRoot(document.getElementById("root")).render(<App />);
