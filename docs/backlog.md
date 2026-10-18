# Backlog

Estado de tareas pendientes del proyecto. Mantener actualizado en cada sesión.

## Pendiente (confirmado)

(nada — todo lo confirmado está resuelto)

## Ideas (pendiente de confirmación)

- [ ] **Contador de visitas + fecha del último dato** — soporte para mostrar "último dato publicado" y visitas diarias; dependiente de backend propio o Vercel Analytics.
- [ ] **Vercel Web Analytics** — el proyecto ya lo trae habilitado por Vercel por defecto (ver webAnalytics en settings); decidir si sumarlo a la UI del footer.
- [ ] **Visualización del haber mínimo jubilatorio en la UI** — la serie ANSES (`58.1_MP_0_M_13` vía datos.gob.ar) ya se consume en `/api/datos-economicos` pero no se muestra en el dashboard.
- [ ] **PoC con LLM por indicador** (GitHub #5, #6, #7) — ideas exploratorias de la sesión semilla (marzo 2025); se mantienen abiertas como roadmap, ninguna iniciada.
- [ ] **Autoría en el footer** (propuesta del dueño, 18/10) — agregar en el footer un enlace a la página personal http://rgmamani.github.io/ ("¿quién es el autor?"); definir texto discreto y ubicación junto a la línea de versión.
- [ ] **Responsive de la página** (propuesta del dueño, 18/10) — revisar y ajustar el layout para mobile/tablet: KPIs, gráfico, tarjetas de periodos y tabla (scroll horizontal). Solapa parcialmente con el feature de jubilación (grid de 5).
- [ ] **Reglas de protección de branch/releases en GitHub** (GitHub #10, label `operation`) — pendiente de decisión del dueño del repo.

## Resueltos (referencia rápida)

- [x] **Decisión Docker/Score (18/10)** — se eliminaron `Dockerfile`, `docker-build.sh`, `score.yaml` y `.dockerignore` + referencias en README, AGENTS.md y `.gitignore`. El deploy real es Vercel (push a main) y el local es `npm start`.

- [x] **Pruebas E2E con chrome-devtools en producción (18/10)** — valida en vivo: KPIs estado final (5/5 visibles, skeletons apagados), gráfico y toggles (escala log, modo cobertura con ocultado del toggle log), búsqueda de tabla (filtra y des-filtra con eventos input reales), footer. **Bug encontrado y corregido**: `setKpisCargando(false)` cancelaba el fade de los swaps en re-llamadas a `refreshData` (el dip de opacidad moría en el mismo tick); fix `0dd8fb3` con marcador `dataset.kpiSwap` — verificado el ciclo fade-out/fade-in completo por muestreo de opacidad. Único warning en consola: el conocido del Tailwind Play CDN. El diagnóstico del fallo de arranque del MCP sigue vigente en el historial de commits (`f53592f`).
- [x] Pulido de UI: KPIs + UX — skeleton loaders hasta llegar datos en vivo + fade en actualización (v2.0.0)
- [x] Dashboard v2 con datos oficiales en vivo (v2.0.0) — ✅ desplega en Vercel: https://datita-app.vercel.app
- [x] Modularización del frontend en módulos ES (`public/javascripts/modules/`)
- [x] Corrección de author de commits para deploy de Vercel (git config local)
- [x] Limpieza de `docs/` (fuentes oficiales centralizadas en `docs/links-de-interes.md`)
