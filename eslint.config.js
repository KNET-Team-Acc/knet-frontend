import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist", "dist-e2e", "dist-e2e-real", "playwright-report*", "test-results", "src/lib/**", "src/data/pdf-fonts.js"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    settings: { react: { version: "19.0" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/no-unknown-property": "off",
    },
  },
  {
    // Configuración, despliegue y pruebas E2E corren en Node (Playwright / Vite)
    files: ["*.config.js", "e2e/**/*.js", "deploy/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
