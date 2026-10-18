# AGENTS.md — Datita

Dashboard de indicadores económicos argentinos (SMVM vs CBT/CBA, haberes jubilatorios). Express + frontend vanilla sin build step, desplegado en Vercel. Responder y commitear en español.

## Comandos

```bash
npm start                          # node ./bin/www → http://localhost:3000
npx vercel --prod --yes            # deploy manual a producción (repo ya vinculado a Vercel)
```

- No existen scripts de test, lint ni typecheck. Verificar cambios pidiendo a los endpoints: `/` (200), `/api/version`, `/api/serie-historica` (27 registros), `/api/datos-economicos`.
- Requiere Node >= 22 (se usa `fetch` global). PowerShell en dev local: no hay binarios Unix.

## Arquitectura (no obvia por los nombres)

- **Doble entrada**: `bin/www` corre el server local; `api/index.js` es la entrada serverless de Vercel y solo exporta la app Express de `app.js` (raíz).
- **`public/` + rewrites**: en Vercel los archivos de `public/` se sirven estáticos y ganan sobre los rewrites de `vercel.json`; todo lo demás va a la función `/api`. No cambiar este patrón sin entender el orden filesystem → rewrite.
- El warning de build *"Internal rewrites in backend framework projects now route requests..."* es conocido y los endpoints funcionan — no "corregirlo" a ciegas.
- `routes/index.js` (router `/`) es código muerto en local: `express.static` atiende `/` antes que el router. Existe como fallback `sendFile`.
- **Frontend**: una sola página (`public/index.html`) con módulos ES nativos (sin bundler, todo por **CDN**): la entrada es `public/javascripts/app.js` (wiring DOM, eventos, `window.EconomicData`) que importa desde `public/javascripts/modules/` (`datos.js` = serie fallback + formatMoney, `kpis.js`, `tabla.js`, `grafico.js`). El `tailwind.config` inline en el HTML debe espejar `tailwind.config.js` — cambiar ambos. Módulos nuevos = `type="module"`; verificar con browser headless (`--dump-dom`) que se renderizan las 27 filas.
- `docs/links-de-interes.md` es la lista de fuentes oficiales del proyecto (API de series, catalogo sspm, páginas de difusión). `docs/backlog.md` mantiene las tareas pendientes de cada sesión — mantenerlo al día.

## Datos (API oficial datos.gob.ar)

- Fuente: `https://apis.datos.gob.ar/series/api/series/` (IDs de series en `SERIES_IDS`, en `routes/api.js`).
- **Consultar cada serie por separado** con `start_date`: las queries combinadas de varios IDs son poco fiables.
- La API devuelve meses futuros calendarizados: **filtrar `fecha <= hoy`** (ya lo hace `fetchSerieCompleta`).
- Caché TTL de 1 hora con node-cache; al probar cambios de datos no verás valores frescos — reiniciar o esperar. En serverless el caché es por instancia (se reinicia más seguido).
- `data/serie-historica.json` es la base curada 2000–2024; el endpoint extendido agrega los años recientes con valores en vivo de la API. Valores históricos corregidos a mano: tocar con cuidado (ej. SMVM 2013 = 3300).
- `/api/version` lee `package.json` al cargar el módulo + constante hardcoded `FECHA_ACTUALIZACION_APP` en `routes/api.js`: al bump de versión, actualizar **ambos**.

## Deploy Vercel

- Repo vinculado a GitHub (`rgmamani/datita`): **cada push a `main` despliega automático** a https://datita-app.vercel.app (proyecto `datita-app`, team `rgmamanis-projects`). La configuración de deploy vive en `vercel.json`.
- ⚠️ **Autor de commits**: Vercel bloquea deploys (`COMMIT_AUTHOR_REQUIRED`) si el email del commit no está asociado a la cuenta de GitHub del repo. Este repo usa `git config --local user.email rgmamani@gmail.com`; la config global (Globant) NO sirve acá. Los deploys pueden quedar en estado BLOCKED silenciosamente: chequear con `vercel ls` o `list_deployments`.
- Sitio 100% público (deployment protection desactivada); la app no tiene secretos ni variables de entorno — mantenerlo así.

## Convenciones

- Commits en español con prefijo convencional (`feat|fix|chore|refactor|docs`), atómicos estilo tren (cada cambio su commit).
- Todo el contenido visible (UI, notes, footer) está en español con formato de moneda `es-AR`.
