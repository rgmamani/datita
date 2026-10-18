# Jubilación en la UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar el haber mínimo jubilatorio (ANSES, serie `58.1_MP_0_M_13`) en el dashboard: 5to KPI, 3ra línea en gráfico Valores, línea punteada en Cobertura y columna en la tabla.

**Architecture:** El script one-off `scripts/generar-serie-jubilacion.mjs` cura los años 2000–2024 (valor de diciembre por año) pisando `data/serie-historica.json` y regenerando el fallback espejo `public/javascripts/modules/datos.js`. El endpoint `/api/serie-historica` extiende en vivo 2025+ consultando la serie de jubilación igual que SMVM/CBT. El frontend consume `item.jubilacion` en los 4 lugares con guard `!== undefined` ('—' si falta).

**Tech Stack:** Node >= 22 (fetch global), Express, frontend ES modules vanilla (sin bundler), Chart.js/Tailwind por CDN.

**Spec:** `docs/superpowers/specs/2026-10-18-jubilacion-ui-design.md`

## Global Constraints

- Trabajar en el branch `feat/jubilacion-ui` (ya creado desde `main`); Nunca pushear a `main` directo; PR con merge commit.
- Commits en español, prefijo convencional, atómicos estilo tren (cada tarea su commit).
- Elemento jubilación usa acento **emerald** (`#10b981` / `text-emerald-400`); SMVM=blue, CBT=rose, cobertura SMVM/CBT=amber (sin cambios).
- Criterio anual: valor de **diciembre** de cada año; decimales redondeados a 2 (`Math.round(v*100)/100`).
- No tocar valores históricos de SMVM/CBT/cobertura existentes.
- Verificación local: `npm start` (http://localhost:3000). Para matarlo en PowerShell: `Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`. NO matar procesos node globalmente.
- `/api/version`: al bump de versión actualizar AMBOS: `package.json` version y `FECHA_ACTUALIZACION_APP` en `routes/api.js:122`.
- La serie se consulta por ID **solo** (una serie por llamada a la API, ya lo hace `fetchSerieCompleta`).

**Interfaces compartidas (definidas por el spec, usadas en varias tareas):**

- Campo nuevo en cada registro de serie: `jubilacion: number` (pesos, hasta 2 decimales). En registros donde no lo generen (por ejemplo, error del fetch de jubilación), puede estar `undefined` → la UI muestra `—`.
- Colores Chart.js: valores `#10b981` sólido; cobertura jubilatoria `#10b981` con `borderDash: [6, 4]` y `fill: false`.
- ID de nodo KPI jubilatorio: `kpi-jub-ultimo` (clases `kpi-valor`, patrón idéntico a `kpi-cbt-ultimo`).

---

### Task 1: Script de curación + datos 2000–2024

Genera `scripts/generar-serie-jubilacion.mjs`, corralo, revisa la muestra y commitea JSON + datos.js + script.

**Files:**
- Create: `scripts/generar-serie-jubilacion.mjs`
- Modify (generado por el script): `data/serie-historica.json` (25 registros ganan `jubilacion`)
- Modify (generado por el script): `public/javascripts/modules/datos.js` (fallback espejo)

**Interfaces:**
- Consumes: API `58.1_MP_0_M_13` (mensual 2000-01 → hoy, verificado).
- Produces: `jubilacion: number` en todos los registros 2000–2024 del JSON y de `datos.js`. Orden de claves: `year, smvm, cbt, jubilacion, note`.

- [ ] **Step 1: Crear el script**

```js
// scripts/generar-serie-jubilacion.mjs
// One-off: agrega el haber mínimo jubilatorio (ANSES, serie 58.1_MP_0_M_13) a la
// base curada data/serie-historica.json y regenera el fallback espejo datos.js.
// Criterio: valor de DICIEMBRE de cada año (igual que SMVM/CBT en la base), round 2 dec.
import fs from 'node:fs';
import path from 'node:path';

const SERIES_API_URL = 'https://apis.datos.gob.ar/series/api/series/';
const ID_JUBILACION = '58.1_MP_0_M_13';
const JSON_PATH = path.join(process.cwd(), 'data', 'serie-historica.json');
const DATOS_JS_PATH = path.join(process.cwd(), 'public', 'javascripts', 'modules', 'datos.js');

async function fetchSerieDesde2000() {
  const hoy = new Date().toISOString().slice(0, 10);
  const url = `${SERIES_API_URL}?ids=${ID_JUBILACION}&start_date=2000-01-01&metadata=none`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} consultando la serie`);
  const json = await resp.json();
  // La API incluye meses futuros calendarizados: filtrar fecha <= hoy
  return (json.data || [])
    .filter(r => r[0] <= hoy && r[1] !== null && r[1] !== undefined)
    .map(r => ({ fecha: r[0], valor: r[1] }));
}

