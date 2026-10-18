# Backlog

Estado de tareas pendientes del proyecto. Mantener actualizado en cada sesión.

## Pendiente (confirmado)

- [ ] **Pruebas E2E** — usar el MCP `chrome-devtools` de OpenCode para verificar la app en vivo: gráfico, toggles (escala log / modo cobertura), búsqueda de tabla, KPIs y footer. Nota: en la sesión del 18/10 falló el arranque. **Causa raíz confirmada**: comandos tipo `Get-Process -Name node | Stop-Process -Force` (usados para reiniciar `bin/www` en el puerto 3000) matan TODOS los node.exe, incluido el servidor MCP (que corre bajo npx/node) → OpenCode reporta `exited with code 255`. Verificado: el servidor conecta bien por sí solo (32 tools, chrome-devtools-mcp 1.11.0). Para reiniciar el dev server matar solo el que escucha en el puerto: `Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`. Tras un kill, el MCP reconecta solo en la próxima conexión; si no, `opencode service restart`.
- [ ] **Decisión: Docker/Score** — verificar si `Dockerfile`, `docker-build.sh` y `score.yaml` siguen teniendo sentido (el deploy real es Vercel; no se usan). Confirmar con el usuario si se conservan o se eliminan.

## Ideas (pendiente de confirmación)

- [ ] **Contador de visitas + fecha del último dato** — soporte para mostrar "último dato publicado" y visitas diarias; dependiente de backend propio o Vercel Analytics.
- [ ] **Vercel Web Analytics** — el proyecto ya lo trae habilitado por Vercel por defecto (ver webAnalytics en settings); decidir si sumarlo a la UI del footer.

## Resueltos (referencia rápida)

- [x] Pulido de UI: KPIs — skeleton loaders hasta llegar datos en vivo + fade en actualización (v2.0.0)
- [x] Dashboard v2 con datos oficiales en vivo (v2.0.0) — ✅ desplega en Vercel: https://datita-app.vercel.app
- [x] Modularización del frontend en módulos ES (`public/javascripts/modules/`)
- [x] Corrección de author de commits para deploy de Vercel (git config local)
- [x] Limpieza de `docs/` (fuentes oficiales centralizadas en `docs/links-de-interes.md`)
