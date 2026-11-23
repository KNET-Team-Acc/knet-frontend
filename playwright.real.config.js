import { defineConfig, devices } from "@playwright/test";

/**
 * E2E contra el backend real de KNET: `npm run e2e:real`.
 * Necesita la API en marcha (E2E_API_URL, por defecto http://localhost:4000) con la base migrada y el
 * seed cargado, y su CORS_ORIGIN debe incluir http://localhost:<E2E_REAL_PORT> (4174 por defecto).
 */
const PORT = Number(process.env.E2E_REAL_PORT || 4174);
const API = process.env.E2E_API_URL || "http://localhost:4000";

export default defineConfig({
  testDir: "e2e/real",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "playwright-report-real" }]] : [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", viewport: { width: 1280, height: 860 } },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } } }],
  webServer: {
    command: `npx vite build --outDir dist-e2e-real --emptyOutDir && npx vite preview --outDir dist-e2e-real --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { VITE_API_URL: API, VITE_DEMO_USER_ID: "" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
