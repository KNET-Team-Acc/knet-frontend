import { installI18n } from "@/lib/i18n/runtime";
import { bootKnetApp } from "@/lib/engine/knetApp";
import { startCinematicUniverse } from "@/lib/cinematic/universe";

let booted = false;

/**
 * Orden de arranque (igual que en el HTML original):
 * 1) traductor ES→EN, 2) motor de la app, 3) universo 3D de la landing.
 * Protegido para ejecutarse una sola vez (React StrictMode monta dos veces en desarrollo).
 */
export function bootKnet() {
  if (booted) return;
  booted = true;
  installI18n();
  bootKnetApp();
  startCinematicUniverse();
}