const rows = await fetchSerieDesde2000();
if (rows.length === 0) throw new Error('La serie vino vacía');

const jsonActual = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const anioBase = jsonActual[jsonActual.length - 1].year;

const valorDiciembrePorAnio = {};
for (const row of rows) {
  const anio = parseInt(row.fecha.slice(0, 4), 10);
  if (anio > anioBase) continue;
  if (!valorDiciembrePorAnio[anio] || row.fecha > valorDiciembrePorAnio[anio].fecha) {
    valorDiciembrePorAnio[anio] = { fecha: row.fecha, valor: row.valor };
  }
}
// De la estructura auxiliar a valores redondeados
const meses = Object.keys(valorDiciembrePorAnio);
const valorPorAnio = {};
for (const anio of meses) {
  valorPorAnio[anio] = Math.round(valorDiciembrePorAnio[anio].valor * 100) / 100;
}

const faltantes = jsonActual.filter(r => valorPorAnio[r.year] === undefined).map(r => r.year);
if (faltantes.length > 0) throw new Error(`La serie no cubre los años: ${faltantes.join(', ')}`);

const nueva = jsonActual.map(r => ({
  year: r.year,
  smvm: r.smvm,
  cbt: r.cbt,
  jubilacion: valorPorAnio[r.year],
  note: r.note
}));

// JSON con el formato del archivo: un registro por línea, claves con espacios
const jsonOut = `[\n${nueva.map(r =>
  `  { "year": ${r.year}, "smvm": ${r.smvm}, "cbt": ${r.cbt}, "jubilacion": ${r.jubilacion}, "note": ${JSON.stringify(r.note)} }`
).join(',\n')}\n]\n`;
fs.writeFileSync(JSON_PATH, jsonOut, 'utf8');

// Regenera el fallback espejo (mismos datos, sintaxis JS)
const jsOut = `// Fallback estático (2000 - 2024) con valores oficiales; en runtime se reemplaza por /api/serie-historica
export const economicData = [
${nueva.map(r =>
  `  { year: ${r.year}, smvm: ${r.smvm}, cbt: ${r.cbt}, jubilacion: ${r.jubilacion}, note: ${JSON.stringify(r.note)} }`
).join(',\n')}
];

// Formatea un valor como moneda ARS en es-AR
export const formatMoney = (val) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
};
`;
fs.writeFileSync(DATOS_JS_PATH, jsOut, 'utf8');

// Muestra de control: 2000, decada de transición, 2016 (mudanza de serie), 2013-2014 y el último
console.log(`OK: ${nueva.length} registros · jubilacion diciembre por año (2000-${anioBase})`);
for (const r of nueva) {
  if ([2000, 2013, 2016, 2019, anioBase].includes(r.year)) console.log(`${r.year}: ${r.jubilacion}`);
}
```

- [ ] **Step 2: Correr el script y verificar la muestra**

Run: `node scripts/generar-serie-jubilacion.mjs`
Expected (valores de la API del 18/10/2026, diciembre de cada año):
- `2000: 150`
- `2013: 2477`
- `2016: 5661.08`
- `2019: 14067.93`
- `2024: 259597.8`

Además abrir `data/serie-historica.json` y revisar que (a) SMVM/CBT de cada fila siguen idénticos (`git diff` debe mostrar solo inserción de `jubilacion` + reformateo mínimo), (b) no queden valores con más de 2 decimales.

- [ ] **Step 3: Commit**

```bash
git add scripts/generar-serie-jubilacion.mjs data/serie-historica.json public/javascripts/modules/datos.js
git commit -m "feat: curar haber minimo jubilatorio (ANSES) en la serie 2000-2024"
```

---

### Task 2: Endpoint extendido con jubilación 2025+

**Files:**
- Modify: `routes/api.js` (función `construirSerieExtendida`, ~líneas 156–212)

**Interfaces:**
- Consumes: `SERIES_IDS.jubilacion`, `fetchSerieCompleta(idSerie, start)` (existentes).
- Produces: para años 2025+ el objeto de fila incluye `jubilacion` (si el fetch de jubilación funcionó); `cobertura` sigue SMVM/CBT.

- [ ] **Step 1: Modificar `construirSerieExtendida`**

Cambiar el bloque del `Promise.all` e iteración así (reemplazo exacto dentro de la función existente; `ultimoPorAnio` queda igual):

```js
        // Jubilación se pide aparte: si falla, la serie se extiende igual (sin haber)
        const [smvmRows, cbtRows, jubRows] = await Promise.all([
            fetchSerieCompleta(SERIES_IDS.smvm, start),
            fetchSerieCompleta(SERIES_IDS.cbt, start),
            fetchSerieCompleta(SERIES_IDS.jubilacion, start).catch(() => null)
        ]);

        if (smvmRows.length === 0 || cbtRows.length === 0) return base;

        // Agrupar por año: último valor de cada serie en cada año
        const ultimoPorAnio = (rows) => {
            const mapa = {};
            for (const row of rows) {
                const anio = parseInt(row.fecha.slice(0, 4), 10);
                if (!mapa[anio] || row.fecha > mapa[anio].fecha) mapa[anio] = row;
            }
            return mapa;
        };
        const smvmPorAnio = ultimoPorAnio(smvmRows);
        const cbtPorAnio = ultimoPorAnio(cbtRows);
        const jubPorAnio = jubRows && jubRows.length > 0 ? ultimoPorAnio(jubRows) : {};
