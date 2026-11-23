import { defineConfig, devices } from "@playwright/test";

/**
 * E2E con la API simulada (page.route): `npm run e2e`.
 * Construye la app con VITE_API_URL apuntando a un origen ficticio que interceptan las pruebas
 * (e2e/support/mock-api.js) y la sirve con `vite preview` (build de producción).
 * Contra el backend real: `npm run e2e:real` (playwright.real.config.js).
 */
const PORT = Number(process.env.E2E_PORT || 4173);

export default defineConfig({
  testDir: "e2e",
  testIgnore: ["real/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 860 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } } }],
  webServer: {
    command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { VITE_API_URL: "http://api.knet.test", VITE_DEMO_USER_ID: "" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
