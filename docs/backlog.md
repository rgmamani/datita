# Backlog

Estado de tareas pendientes del proyecto. Mantener actualizado en cada sesión.

## Pendiente (confirmado)

- [ ] **Pulido de UI: KPIs + UX** — estados de carga (skeleton loaders) en los KPIs mientras llegan los datos en vivo, transiciones suaves al re-renderizar tras `refreshData`.
- [ ] **Pruebas E2E** — usar el MCP `chrome-devtools` de OpenCode para verificar la app en vivo: gráfico, toggles (escala log / modo cobertura), búsqueda de tabla, KPIs y footer. Pendiente señalar que el MCP falló al arrancar en su primera sesión — si vuelve a fallar, revisar su config.
- [ ] **Decisión: Docker/Score** — verificar si `Dockerfile`, `docker-build.sh` y `score.yaml` siguen teniendo sentido (el deploy real es Vercel; no se usan). Confirmar con el usuario si se conservan o se eliminan.

## Ideas (pendiente de confirmación)

- [ ] **Contador de visitas + fecha del último dato** — soporte para mostrar "último dato publicado" y visitas diarias; dependiente de backend propio o Vercel Analytics.
- [ ] **Vercel Web Analytics** — el proyecto ya lo trae habilitado por Vercel por defecto (ver webAnalytics en settings); decidir si sumarlo a la UI del footer.

## Resueltos (referencia rápida)

- [x] Dashboard v2 con datos oficiales en vivo (v2.0.0) — ✅ desplega en Vercel: https://datita-app.vercel.app
- [x] Modularización del frontend en módulos ES (`public/javascripts/modules/`)
- [x] Corrección de author de commits para deploy de Vercel (git config local)
- [x] Limpieza de `docs/` (fuentes oficiales centralizadas en `docs/links-de-interes.md`)
