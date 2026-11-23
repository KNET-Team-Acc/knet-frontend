# KNET frontend

Vite + React 19 + Tailwind. React monta el layout (`src/components/`); casi toda la lógica vive en el motor vanilla `src/lib/engine/knetApp.js` (`bootKnetApp()`). Landing 3D: `src/lib/cinematic/universe.js`. Datos estáticos: `src/data/` (`config.js` tiene `LEGAL`, `KEY`, `CONSENT_KEY`, `PREF_KEY`). Backend: `D:\Downloads\knet-backend` (ver su `CLAUDE.md`).

## Comandos
- `npm run dev` (:5173) · `npm run build` (verificación mínima tras editar) · `npm run lint` (`knetApp.js` está ignorado por eslint)
- `npm run e2e` (Playwright + API simulada en `e2e/support/mock-api.js`; build en `dist-e2e`, preview :4173) · `npm run e2e:real` (contra knet-backend; `E2E_API_URL`, preview :4174). El CI corre lint, build y e2e: mantenlos verdes.
- Despliegue: `vercel.json` / `public/_headers` / `public/_redirects`. Cabeceras: fuente única `deploy/security-headers.js` (la usa `vite preview`); si cambian, actualiza las copias estáticas. La CSP prohíbe scripts inline y `eval`.

## i18n
Español es la fuente; el inglés se aplica en tiempo real. `src/lib/i18n/dictionary.js` = frases exactas (`EXACT`, clave = texto ES). `src/lib/i18n/runtime.js` = `PATS` para textos con variables: `[regex estilo re.escape con ([\s\S]*?), "EN con {0}", longitud del ES sin marcadores]`. Si cambias un texto visible en ES, actualiza su entrada o deja de traducirse.

## API (`src/services/api.js`)
- Base `VITE_API_URL` (sin definir: `http://localhost:4000` en desarrollo y modo local en un build de producción; vacía = solo local, sin cuenta).
- Sesión: `api.signUp` / `api.login` / `api.exchange` (vuelta de LinkedIn) guardan access + refresh token en `localStorage["knet-auth"]` y cada petición va con `Authorization: Bearer`. Un 401 refresca **una sola vez** (un único refresh en vuelo) y repite; si el refresh falla se borra la sesión y se emite `session-expired` (`onApiEvent`). Un 409 `legal_outdated` emite `legal-outdated`.
- Solo en desarrollo y sin sesión: `X-User-Id` desde `localStorage["knet-api-user"]` o `VITE_DEMO_USER_ID` (si no, el demo compartido). `request(..., { userId })` fuerza otra cuenta (Bearer si es la de la sesión; si no, solo en desarrollo). `accountAvailable()` = hay con quién hablar con `/api/me`.
- Cuenta KNET en el motor (`openEntry`, `openAuth`, `enterWithAccount`): con API, entrar pasa por `#m-auth` (`AuthModal.jsx`); «Continuar sin cuenta» = flujo local de siempre. El perfil local queda ligado a `A.accountId` y solo se sincroniza si coincide con la sesión (`accountReady()`). Registro con perfil local sin cuenta → se vincula y el navegador sube todo; login → manda el servidor (`A.apiLinked = true`).
- LinkedIn real: si `/api/auth/providers` dice `linkedin: true`, la pantalla de permisos navega a `/api/auth/linkedin` (scopes marcados) y la vuelta llega con `?knet_auth=<código>` (`authReturn()`). Sin configurar, se mantiene la importación simulada del modo local.
- Re-aceptación legal: `#m-legalup` (`LegalUpdateModal.jsx`, `data-locked`: ni Escape ni el fondo lo cierran) registra una `aceptacion` en la cadena local + servidor antes de seguir.
- Fallback silencioso: `ApiOffline` (red, timeout 4 s, 503) → el motor sigue con lo local; `ApiError` = error HTTP.
- IA (`api.aiChat`, `aiSimulate`, `aiDossier`, timeout `AI_TIMEOUT_MS` = 30 s): `ask()` (Concierge), `sendDm()` (Simulador) y la acción `gen` (Dossier) prueban primero el servidor (`aiConcierge`, `aiSimulator`, `aiDossierGen`, solo con `accountReady()` y `A.apiLinked`) y, ante `ApiOffline` (incluye 503 `ai_unavailable`) o cualquier error, usan `reply()` / `dmReply()` / el Dossier local sin mostrar error. Mientras responde se bloquea el formulario (sin envíos dobles). El Dossier de la IA se guarda en `A.aiDossier[evento]` (lo usan `dossierData()` y el PDF) y ya queda en el servidor, así que no se reenvía por la cola; el local sigue yendo por `outbox` (`dossier`).
- XP híbrida: `A.xp = xpServidor + A.xpLocal`. `A.xpSynced` (claves `mission:`, `checkin:`, `conn:`) evita restar dos veces al confirmar el servidor.
- `A.outbox`: acciones offline (`mission`, `reg`, `checkin`, `conn`, `dossier`) reenviadas en orden por `flushOutbox()`; `A.apiLinked` decide quién manda en el sync.
- Consentimientos: cadena local en `knet-consent-local` + `POST /api/me/consents`. `rec.api` (pendiente/guardado/rechazado) se escribe tras el hash y `verifyChain()` lo excluye. Cada pendiente se envía como la cuenta que lo dio (`rec.cuentaId`); sin una sesión de esa cuenta espera (`consentSendable`, nunca se marca «rechazado» por falta de sesión). `logConsent(evt, { savedOnServer })` deja constancia local de algo que el servidor ya registró (registro de cuenta, LinkedIn). Registros sin `rec.api` (anteriores) no se suben.
- «Revocar y borrar mis datos»: borra local, espera el `revocacion` y llama `DELETE /api/me`; si está offline guarda el UUID en `knet-pending-erase` (y conserva la sesión solo para ese reintento) y `syncFromApi()` reintenta tras `flushConsents()`. Al completarse se cierra la sesión. 403 `demo_account` = solo borrado local.

## No tocar sin autorización
- `src/lib/cinematic/universe.js`
- `src/lib/i18n/` (`dictionary.js`, `runtime.js`)
- Textos legales (`DOCS` en `knetApp.js`) y `LEGAL` en `src/data/config.js`: piden autorización explícita; un cambio sustancial sube `LEGAL.version`.
