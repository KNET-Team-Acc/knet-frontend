# KNET frontend

Vite + React 19 + Tailwind. React monta el layout (`src/components/`); casi toda la lógica vive en el motor vanilla `src/lib/engine/knetApp.js` (`bootKnetApp()`). Landing 3D: `src/lib/cinematic/universe.js`. Datos estáticos: `src/data/` (`config.js` tiene `LEGAL`, `KEY`, `CONSENT_KEY`, `PREF_KEY`). Backend: `D:\Downloads\knet-backend` (ver su `CLAUDE.md`).

## Comandos
- `npm run dev` (:5173) · `npm run build` (verificación mínima tras editar) · `npm run lint` (`knetApp.js` está ignorado por eslint)

## i18n
Español es la fuente; el inglés se aplica en tiempo real. `src/lib/i18n/dictionary.js` = frases exactas (`EXACT`, clave = texto ES). `src/lib/i18n/runtime.js` = `PATS` para textos con variables: `[regex estilo re.escape con ([\s\S]*?), "EN con {0}", longitud del ES sin marcadores]`. Si cambias un texto visible en ES, actualiza su entrada o deja de traducirse.

## API (`src/services/api.js`)
- Base `VITE_API_URL` (por defecto `http://localhost:4000`; vacía = solo local). Usuario: `X-User-Id` desde `localStorage["knet-api-user"]` o `VITE_DEMO_USER_ID`; sin él, el backend usa el demo compartido. `request(..., { userId })` fuerza otra cuenta.
- Fallback silencioso: `ApiOffline` (red, timeout 4 s, 503) → el motor sigue con lo local; `ApiError` = error HTTP.
- XP híbrida: `A.xp = xpServidor + A.xpLocal`. `A.xpSynced` (claves `mission:`, `checkin:`, `conn:`) evita restar dos veces al confirmar el servidor.
- `A.outbox`: acciones offline (`mission`, `reg`, `checkin`, `conn`, `dossier`) reenviadas en orden por `flushOutbox()`; `A.apiLinked` decide quién manda en el sync.
- Consentimientos: cadena local en `knet-consent-local` + `POST /api/me/consents`. `rec.api` (pendiente/guardado/rechazado) se escribe tras el hash y `verifyChain()` lo excluye. Cada pendiente se envía con el `X-User-Id` de la cuenta que lo dio (`rec.cuentaId`). Registros sin `rec.api` (anteriores) no se suben.
- «Revocar y borrar mis datos»: borra local, espera el `revocacion` y llama `DELETE /api/me`; si está offline guarda el UUID en `knet-pending-erase` y `syncFromApi()` reintenta tras `flushConsents()`. 403 `demo_account` = solo borrado local.

## No tocar sin autorización
- `src/lib/cinematic/universe.js`
- `src/lib/i18n/` (`dictionary.js`, `runtime.js`)
- Textos legales (`DOCS` en `knetApp.js`) y `LEGAL` en `src/data/config.js`: piden autorización explícita; un cambio sustancial sube `LEGAL.version`.
