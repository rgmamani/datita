# Backlog

Estado de tareas pendientes del proyecto. Mantener actualizado en cada sesión.

## Pendiente (confirmado)

(nada — todo lo confirmado está resuelto)

## Ideas (con prioridad propuesta — 18/10/2026)

Criterio: inconsistencia visible hoy > valor para el visitante > costo de implementación. El orden es una sugerencia del asistente; el dueño puede mover cosas libremente.

- [ ] **[P7] PoC con LLM por indicador** (GitHub #5, #6, #7) — ideas exploratorias de la sesión semilla (marzo 2025) sin adopción desde entonces. Candidatas a cerrar/archivar si no hay ganas de explorar (costo alto, valor incierto).

## Resueltos (referencia rápida)

- [x] **Tooltips en controles del gráfico (21/10, PR #27)** — title nativo en Escala Logarítmica / Valores / Cobertura con explicación en lenguaje llano. Desktop-only (el hover no existe en touch; queda como semántica accesible).

- [x] **Orden por año en la tabla (21/10, PR #25)** — idea del dueño: click en el header "Año" alterna asc/desc (flecha indicadora, orden sobrevive a las búsquedas). Decisión de alcance: solo año (YAGNI — ordenar por valores nominales aporta poco; cobertura/otras columnas queda como posible iteración). Verificado con browser MCP en local y producción.

- [x] **Bug header mobile (19/10, PR #24)** — en ~360px el título "DATITA - Economía Argentina" se apilaba y quedaba recortado por arriba (captura del dueño en `docs/screenshot-mobile.jpeg`). Causa raíz: altura fija `h-16` del header con contenido envuelto de ~90px. Fix: `min-h-16 py-2.5 sm:h-16 sm:py-0` — el header crece en mobile y queda idéntico en desktop. Bug preexistente: la auditoría responsive del PR #18 no cubrió el header.

- [x] **[P5]/[P6] Fecha del último dato + Web Analytics (19/10, PR #22)** — decisión técnica: **contador de visitas público descartado** (las opciones gratuitas de Vercel Hobby son insuficientes: Edge Config solo 100 escrituras/mes, Blob exige token y 2.000 writes/mes, terceros suman dependencia). En su lugar: **Vercel Web Analytics** (50.000 eventos/mes gratis, métricas solo en el dashboard — no en la UI) + **"Último dato publicado"** en el footer, calculado desde `/api/datos-economicos` (campos `salarioMinimoFecha` / `fechaDatoCbt` / `fechaDatoJubilacion`, que ya existían — cero cambios de backend). Web Analytics habilitado y verificado en producción el mismo día (script `/_vercel/insights/script.js` → 200; requiere deploy posterior al click de "Enable"). v2.2.0.

- [x] **[P4] Protección de branch (19/10)** — repo pasado a público (protección gratis) + **ruleset** `Main protection` en `main`: PR obligatorio (0 aprobaciones), force-push y delete bloqueados, y bypass `User` para el dueño en modo `pull_request` (mergea sus propios PRs sin review; el push directo a `main` queda bloqueado hasta para admins). Nota: la branch protection clásica es incompatible con repo de un solo dev (bloquea el self-merge aunque las aprobaciones requeridas sean 0).

- [x] **Autoría en el footer (18/10, PR #19)** — "Visualización interactiva por Gabriel Mamani" con enlace a http://rgmamani.github.io/ en la primera línea del footer (estilo discreto, hover brand-blue).

- [x] **Responsive (18/10, PR #18)** — auditoría en 390 / 768 / 1440: la base ya era responsiva; se corrigió el KPI 5 en tablet (`sm:col-span-2` → filas 2+2+2) y las cards de periodos van 2×2 desde 640px (`sm:grid-cols-2`).

- [x] **Cards de periodos (18/10, PR #17)** — se agregó la card "2012 - 2017: Estadística y Sinceramiento" (amber) y la card de aceleración inflacionaria ahora llega "2018 - Presente", con narrativa del haber jubilatorio (inclusión previsional en 2003-2011 y el dato reciente de cobertura ~27% vs ~24%). Grid de 4 columnas.

- [x] **Jubilación en la UI (18/10, PR #15)** — haber mínimo ANSES en todo el dashboard (v2.1.0): datos curados 2000–2024 (`data/serie-historica.json` + fallback `datos.js`, script `scripts/generar-serie-jubilacion.mjs`), extensión en vivo 2025+ en `/api/serie-historica`, KPI 5 con skeleton/fade, 3ra línea/valor y línea punteada de cobertura en el gráfico, columna en la tabla. E2E en local y producción (27 registros, jubilación sep 2026 = $428.633) OK. Pulido post-review mergeado en **PR #16** (guard de `d.cbt` en cobertura jubilatoria + comentario de KPIs).

- [x] **Decisión Docker/Score (18/10)** — se eliminaron `Dockerfile`, `docker-build.sh`, `score.yaml` y `.dockerignore` + referencias en README, AGENTS.md y `.gitignore`. El deploy real es Vercel (push a main) y el local es `npm start`.

- [x] **Pruebas E2E con chrome-devtools en producción (18/10)** — valida en vivo: KPIs estado final (5/5 visibles, skeletons apagados), gráfico y toggles (escala log, modo cobertura con ocultado del toggle log), búsqueda de tabla (filtra y des-filtra con eventos input reales), footer. **Bug encontrado y corregido**: `setKpisCargando(false)` cancelaba el fade de los swaps en re-llamadas a `refreshData` (el dip de opacidad moría en el mismo tick); fix `0dd8fb3` con marcador `dataset.kpiSwap` — verificado el ciclo fade-out/fade-in completo por muestreo de opacidad. Único warning en consola: el conocido del Tailwind Play CDN. El diagnóstico del fallo de arranque del MCP sigue vigente en el historial de commits (`f53592f`).
- [x] Pulido de UI: KPIs + UX — skeleton loaders hasta llegar datos en vivo + fade en actualización (v2.0.0)
- [x] Dashboard v2 con datos oficiales en vivo (v2.0.0) — ✅ desplega en Vercel: https://datita-app.vercel.app
- [x] Modularización del frontend en módulos ES (`public/javascripts/modules/`)
- [x] Corrección de author de commits para deploy de Vercel (git config local)
- [x] Limpieza de `docs/` (fuentes oficiales centralizadas en `docs/links-de-interes.md`)