```

(Bloque intermedio `aniosNuevos` sin cambios.) Y el `for` de años nuevos:

```js
        for (const anio of aniosNuevos) {
            const smvm = smvmPorAnio[anio];
            const cbt = cbtPorAnio[anio] || null;
            if (!cbt) continue;

            const mesSmvm = MESES_ES[parseInt(smvm.fecha.slice(5, 7), 10) - 1];
            const mesCbt = MESES_ES[parseInt(cbt.fecha.slice(5, 7), 10) - 1];
            const valorCbt = Math.round(cbt.valor);
            const jub = jubPorAnio[anio] || null;

            const fila = {
                year: anio,
                smvm: Math.round(smvm.valor),
                cbt: valorCbt,
                note: `Datos oficiales en vivo: SMVM ${mesSmvm} ${anio}; CBT ${mesCbt} ${anio} (API datos.gob.ar).`,
                cobertura: parseFloat(((smvm.valor / valorCbt) * 100).toFixed(1))
            };
            if (jub) {
                fila.jubilacion = Math.round(jub.valor * 100) / 100;
                const mesJub = MESES_ES[parseInt(jub.fecha.slice(5, 7), 10) - 1];
                fila.note += ` Haber mín. jubilatorio ${mesJub} ${anio} (ANSES).`;
            }
            base.push(fila);
        }
```

- [ ] **Step 2: Verificar localmente**

Run (PowerShell, servidor en background):
```powershell
npm start
# en otra shell o después de esperar ~2s:
curl.exe -s http://localhost:3000/api/serie-historica | ConvertFrom-Json | Measure-Object | % Count
curl.exe -s http://localhost:3000/api/serie-historica | ConvertFrom-Json | Select-Object -Last 2 | % { "$($_.year) · smvm=$($_.smvm) · cbt=$($_.cbt) · jub=$($_.jubilacion) · cob=$($_.cobertura) · note=$($_.note)" }
```
Expected: 27 registros; últimas 2 filas (2025, 2026) con `jubilacion` no vacía (≈ 340879.59 y ≈ 428633.2) y nota con "Haber mín. jubilatorio". Luego:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

- [ ] **Step 3: Commit**

```bash
git add routes/api.js
git commit -m "feat: serie historica extendida agrega jubilacion en vivo desde 2025"
```

---

### Task 3: KPI 5 — Haber Mín. Jubilatorio

**Files:**
- Modify: `public/index.html` (línea 66: grid; nuevo bloque Stat 5 después del Stat 4, cierra en línea ~146)
- Modify: `public/javascripts/modules/kpis.js` (renderKPIs: nuevo bloque; actualizar comentario)

**Interfaces:**
- Consumes: `item.jubilacion`, `formatMoney` (trunca decimales), `escribirConFade`.
- Produces: nodo `#kpi-jub-ultimo` con clase `kpi-valor` — se arrastra con el sistema existente de skeletons/fade (`setKpisCargando`, `dataset.kpiSwap`) sin cambios extra.

