# Spec: Skeleton loaders + fade in en KPIs

**Fecha:** 2026-10-18
**Estado:** Aprobado (enfoque A)
**Alcance:** Solo el panel de 4 KPIs. Tabla y gráfico quedan sin cambios.

## Problema

Los KPIs renderizan al instante con datos fallback (`datos.js`) y, cuando `refreshData()`
trae la serie en vivo de `/api/serie-historica`, los valores se intercambian sin transición.
No hay percepción de estado de carga ni de actualización.

## Objetivo

1. Al cargar la página, los 4 KPIs muestran **skeleton loaders** (bloques pulsantes)
   hasta que llegan los datos en vivo del API.
2. Cuando los datos llegan (o cambian en re-llamadas de `refreshData`), los valores
   se revelan/actualizan con un **fade in suave** (~300 ms).
3. Si el API falla, el fade revela los datos fallback: nunca un KPI vacío.

## Enfoque elegido

Skeletons estáticos en HTML + toggle de clases. Sin CSS custom, sin nodos creados por
JS: solo utilidades de Tailwind CDN ya disponibles.

## Diseño

### HTML (`public/index.html`)

Cada elemento de valor de KPI pasa de:

```html
<div class="text-2xl font-bold text-white" id="kpi-smvm-ultimo">$-</div>
```

a un contenedor relativo con dos hijos: el valor real (opacidad 0 inicial) y un skeleton
hermano posicionado absoluto que coincide con el contenido que reemplaza:

```html
<div class="relative">
  <div class="kpi-valor text-2xl font-bold text-white transition-opacity duration-300 opacity-0"
       id="kpi-smvm-ultimo">$-</div>
  <div class="kpi-skeleton absolute inset-0 flex flex-col justify-center gap-1 animate-pulse"
       data-kpi-skeleton="kpi-smvm-ultimo">
    <div class="h-7 w-28 rounded bg-slate-700/50"></div>
  </div>
</div>
```

Elementos afectados (4 tarjetas del grid de KPIs):

| id valor             | skeleton correspondiente                                  |
|----------------------|-----------------------------------------------------------|
| `kpi-smvm-inicial`   | bloque `h-7` (valor + span ARS)                            |
| `kpi-smvm-ultimo`    | bloque `h-7` + línea `h-3` (año, es primario del valor)    |
| `kpi-cbt-ultimo`     | bloque `h-7`                                               |
| `kpi-cobertura-ultimo` | bloque `h-7` en ámbar/neutral                            |

El year (`kpi-smvm-ultimo-year`) es texto secundario: se incluye dentro del skeleton del
KPI 2 y tiene su propia transición de opacidad.

### JS

**`public/javascripts/modules/kpis.js`** — nueva función exportada:

```js
export function setKpisCargando(cargando) {
  // Para cada pareja valor/skeleton:
  //   cargando=true  → valor.classList 'opacity-0'   | skeleton visible + animate-pulse
  //   cargando=false → valor 'opacity-100' (fade)    | skeleton 'opacity-0'
}
```

- Los skeletons se muestran/ocultan solo por clases (`opacity`), sin tocar `innerHTML`.
- `renderKPIs()` se mantiene: llena los valores como hoy (con fallback o datos en vivo).

**`public/javascripts/app.js`** — flujo en `DOMContentLoaded`:

1. `renderKPIs()` (con fallback) + `renderTable()` + `initChart()` + listeners como hoy.
2. Los KPIs quedan en estado "cargando" (los valores con datos fallback están en el DOM
   pero invisibles).
3. `EconomicData.refreshData()`:
   - On success: muta `economicData`, `renderKPIs()`, `renderTable()`, `rebuildChart()`
     (tabla y gráfico como hoy), y al terminar `setKpisCargando(false)` → fade in de los
     valores en vivo (o del fallback si no hubieran datos).
   - On error: `console.error` (como hoy) + `setKpisCargando(false)` → fade del fallback.
4. Para re-llamadas posteriores de `refreshData` con datos ya visibles, el contenido del
   valor se actualiza y la transición de opacidad sigue aplicando: si el texto cambia, el
   navegador no re-dispara el fade (mismo estado de clase); para asegurar el efecto se usa
   un helper `fadeSwap(el, texto)`: togglear `opacity-0` brevemente antes de escribir el
   nuevo valor. Si el texto es igual, se deja sin animar (evita parpadeos al repetirse).

### Fallback de datos inicial

`datos.js` conserva su serie fallback tal cual está. El HTML inicial de los KPIs se puede
quedar con los valores quemados (`$200`, `$-`, `-`): ya que están `opacity-0` mientras
carga, no se ven; `renderKPIs()` los reemplaza con datos reales.

## Error handling

- Fetch falla → estado "listo" seguro: skeleton fuera, fallback visible.
- API sin registros (`data.length === 0`) → mismo camino que el error (ready + fallback).

## Pruebas

No hay suite de tests en el proyecto. Verificación manual:

1. `npm start` (o `npx vercel dev`) y confirmar endpoints: `/` (200), `/api/version`,
   `/api/serie-historica` (27 registros).
2. Headless browser (`--dump-dom`): los 4 skeletons presentes en DOM, tabla con 27 filas,
   `kpi-*` con valores y sin `opacity-0` tras cargar.
3. Visual: skeleton pulsando al recargar, fade al llegar datos, fallback con fade si se
   fuerza un error de fetch (offline o URL inválida).
4. El chequeo E2E completo con chrome-devtools queda como tarea separada del backlog.
