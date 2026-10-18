# Spec — Jubilación en la UI (KPI + gráfico + tabla + cobertura)

Fecha: 18/10/2026 · Feature branch: `feat/jubilacion-ui` · Basado en brainstorming (info de este archivo).

## Objetivo

Mostrar el tercer indicador fundacional del proyecto — el haber mínimo jubilatorio (ANSES) — en el dashboard: KPI, línea en el gráfico de valores, segunda línea de cobertura y columna en la tabla histórica.

## Decisiones (respuestas del usuario)

1. **Alcance**: full — KPI nuevo + 3ra línea en gráfico Valores + columna en tabla + 2da línea en modo Cobertura.
2. **Fuente de datos**: curar `data/serie-historica.json` con la API completa (valor de diciembre por año, 2000–2024) vía script one-off; el endpoint extendido agrega jubilación en vivo para 2025+, igual que SMVM/CBT.
3. **Layout KPI**: grid de 5 columnas (`lg:grid-cols-5`), 5 tarjetas en una fila en desktop.

## Datos (verificados con la API el 18/10/2026)

- Serie `58.1_MP_0_M_13` cubre mensual 2000-01 → 2026-09 ($150 → $428.633,2). Completo, sin huecos.
- Artefactos con decimales largos (ej. 11528,0365558853 en 2019-07; 43352,586288 en 2022-09): al curar redondear a 2 decimales.
- Criterio anual: valor de **diciembre** de cada año (igual que SMVM/CBT en la base curada).
- `/api/datos-economicos`: sin cambios (ya entrega el último haber para el KPI).

## Alcance

### Backend
- `scripts/generar-serie-jubilacion.mjs` (one-off, git-committed para reproducibilidad): fetch mensual desde 2000, valor de diciembre por año, round 2 dec., pisa los campos `jubilacion` en `data/serie-historica.json` y en el fallback estático `public/javascripts/modules/datos.js`.
- `/api/serie-historica`: para años > 2024 consulta también la serie de jubilación (cada serie por separado con `start_date`, en paralelo) y agrega valor de diciembre del año. `cobertura` sigue siendo SMVM/CBT (sin cambios).

### Frontend
- **KPI (5ta tarjeta)**: label "Haber mín. jubilatorio" · valor `formatMoney` · subtexto "ANSES · <mes año>". Acento **emerald**. Skeleton + fade reutilizando `setKpisCargando` / `escribirConFade` ( markup estático + clases, sin JS de animación nuevo).
- **Gráfico**: Valores → 3ra línea "Haber mín. (ANSES)" emerald; Cobertura → 2da línea "Haber/CBT %" emerald tenue.
- **Tabla**: columna "Haber mín." (texto emerald) entre CBT y `%`, 6 columnas.

## Fuera de alcance

- Cobertura jubilatoria como KPI separado (queda como idea de backlog).
- Serie FAJ/AUH, modal de notas por año.
- Cambios a `/api/datos-economicos` ni al fix de fade (`dataset.kpiSwap` ya es genérico por nodo).

## Riesgos / invariantes

- El fallback `datos.js` debe quedar espejo del JSON (mismo formato por registro) — si `/api/serie-historica` falla, la UI muestra haber de todos modos.
- Los valores históricos curados no se tocan a mano salvo artefacto visible; SMVM/CBT quedan igual que hoy.
- Semántica anual de fuente ANSES-documentada en la nota si hiciera falta (no SN: la nota por año es de contexto general, no se reescribe).
- previous ruling aplicado: `refreshData` con respuesta vacía/error tras éxito previo muestra datos stale (sin fallback agressivo).
