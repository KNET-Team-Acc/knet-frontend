<p align="center">
  <img src="docs/screenshots/banner.webp" alt="KNET · Knowledge Network & Event Technology" width="100%">
</p>

<p align="center">
  <b>La plataforma que convierte cada evento en una experiencia viva, y deja tu conocimiento trabajando cuando termina.</b>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=0A0710">
  <img alt="Vite 5" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&labelColor=0A0710">
  <img alt="Tailwind CSS 3" src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white&labelColor=0A0710">
  <img alt="WebGL" src="https://img.shields.io/badge/WebGL-3D_sin_dependencias-A100FF?labelColor=0A0710">
  <img alt="WebXR" src="https://img.shields.io/badge/WebXR-VR_%2F_AR-E43DD6?labelColor=0A0710">
  <img alt="i18n" src="https://img.shields.io/badge/i18n-ES_%7C_EN-10B981?labelColor=0A0710">
  <img alt="Playwright" src="https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white&labelColor=0A0710">
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&labelColor=0A0710">
</p>

<p align="center">
  <a href="https://knet-frontend.vercel.app"><b>Ver la app</b></a> ·
  <a href="https://github.com/KNET-Team-Acc/knet-backend"><b>Backend</b></a>
</p>

---

## Tabla de contenido

1. [¿Qué es KNET?](#qué-es-knet)
2. [Capturas](#capturas)
3. [Funcionalidades](#funcionalidades)
4. [Stack técnico](#stack-técnico)
5. [Cómo empezar](#cómo-empezar)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Arquitectura](#arquitectura)
8. [Personalización rápida](#personalización-rápida)
9. [Conexión con el backend](#conexión-con-el-backend)
10. [Datos reales y datos de demostración](#datos-reales-y-datos-de-demostración)
11. [Privacidad, accesibilidad y rendimiento](#privacidad-accesibilidad-y-rendimiento)
12. [Pruebas](#pruebas)
13. [Despliegue](#despliegue)
14. [Hoja de ruta](#hoja-de-ruta)
15. [Equipo](#equipo)
16. [Créditos y licencias](#créditos-y-licencias)

---

## ¿Qué es KNET?

**KNET (Knowledge Network & Event Technology)** es una plataforma para asistentes de Summits y eventos de tecnología. Nace de una idea simple:

> *El conocimiento de un Summit no debería apagarse cuando se apagan las luces.*

En la mayoría de los eventos, el networking es al azar, las charlas son pasivas, los contactos se pierden y lo aprendido se evapora. KNET resuelve cada uno de esos problemas con un ciclo de cuatro pasos:

| Paso | Qué hace KNET |
|---|---|
| **Evento** | Check-ins NFC, charlas y misiones generan señales en tiempo real. |
| **Insight** | IA (LLM + RAG) convierte cada sesión en ideas clave, citando sesión y minuto. |
| **Conexión** | Matches con la razón visible e intercambio de contacto en un toque. |
| **Acción** | El Dossier traduce lo aprendido en un plan de 30 días. |

Este repositorio contiene el **frontend**: una landing cinematográfica con escenas 3D guiadas por el scroll y el **panel del asistente**. El panel tiene 8 secciones, recinto 3D con VR/AR, gamificación, tour guiado y traducción al inglés.

> [!NOTE]
> **Funciona con y sin servidor.** Con [knet-backend](https://github.com/KNET-Team-Acc/knet-backend) hay cuentas reales (correo o **Sign In with LinkedIn**), IA con **Claude**, cafés y chat entre asistentes, QR dinámico, check-in NFC y tiempo real. Sin él (o si se cae), la app sigue en **modo local**: guarda todo en el navegador, simula LinkedIn y la IA, y sincroniza lo pendiente al volver la conexión. En producción: https://knet-frontend.vercel.app. Ver [Conexión con el backend](#conexión-con-el-backend).

---

## Capturas

### Landing cinematográfica

| Hero: el Summit en 3D | El problema: del caos a la inteligencia |
|---|---|
| ![Hero](docs/screenshots/01-hero.webp) | ![Problema](docs/screenshots/02-problema.webp) |
| **Ciclo KNET:** Evento → Insight → Conexión → Acción | **Las 4 experiencias:** cambian solas al hacer scroll |
| ![Ciclo](docs/screenshots/03-ciclo.webp) | ![Experiencias](docs/screenshots/04-experiencias.webp) |
| **Simulador interactivo:** la IA arma tu Summit | **Recinto 3D:** ruta luminosa a tu sala |
| ![Simulador](docs/screenshots/05-simulador.webp) | ![Recinto](docs/screenshots/06-recinto-3d.webp) |
| **Privacidad y confianza** | **Equipo, lema y footer** |
| ![Privacidad](docs/screenshots/07-privacidad.webp) | ![Equipo](docs/screenshots/08-equipo-footer.webp) |

### Panel del asistente

| Tour guiado al conectar LinkedIn | Explorar próximos eventos (reales) |
|---|---|
| ![Tour](docs/screenshots/09-tour-guiado.webp) | ![Explorar](docs/screenshots/10-explorar-eventos.webp) |
| **Recinto 3D del evento** (WebGL + WebXR) | **Mi red:** grafo de conocimiento y credencial QR |
| ![Recinto app](docs/screenshots/11-recinto-app.webp) | ![Mi red](docs/screenshots/12-mi-red.webp) |
| **Misiones:** XP, niveles y experiencias presenciales | **Dossier post-Summit** |
| ![Misiones](docs/screenshots/13-misiones.webp) | ![Dossier](docs/screenshots/14-dossier.webp) |

### En el celular y en inglés

<p>
  <img src="docs/screenshots/m1-hero.webp" alt="Hero en celular" width="18%">
  <img src="docs/screenshots/m2-problema.webp" alt="Problema en celular" width="18%">
  <img src="docs/screenshots/m3-permisos-linkedin.webp" alt="Permisos de LinkedIn" width="18%">
  <img src="docs/screenshots/m4-tour.webp" alt="Tour en celular" width="18%">
  <img src="docs/screenshots/m5-panel.webp" alt="Panel en celular" width="18%">
</p>

![Panel en inglés](docs/screenshots/15-ingles.webp)

---

## Funcionalidades

### Landing: un recorrido 3D guiado por el scroll

Un único lienzo WebGL fijo detrás de la página. Miles de partículas cambian de forma según la sección en la que estás, y la cámara, las luces y los materiales se mueven con el scroll.

| Escena | Qué se ve | Componente |
|---|---|---|
| 01 · Universo KNET | Las partículas forman el logo y se convierten en un auditorio con pantalla holográfica. Al lado, una historia animada: alguien saca su celular y entra a KNET. | `Hero`, `HeroStory` |
| 02 · El problema | Del caos a una figura por cada transformación: personas conectadas, trofeo, tarjeta con NFC y documento. | `ProblemSection` |
| 03 · Ciclo KNET | Anillo 3D con calendario, bombillo, aros y rayo; una luz recorre los 4 pasos. | `CycleScene` |
| 04 · Las 4 experiencias | Núcleo con órbitas; las pestañas cambian solas al bajar. | `ExperiencesSection` |
| 05 · Simulador | Elige industria y objetivo: la IA (simulada) genera agenda, misiones, matches y concierge. | `SimulatorSection`, `SimulatorPreview` |
| 06 · Recinto 3D | Maqueta con auditorio, salas, labs y lounge; ruta luminosa a Labs, asistentes caminando y tótems NFC. | `VenueSection` |
| 07 · Cómo funciona | Credencial → candado (solo pasan los datos aceptados) → robot de IA → celular. | `ArchitectureSection`, `TechDetails` |
| 08 · Privacidad | Cúpula geodésica que protege un núcleo, con los 4 principios. | `TrustSection` |
| 09 · Cierre | Todo converge en el núcleo KNET alrededor del logo. | `ClosingCta` |

### Panel del asistente (8 secciones)

1. **Mi perfil**: cuenta con correo o LinkedIn, datos importados de LinkedIn o escritos a mano, editables con lápiz, avatar ilustrado y permisos revocables.
2. **Mis eventos**: inscripciones por día, recinto 3D de cada evento (recorrido a pie, tour, modo manos libres, **VR y AR con WebXR**) y exploración de eventos reales en un mapa de Colombia.
3. **Mi red**: grafo de conocimiento (personas y temas que los unen), matches sugeridos, credencial con **QR dinámico** firmado por el servidor, **escáner con la cámara**, cafés 1:1 y chat directo con otros asistentes (en tiempo real), y un simulador de networking con IA para practicar con los contactos del catálogo.
4. **Agenda personalizada**: charlas elegidas para tu industria, con check-in por QR o acercando el teléfono a un **tótem NFC** (Web NFC).
5. **Misiones**: XP, 5 niveles (Explorador → Innovador), insignias, misiones grupales y experiencias presenciales.
6. **AI Concierge**: asistente conversacional con **Claude** sobre tu agenda, sesiones, misiones y a quién conocer (cita las sesiones en las que se basa).
7. **Recompensas**: marcos, peinados y accesorios para el avatar que se desbloquean con XP.
8. **Dossier**: resumen post-Summit (ideas, contactos, plan de 30 días) escrito por la IA con tu actividad real y **descargable en PDF**, generado sin librerías.

### Y además

- **Tour guiado**: aparece al conectar LinkedIn por primera vez y se puede repetir desde el menú.
- **Traducción ES ↔ EN en tiempo real**: recorre el DOM con un diccionario y patrones con variables.
- **Notificaciones**: centro de avisos y notificaciones emergentes (toasts).
- **Legal y consentimientos**: términos, privacidad, cookies, reembolsos, créditos y registro trazable de consentimientos (cadena de hashes en el navegador y en el servidor), con re-aceptación obligatoria cuando cambia la versión legal y «Revocar y borrar mis datos».
- **Offline primero**: lo que haces sin conexión (misiones, inscripciones, check-ins, conexiones, cafés, mensajes) queda en cola y se envía en orden al volver la red, sin sumar la XP dos veces.
- **Responsive real**: portátil al 100 % de zoom, tablet y celular.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| UI | **React 19** (componentes por sección) |
| Build | **Vite 5** + `@vitejs/plugin-react` |
| Estilos | **Tailwind CSS 3** + sistema de diseño propio en CSS (variables, capas editoriales) |
| 3D landing | **WebGL 1 propio**, sin Three.js: partículas, líneas, mallas con fresnel, cámara por paradas |
| 3D recinto | WebGL propio + **WebXR** (VR con teletransporte y AR de sobremesa) y rutas con Dijkstra |
| PDF | Generador de PDF propio (A4, fuentes embebidas) |
| i18n | Traductor en tiempo real con `MutationObserver` |
| QR | `qrcode-generator` (dibujar el código) y `BarcodeDetector` con `jsqr` de respaldo (leerlo con la cámara; se carga solo al usarlo) |
| API | `src/services/api.js`: `fetch` con JWT, refresh automático, timeout y modo offline · `EventSource` para el tiempo real |
| Pruebas | **Playwright** (E2E con API simulada y contra el backend real) · ESLint |
| Tipografías | Archivo, Plus Jakarta Sans, Inter y JetBrains Mono (Google Fonts) |

Dependencias de runtime: React, `qrcode-generator` y `jsqr`. Todo lo demás (3D, PDF, traductor) es propio.

---

## Cómo empezar

**Requisitos:** Node.js 20 o superior (ver `.nvmrc`) y npm.

```bash
# 1. Clonar
git clone https://github.com/KNET-Team-Acc/knet-frontend.git
cd knet-frontend

# 2. Instalar dependencias
npm install

# 3. Modo desarrollo (http://localhost:5173)
npm run dev

# 4. Build de producción (carpeta dist/)
npm run build

# 5. Probar el build
npm run preview
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compila a `dist/` (separa React, el motor y el diccionario en chunks). |
| `npm run preview` | Sirve `dist/` para probarlo como en producción. |
| `npm run lint` | Revisa los componentes con ESLint. |
| `npm run e2e` | Pruebas E2E con Playwright y la API simulada (construye y sirve el build en el puerto 4173). La primera vez: `npx playwright install chromium`. |
| `npm run e2e:real` | Las mismas pruebas de punta a punta contra el backend real (`E2E_API_URL`, por defecto `http://localhost:4000`; su `CORS_ORIGIN` debe incluir `http://localhost:4174`). |

> [!TIP]
> Para ver las escenas 3D usa Chrome, Edge, Firefox o Safari con aceleración por hardware activa. Si el equipo no tiene WebGL, o si la persona pidió «reducir movimiento», la landing se muestra completa en versión estática.

---

## Estructura del proyecto

```text
knet-frontend/
├── index.html                    # HTML base: fuentes, meta y <div id="root">
├── package.json
├── vite.config.js                # Alias @ → src y chunks separados
├── tailwind.config.js            # Colores y fuentes de la marca
├── postcss.config.js
├── eslint.config.js
├── playwright.config.js          # E2E con API simulada (preview :4173)
├── playwright.real.config.js     # E2E contra el backend real (preview :4174)
├── vercel.json                   # Build, fallback SPA y cabeceras de seguridad
├── deploy/
│   └── security-headers.js       # Fuente única de la CSP y demás cabeceras
├── public/
│   ├── favicon.webp
│   └── _headers · _redirects     # Cabeceras y fallback SPA para Netlify / Cloudflare Pages
├── e2e/                          # Pruebas Playwright (support/mock-api.js simula la API; real/ usa la de verdad)
├── docs/
│   └── screenshots/              # Imágenes de este README
└── src/
    ├── main.jsx                  # Punto de entrada: estilos en orden + render de <App />
    ├── App.jsx                   # Composición de la página y arranque del motor
    ├── assets/                   # Logo, emblema y fotos del equipo
    │   └── team/
    ├── components/
    │   ├── layout/               # Backdrop (fondo + lienzo 3D), Navbar, SiteFooter, FooterLinks, FooterBar
    │   ├── landing/              # Hero, HeroStory, ScrollHint, Marquee, ProblemSection, CycleScene,
    │   │                         # ExperiencesSection, SimulatorSection, SimulatorPreview, VenueSection,
    │   │                         # ArchitectureSection, TechDetails, TrustSection, ClosingCta
    │   ├── team/                 # TeamSection, Motto
    │   ├── app/                  # AppView: contenedor del panel y botón del tour
    │   ├── modals/               # 18 diálogos (cuenta, LinkedIn, re-aceptación legal, avatar, evento, chat, escáner QR…)
    │   ├── privacy/              # StorageBanner
    │   └── ui/                   # ToastHost, SectionMenuButton
    ├── data/                     # Contenido editable separado de la lógica
    │   ├── team.js               # Integrantes, GitHub, LinkedIn y fotos
    │   ├── events.js             # Eventos reales + demo, días, fichas, mapa de Colombia
    │   ├── venues.js             # Recintos 3D por evento
    │   ├── industries.js         # Industrias, personas y perfiles del simulador
    │   ├── gamification.js       # Niveles, XP, insignias, misiones, experiencias
    │   ├── navigation.js         # Pestañas del panel, pasos del tour, sugerencias
    │   ├── insights.js           # Dossier, grafo, respuestas del Concierge
    │   ├── privacy.js            # Permisos por campo y textos de autorización
    │   ├── avatar.js · survey.js · networking.js · icons.js · config.js
    │   └── pdf-fonts.js          # Fuentes embebidas del PDF
    ├── services/
    │   └── api.js                # Cliente de knet-backend: sesión JWT, refresh, offline, IA, SSE
    ├── lib/
    │   ├── boot.js               # Orden de arranque (una sola vez)
    │   ├── engine/knetApp.js     # Motor de la app: panel, simulador, 3D del recinto, PDF, legal…
    │   ├── cinematic/universe.js # Universo 3D de la landing
    │   └── i18n/                 # runtime.js (traductor) + dictionary.js (ES → EN)
    └── styles/
        ├── root.css
        ├── tailwind.css
        ├── overrides/            # Escenas cinematográficas y ajustes de la landing/panel
        └── main/                 # Sistema de diseño: fundamentos → landing → app → editorial → temas → recinto → motion
```

---

## Arquitectura

### Cómo arranca

```mermaid
flowchart LR
    A[index.html] --> B[main.jsx<br/>estilos en orden]
    B --> C[App.jsx<br/>render de componentes]
    C -->|useEffect, una vez| D[lib/boot.js]
    D --> E[i18n/runtime.js<br/>window.KNET_I18N]
    D --> F[engine/knetApp.js<br/>panel + simulador + recinto]
    D --> G[cinematic/universe.js<br/>WebGL de la landing]
    F -.importa.-> H[(src/data/*)]
    E -.importa.-> I[(i18n/dictionary.js)]
    F --> J[services/api.js]
    J -->|REST + JWT · SSE| K[(knet-backend)]
    F -.sin API.-> L[(localStorage)]
```

1. **React** renderiza toda la estructura una sola vez: landing, panel vacío, modales y footer.
2. `bootKnet()` arranca en el mismo orden que el prototipo original: traductor, motor de la app y universo 3D.
3. El **motor** toma los nodos por `id` y pinta el contenido dinámico del panel, de las experiencias, del simulador y del equipo. Sus datos viven en `src/data`.
4. El **universo 3D** lee la posición de cada sección (`#chKnow`, `#chCycle`, `#chXp`, `#chVenue`, `#arStage`, `#chShield`…) y calcula en cada cuadro qué formación mostrar.

> [!IMPORTANT]
> Los componentes son **estáticos a propósito**: no tienen estado, para que React no vuelva a renderizar nodos que el motor está manejando. Si conviertes una parte del panel a React con estado, sácala primero del motor (ver [Hoja de ruta](#hoja-de-ruta)).

### Universo cinematográfico (`src/lib/cinematic/universe.js`)

- **Formaciones**: cada escena es un arreglo de N partículas (x, y, z, grupo). El shader mezcla dos formaciones con un desfase por partícula y una curva, para que se vea como una transformación y no como un fundido.
- **Paradas atadas al DOM**: cada sección define una parada con su formación, cámara y rotación. El scroll suavizado interpola entre paradas.
- **Mallas y líneas**: núcleos con fresnel, cúpula translúcida, maqueta del recinto y conexiones.
- **Elementos vivos**: ruta luminosa, asistentes que caminan, tótems que pulsan, paquetes de datos que el candado filtra y etiquetas HTML proyectadas sobre el 3D.
- **Rendimiento**: menos partículas en equipos modestos, control de FPS que baja la resolución, pausa en segundo plano y versión estática si no hay WebGL o con `prefers-reduced-motion`.

### Motor de la app (`src/lib/engine/knetApp.js`)

Está organizado por secciones con comentarios. Las principales:

| Sección | Qué contiene |
|---|---|
| Nav, Toasts, 4 Experiences, Simulator, Team | Interactividad de la landing |
| KNET APP · SPA | Estado (`localStorage`), perfil, encabezados y pestañas |
| Exp 01 · Perfil + grafo | Grafo de conocimiento y filtros |
| Exp 02 · Quests | Misiones, niveles, experiencias presenciales |
| Exp 03 · Concierge | Asistente y perfil de match |
| Exp 04 · Dossier | Resumen, PDF propio |
| 05 · Próximos eventos | Mapa de Colombia, afinidad, eventos exclusivos por nivel |
| RECINTO 3D | WebGL + WebXR, rutas, modos de recorrido |
| 06 · Mi red | Grafo, credencial QR dinámica, escáner, matches, cafés y chat |
| Cuenta y sync | Entrada con cuenta o sin ella, LinkedIn real, cola `outbox`, XP híbrida, tiempo real |
| Tour guiado | Recorrido paso a paso por las 8 secciones |
| LEGAL | Documentos, consentimientos, re-aceptación y almacenamiento |

---

## Personalización rápida

| Quiero… | Archivo |
|---|---|
| Cambiar fotos, LinkedIn o GitHub del equipo | `src/data/team.js` (fotos en `src/assets/team/`) |
| Agregar o actualizar eventos reales | `src/data/events.js` (`EVENTS`, `EV_DAYS`, `EV_INFO`; marca `real: true` y añade `org` y `url` de la fuente) |
| Poner el enlace del video del proyecto | `src/data/config.js` → `VIDEO_URL` |
| Cambiar colores o tipografías | `src/styles/main/01-foundation.css` (variables `--bg`, `--accent`…) y `tailwind.config.js` |
| Traducir un texto nuevo al inglés | `src/lib/i18n/dictionary.js` (`EXACT` para frases, `PATS` para frases con `{0}`) |
| Cambiar los pasos del tour | `src/data/navigation.js` → `TOUR` |
| Ajustar niveles, XP o insignias | `src/data/gamification.js` |
| Agregar un ícono | `src/data/icons.js` (trazo SVG de 24×24) |

**Ejemplo: agregar un integrante**

```js
// src/data/team.js
import nuevaPhoto from "@/assets/team/nueva.webp";

export const TEAM = [
  // …
  { name: "Nombre Apellido", initials: "NA", handle: "@usuario-github", photo: nuevaPhoto,
    linkedin: "https://www.linkedin.com/in/usuario/", position: "Cargo", focus: "Área de trabajo" },
];
```

---

## Conexión con el backend

La app habla con [knet-backend](https://github.com/KNET-Team-Acc/knet-backend) a través de `src/services/api.js`. La URL sale de `VITE_API_URL`:

| `VITE_API_URL` | Comportamiento |
|---|---|
| Sin definir, en `npm run dev` | Usa `http://localhost:4000` (la API local por defecto). |
| Sin definir, en un build de producción | **Modo local**: sin cuentas, todo en el navegador. |
| Vacía (`VITE_API_URL=`) | Modo local siempre. |
| Una URL (`https://knet-backend.vercel.app`) | Cuentas reales y sincronización con esa API. Su origen debe estar en el `CORS_ORIGIN` del backend. |

**Para correr todo en local:**

```bash
# Terminal 1: el backend (ver su README)
cd knet-backend && docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev

# Terminal 2: el frontend, apuntando a esa API
cd knet-frontend && npm run dev          # o, si la API usa otro puerto:
# echo VITE_API_URL=http://localhost:4100 > .env.local && npm run dev
```

**Cómo se comporta:**

- **Sesión:** al entrar se elige crear una cuenta, iniciar sesión o «Continuar sin cuenta». La sesión (access + refresh token) vive en `localStorage["knet-auth"]` y se renueva sola; si caduca, la app lo avisa y sigue en local.
- **LinkedIn:** el botón «Continuar con LinkedIn» aparece solo si el backend responde `linkedin: true` en `/api/auth/providers` (es decir, si tiene `LINKEDIN_CLIENT_ID` y `LINKEDIN_CLIENT_SECRET`). Si no, se usa la importación simulada.
- **Sin conexión:** si la API no responde (red, timeout de 4 s o 503), la app sigue con lo local y encola las acciones en `A.outbox`; al volver la red se envían en orden. La XP es híbrida (`servidor + local`) y nunca cuenta dos veces lo mismo.
- **IA:** el Concierge, el Simulador y el Dossier prueban primero `/api/ai/*` (Claude); si falla o no hay cuenta, usan sus respuestas locales sin mostrar error.
- **Tiempo real:** con una cuenta sincronizada, la app escucha `GET /api/me/stream` (SSE) para recibir al instante solicitudes y aceptaciones de conexión, mensajes y cambios en los cafés.

Más detalle técnico en [`CLAUDE.md`](CLAUDE.md).

---

## Datos reales y datos de demostración

| Elemento | Tipo |
|---|---|
| DevFest Bogotá 2026, DevFest Medellín 2026, Andina Link Smart Cities Expo 2027 | **Reales**: cada tarjeta muestra su fuente («Ver fuente»). Verifica fechas con los organizadores antes de una presentación. |
| AI & Business Summit (evento principal del panel) | **Demostración**: no aparece en «Explorar»; alimenta la agenda, misiones, recinto y Dossier. |
| Eventos exclusivos por nivel, ponentes, personas, matches, misiones | **Ficticios**, creados para la demo (los retratos son ilustraciones). |
| Cuentas, Sign In with LinkedIn, IA (Claude), QR dinámico, NFC, cafés y chat | **Reales** con el backend. En modo local, LinkedIn, la IA y las respuestas de los contactos se simulan en el navegador. |
| Contactos del catálogo (matches) | **Ficticios**: sus respuestas en el chat las da el simulador. Con otros asistentes reales, los mensajes son de verdad. |
| Perfil, progreso y consentimientos | En **PostgreSQL** con una cuenta, y siempre también en el **`localStorage`** del navegador (para seguir sin conexión). |

---

## Privacidad, accesibilidad y rendimiento

- **Privacidad**: permisos de LinkedIn por campo (activos por defecto y revocables), aceptación explícita de términos y privacidad, registro trazable de consentimientos, aviso de almacenamiento y borrado de la cuenta en el servidor. A la IA solo llegan los datos que cubren los permisos activos.
- **Seguridad**: CSP estricta sin scripts inline ni `eval`, HSTS y demás cabeceras (ver [Despliegue](#despliegue)). La cámara solo se pide al abrir el escáner.
- **Accesibilidad**: estructura semántica, `aria-*` en pestañas y diálogos, navegación con teclado (también en el tour: flechas y `Esc`) y respeto a `prefers-reduced-motion`.
- **Rendimiento**: el 3D se pausa fuera de la landing y en pestañas ocultas, baja la resolución si el equipo va justo y usa menos partículas en móviles.

---

## Pruebas

- **E2E con API simulada** (`npm run e2e`, `e2e/*.spec.js`): la API se simula con `page.route` (`e2e/support/mock-api.js`) para probar sin backend los casos delicados: creación y edición del perfil, sesión y refresh del token, re-aceptación legal, **XP híbrida** (una misión hecha offline y confirmada online no suma dos veces), **cola offline** (`A.outbox` se reenvía en orden), **consentimientos** (`verifyChain()` válido y `rec.api` de pendiente a guardado), **«Revocar y borrar mis datos»** (online, offline con reintento y `403 demo_account`), **cafés y DMs** con usuarios reales y del catálogo (cola `coffee`/`dm`, XP del café sin duplicar), **QR dinámico y escáner** (cámara y `BarcodeDetector` simulados), **check-in NFC** (Web NFC simulado), cambio de idioma y cabeceras de seguridad.
- **E2E contra el backend real** (`npm run e2e:real`, `e2e/real/`): cuenta, perfil, misión, cadena de consentimientos del servidor y supresión de la cuenta.
- **CI** (`.github/workflows/ci.yml`, en cada PR y en `main`): `npm run lint`, `npm run build` y `npm run e2e`. La suite contra el backend real corre si el repositorio tiene el secreto `BACKEND_REPO_TOKEN` (lectura de `knet-backend`, que es privado); si no, se omite.

## Despliegue

**Producción actual:** https://knet-frontend.vercel.app (proyecto `knet-frontend` en Vercel), con `VITE_API_URL=https://knet-backend.vercel.app`. El repositorio está conectado a Vercel: cada push a `main` despliega producción y cada PR tiene su preview. A mano: `npx vercel deploy --prod`.

El build es estático (`dist/`). Para producción:

1. Define `VITE_API_URL` con la URL **https** pública de knet-backend en la plataforma (ver `.env.production`); ese origen debe estar en el `CORS_ORIGIN` del backend. Sin ella, el build funciona en modo local (sin cuentas).
2. Build `npm run build`, carpeta `dist`.

- **Vercel**: `vercel.json` ya trae el build, el fallback SPA (cualquier ruta interna sirve `index.html`), las cabeceras de seguridad y la caché de `/assets`.
- **Netlify / Cloudflare Pages**: `public/_redirects` (fallback SPA) y `public/_headers` (cabeceras) se copian a `dist`.
- **Cabeceras**: CSP estricta (`script-src 'self'`, `connect-src 'self' https:`, `frame-ancestors 'none'`…), HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y COOP. La fuente es `deploy/security-headers.js`, que también usa `vite preview` (así las pruebas E2E corren con la misma CSP). Si la cambias, actualiza `vercel.json` y `public/_headers`.
- **GitHub Pages**: agrega `base: "/<nombre-del-repo>/"` en `vite.config.js`; Pages no permite cabeceras propias.

---

## Hoja de ruta

- [x] Landing en componentes React por sección.
- [x] Datos separados de la lógica (`src/data`).
- [x] Motor 3D, traductor y motor de la app como módulos ES.
- [ ] Pasar cada pestaña del panel a componentes con estado (React context o Zustand), empezando por **Mi perfil** y **Misiones**.
- [ ] Mover el contenido de las 4 experiencias y del simulador de plantillas a JSX.
- [x] Backend real: cuentas (correo y LinkedIn OAuth), IA (Concierge, Simulador y Dossier con RAG ligero) y consentimientos en PostgreSQL.
- [x] Cafés 1:1 y chat directo sincronizados, QR dinámico con escáner real y check-in con Web NFC.
- [x] Consumir el tiempo real (SSE de `/api/me/stream`) en el panel.
- [x] Pruebas end-to-end (Playwright), CI y despliegue continuo en Vercel.
- [ ] Pruebas unitarias (Vitest).
- [ ] Guardar en el servidor el chat del Concierge, las notificaciones y las recompensas del avatar.

---

## Equipo

| | Integrante | Rol | Enlaces |
|---|---|---|---|
| <img src="src/assets/team/anderssonprogramming.webp" width="56"> | **Andersson David Sánchez Méndez** | Custom Software Engineering New Associate · Arquitectura de IA & Backend | [GitHub](https://github.com/AnderssonProgramming) · [LinkedIn](https://www.linkedin.com/in/anderssonsm/) |
| <img src="src/assets/team/killerzeus666.webp" width="56"> | **Katheryn Sofia Guasca Chavarro** | Infra Managed Service New Associate · Infraestructura, DevOps & Cloud | [GitHub](https://github.com/Killerzeus666) |
| <img src="src/assets/team/pbclaro96.webp" width="56"> | **Paola de Jesús Barros Claro** | Infra Managed Service New Associate · Frontend, Gamificación & Integración | [GitHub](https://github.com/pbclaro96) · [LinkedIn](https://www.linkedin.com/in/paola-de-jes%C3%BAs-barros/) |

---

## Créditos y licencias

- Tipografías: Archivo, Plus Jakarta Sans, Inter y JetBrains Mono (SIL Open Font License, vía Google Fonts).
- React y Vite (MIT), Tailwind CSS (MIT), `qrcode-generator` (MIT), `jsqr` (Apache-2.0), Playwright (Apache-2.0).
- Escenas 3D, recinto, generador de PDF, ilustraciones del avatar y del emblema: propios del equipo KNET.
- Código bajo licencia [MIT](LICENSE) © 2026 KNET Team.

<p align="center"><sub>© 2026 Equipo KNET · <a href="https://knet-frontend.vercel.app">knet-frontend.vercel.app</a></sub></p>