- [ ] **Step 1: Markup** — cambiar el grid y agregar la 5ta card:

En `public/index.html` línea 66:

```html
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
```

Después de la card del Stat 4 (cobertura, cierra en `</div>` línea 145) y antes del `</div>` que cierra el grid, insertar:

```html
            <!-- Stat 5 -->
            <div
                class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
                <div
                    class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Haber Mín. Jubilatorio</span>
                    <i class="fa-solid fa-person-cane text-emerald-400"></i>
                </div>
                <div class="relative">
                    <div class="kpi-valor text-2xl font-bold text-emerald-400 transition-opacity duration-300 opacity-0"
                        id="kpi-jub-ultimo">$-</div>
                    <div class="kpi-skeleton absolute inset-0 animate-pulse transition-opacity duration-300">
                        <div class="h-7 w-32 rounded bg-slate-700/50"></div>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <span class="text-emerald-400 font-medium">ANSES</span> · haber mínimo garantizado
                </p>
            </div>
```

- [ ] **Step 2: `renderKPIs`** — actualizar su comentario de cabecera a "Renderiza los KPIs del panel superior (4 valores + año) con el primer y último registro de la serie" y agregar al final del body:

```js
  // KPI 5 - Haber mínimo jubilatorio
  const kpiJubUltimo = document.getElementById('kpi-jub-ultimo');
  if (kpiJubUltimo) {
    escribirConFade(kpiJubUltimo, ultimo.jubilacion !== undefined && ultimo.jubilacion !== null ? formatMoney(ultimo.jubilacion) : '—');
  }
```

- [ ] **Step 3: Verificar localmente** — `npm start` y con la pestaña en el browser local imprimir los 5 KPIs y 27 filas (consola del browser remota o headless con `--dump-dom`). Verificación mínima determinista:

```powershell
npm start
# esperar ~2 s, luego con Chrome headless:
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --dump-dom http://localhost:3000 | Select-String -Pattern "kpi-jub-ultimo|fa-person-cane" 
```
Nota: `--dump-dom` puede llegar antes del fetch (los KPIs cargan async). Aceptable: entre a la pestaña con el browser integrado (chrome-devtools MCP) y verifique los 5 valores y 27 filas de tabla. Al terminar, matar el server con el patrón de puerto del Global Constraints.

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/javascripts/modules/kpis.js
git commit -m "feat: KPI Haber Minimo Jubilatorio con skeleton y fade"
```

---

### Task 4: Gráfico — 3ra línea (valores) y línea punteada (cobertura)

**Files:**
- Modify: `public/javascripts/modules/grafico.js` (`buildDataConfig`, ~líneas 9–64)
- Modify: `public/index.html` (leyenda del gráfico, ~líneas 193–199)

**Interfaces:**
- Consumes: `d.jubilacion` (number or undefined), `d.cbt`.
- Produces: datasets con labels 'Haber Mínimo Jubilatorio (ANSES)' (values) y 'Haber Mín. (ANSES) / CBT' (coverage).

- [ ] **Step 1: extraer valores en `buildDataConfig`** (al lado de `coverageValues`):

```js
  const jubValues = economicData.map(d => (d.jubilacion !== undefined && d.jubilacion !== null) ? d.jubilacion : null);
  const coberturaJubValues = economicData.map(d => {
    if (d.jubilacion === undefined || d.jubilacion === null) return null;
    return ((d.jubilacion / d.cbt) * 100).toFixed(1);
  });
```

- [ ] **Step 2: dataset nuevo en `valuesDataConfig`** (después del dataset CBT, antes de `]` de datasets):

```js
      {
        label: 'Haber Mínimo Jubilatorio (ANSES)',
        data: jubValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6
      }
```

- [ ] **Step 3: dataset nuevo en `coverageDataConfig`** (después del dataset existente):

```js
      {
        label: 'Haber Mín. (ANSES) / CBT',
        data: coberturaJubValues,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6
      }
```

El tooltip del modo cobertura ya muestra `%` (mismo callback: `context.parsed.y + '%'`) — sin cambios.

- [ ] **Step 4: leyenda estática en el HTML** — después del chip de CBT (~línea 197), agregar:

```html
                    <span class="flex items-center gap-1.5"><span
                            class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Haber mín. (ANSES)</span>
```

- [ ] **Step 5: verificar** — modo Valores muestran 3 líneas; modo Cobertura muestra la SMVM/CBT amber sólida y la jub emerald punteada; sin errores de consola: `npm start` + browser (chrome-devtools MCP), con click en los botones `btnModeValues`/`btnModeCoverage`.

- [ ] **Step 6: Commit**

```bash
git add public/javascripts/modules/grafico.js public/index.html
git commit -m "feat: grafico con jubilacion en modo Valores y Cobertura"
```

---

### Task 5: Tabla — columna Haber mín.

**Files:**
- Modify: `public/index.html` (thead, ~líneas 269–275)
- Modify: `public/javascripts/modules/tabla.js` (innerHTML del row)

**Interfaces:**
- Consumes: `item.jubilacion`, `formatMoney`.
- Produces: nada; columna entre CBT y %.

- [ ] **Step 1: header** — entre "Canasta Básica Total (CBT)" y "% Cobertura SMVM/CBT":

```html
                            <th class="py-3 px-4">Haber Mín. (ANSES)</th>
```

- [ ] **Step 2: row en `tabla.js`** — entre el `<td>` de CBT y el del badge:

```js
      <td class="py-3 px-4 text-emerald-400 font-medium">${item.jubilacion !== undefined && item.jubilacion !== null ? formatMoney(item.jubilacion) : '—'}</td>
```

- [ ] **Step 3: verificar** — filtro por año muestra 27 filas con haber; búsqueda "Convertibilidad" (filtra) y limpiar (des-filtra). En mobile la tabla sigue con scroll horizontal. Commit:

```bash
git add public/index.html public/javascripts/modules/tabla.js
git commit -m "feat: tabla historica agrega columna de haberes"
```

---

### Task 6: Bump versión v2.1.0, verificación E2E y PR

**Files:**
- Modify: `package.json` (version 2.0.0 → 2.1.0)
- Modify: `routes/api.js:122` (`FECHA_ACTUALIZACION_APP` — sigue `18/10/2026`, ya lo está; solo confirmar)

**Interfaces:**
- Consumes: todas las piezas de las tareas 1–5.
- Produces: `/api/version` con `v2.1.0`; PR abierto con preview URL de Vercel.

- [ ] **Step 1: bump de versión** — `package.json`: `"version": "2.1.0"` (era 2.0.0). Confirmar `FECHA_ACTUALIZACION_APP = '18/10/2026'` en `routes/api.js` (misma fecha que hoy — no cambiar).

- [ ] **Step 2: E2E local completo** — `npm start` + browser integrado (chrome-devtools MCP):
  1. Los 5 KPIs se pueblan tras el fade (4 valores numéricos + cobertura) y `#kpi-jub-ultimo` ≈ `$ 428.633`.
  2. Toggles log/cobertura funcionan; cobertura muestras 2 líneas (amber sólida + emerald punteada).
  3. Tabla 27 filas; búsqueda filtra/des-filtra.
  4. Sin errores de consola (el warning "unread tailwind" es conocido y OK).

Luego los smoke checks de siempre:
```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/
curl.exe -s http://localhost:3000/api/version
curl.exe -s http://localhost:3000/api/serie-historica | ConvertFrom-Json | % Count
curl.exe -s http://localhost:3000/api/datos-economicos | Select-Object -First 1
```
Expected: `200`; `{"version":"2.1.0",...}`; `27`; JSON con `jubilacionValor` no nulo.
Matar el server (patrón de puerto del Global Constraints) antes de pushear.

- [ ] **Step 3: commit y push del branch + PR**

```bash
git add package.json routes/api.js
git commit -m "chore: bump 2.1.0 por feature de haberes en la UI"
git push -u origin feat/jubilacion-ui
gh pr create --base main --head feat/jubilacion-ui --title "feat: jubilacion en la UI (KPI, grafico y tabla)" --body "..."
```

Body mínimo del PR: link al spec (`docs/superpowers/specs/2026-10-18-jubilacion-ui-design.md`), resumen de los 5 cambios (datos curados, endpoint extendido, KPI, gráfico, tabla), cómo chequear (Vercel preview deployment que se crea con el push del branch).

- [ ] **Step 4: avisar al usuario** — pasarle el link del PR y la URL del preview de Vercel (ver con `npx vercel ls` o la consola de Vercel) para el review. No mergear: el dueño lo hace.
