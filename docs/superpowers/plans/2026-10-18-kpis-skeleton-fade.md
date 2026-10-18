# Skeleton loaders + fade in en KPIs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar skeleton loaders en los 4 KPIs hasta que lleguen los datos en vivo del API y revelar/actualizar sus valores con fade in.

**Architecture:** Skeletons estáticos en `public/index.html` (hermanos absolutos del valor, `animate-pulse`) gobernados por clases desde `kpis.js` (`setKpisCargando`). El fade es 100% CSS (`transition-opacity duration-300`). `app.js` cambia a estado "listo" cuando `refreshData` termina, incluido el caso de error. Spec: `docs/superpowers/specs/2026-10-18-kpis-skeleton-fade-design.md`.

**Tech Stack:** Express (sin build step), frontend vanilla con módulos ES nativos, Tailwind via CDN (Play CDN genera clases on the fly, las utilidades usadas son core).

## Global Constraints

- No build step, no bundler: módulos ES nativos con `type="module"`.
- No modificar `tailwind.config.js` ni el tailwind config inline del HTML: solo se usan utilidades core (`animate-pulse`, `opacity-*`, `transition-opacity`, `duration-300`).
- Todo el contenido visible en español; commits en español con prefijo convencional, atómicos estilo tren.
- Node >= 22. Dev local: `npm start` → http://localhost:3000.
- No matar todos los node.exe: si hace falta reiniciar el server, matar solo el PID que escucha en el puerto 3000:
  `Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
- El proyecto no tiene suite de tests: la verificación es con endpoints + Chrome headless (`--dump-dom`).
- Alcance fijo: solo el panel de KPIs. No tocar tabla ni gráfico (más allá de no romper su wiring).

---

### Task 1: HTML — contenedores valor + skeleton en las 4 tarjetas KPI

**Files:**
- Modify: `public/index.html` (grid de KPIs, líneas ~66-117)

**Interfaces:**
- Consumes: nada (markup estático).
- Produces: elementos con clases `kpi-valor` (4 valores + el año `kpi-smvm-ultimo-year`) y `kpi-skeleton` (5 skeletons). Los ids `kpi-smvm-inicial`, `kpi-smvm-ultimo`, `kpi-smvm-ultimo-year`, `kpi-cbt-ultimo`, `kpi-cobertura-ultimo` deben conservarse (los usa `kpis.js`).

- [ ] **Step 1: Reemplazar las 4 tarjetas del grid de KPIs**

En `public/index.html` reemplazar el bloque completo del grid (desde
`<!-- Top Stats / Key Highlights -->` hasta el cierre del `</div>` del grid, antes de
`<!-- Main Interactive Chart Card -->`) por:

```html
<!-- Top Stats / Key Highlights -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Stat 1 -->
    <div
        class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div
            class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>SMVM Inicial (2000)</span>
            <i class="fa-solid fa-dollar-sign text-blue-400"></i>
        </div>
        <div class="relative">
            <div class="kpi-valor text-2xl font-bold text-white transition-opacity duration-300 opacity-0"
                id="kpi-smvm-inicial">$200 <span class="text-xs text-slate-400 font-normal">ARS</span></div>
            <div class="kpi-skeleton absolute inset-0 animate-pulse">
                <div class="h-7 w-28 rounded bg-slate-700/50"></div>
            </div>
        </div>
        <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span class="text-emerald-400 font-medium">1 a 1</span> durante la convertibilidad
        </p>
    </div>

    <!-- Stat 2 -->
    <div
        class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div
            class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>SMVM Último Año</span>
            <i class="fa-solid fa-wallet text-emerald-400"></i>
        </div>
        <div class="relative">
            <div class="kpi-valor text-2xl font-bold text-white transition-opacity duration-300 opacity-0"
                id="kpi-smvm-ultimo">$-</div>
            <div class="kpi-skeleton absolute inset-0 animate-pulse">
                <div class="h-7 w-32 rounded bg-slate-700/50"></div>
            </div>
        </div>
        <div class="relative mt-2">
            <p class="kpi-valor text-xs text-slate-400 opacity-0 transition-opacity duration-300"
                id="kpi-smvm-ultimo-year">-</p>
            <div class="kpi-skeleton absolute inset-0 animate-pulse">
                <div class="h-3 w-16 rounded bg-slate-700/50"></div>
            </div>
        </div>
    </div>

    <!-- Stat 3 -->
    <div
        class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div
            class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>CBT Último Año</span>
            <i class="fa-solid fa-basket-shopping text-rose-400"></i>
        </div>
        <div class="relative">
            <div class="kpi-valor text-2xl font-bold text-white transition-opacity duration-300 opacity-0"
                id="kpi-cbt-ultimo">$-</div>
            <div class="kpi-skeleton absolute inset-0 animate-pulse">
                <div class="h-7 w-32 rounded bg-slate-700/50"></div>
            </div>
        </div>
        <p class="text-xs text-slate-400 mt-2">Canasta Básica Total (Línea Pobreza)</p>
    </div>

    <!-- Stat 4 -->
    <div
        class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all">
        <div
            class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Cobertura Colectiva</span>
            <i class="fa-solid fa-scale-unbalanced text-amber-400"></i>
        </div>
        <div class="relative">
            <div class="kpi-valor text-2xl font-bold text-amber-400 transition-opacity duration-300 opacity-0"
                id="kpi-cobertura-ultimo">-</div>
            <div class="kpi-skeleton absolute inset-0 animate-pulse">
                <div class="h-7 w-24 rounded bg-slate-700/50"></div>
            </div>
        </div>
        <p class="text-xs text-slate-400 mt-2">% de CBT cubierta con 1 SMVM en último año</p>
    </div>
</div>
```

Notas clave:
- Los valores empiezan con `opacity-0` y el skeleton con `animate-pulse`: estado inicial = cargando (coincide con el estado inicial del módulo en Task 2).
- El `mt-2` del año se movió al wrapper `relative` para no desalinear el skeleton.

- [ ] **Step 2: Verificar el markup**

```powershell
Select-String -Path public/index.html -Pattern "kpi-valor|kpi-skeleton"
```
Expected: 5 coincidencias de `kpi-valor` y 5 de `kpi-skeleton`; los 5 ids originales intactos:
```powershell
Select-String -Path public/index.html -Pattern "kpi-smvm-inicial|kpi-smvm-ultimo\"|kpi-smvm-ultimo-year|kpi-cbt-ultimo|kpi-cobertura-ultimo"
```

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: markup de skeletons para los KPIs"
```

---

### Task 2: kpis.js — setKpisCargando + escritura con fade

**Files:**
- Modify: `public/javascripts/modules/kpis.js` (archivo completo, 38 líneas hoy)

**Interfaces:**
- Consumes: `economicData`, `formatMoney` de `./datos.js` (sin cambios).
- Produces: `setKpisCargando(cargando: boolean) → void` (la usará `app.js` en Task 3). `renderKPIs()` conserva su firma y ahora escribe cada valor con `escribirConFade`.

- [ ] **Step 1: Reemplazar el contenido de kpis.js**

```js
import { economicData, formatMoney } from './datos.js';

// Estado de carga de los KPIs: true = skeletons visibles y valores ocultos.
// El HTML inicial ya llega en estado de carga (valores con opacity-0, skeletons con animate-pulse).
let cargando = true;

// Escribe html en el elemento. Si el valor está oculto (cargando) solo escribe: lo revela
// el fade de setKpisCargando(false). Si está visible, escribe con fade y solo si cambió.
function escribirConFade(el, html) {
  if (el.classList.contains('opacity-0')) {
    el.innerHTML = html;
    return;
  }
  if (el.innerHTML === html) return;
  el.classList.add('opacity-0');
  setTimeout(() => {
    el.innerHTML = html;
    el.classList.remove('opacity-0');
  }, 150);
}

// Muestra u oculta los skeletons de los KPIs. El fade lo hace el CSS
// (transition-opacity duration-300 en cada elemento).
export function setKpisCargando(estado) {
  cargando = estado;
  document.querySelectorAll('.kpi-valor').forEach(el => {
    el.classList.toggle('opacity-100', !estado);
    el.classList.toggle('opacity-0', estado);
  });
  document.querySelectorAll('.kpi-skeleton').forEach(el => {
    el.classList.toggle('opacity-100', estado);
    el.classList.toggle('opacity-0', !estado);
    el.classList.toggle('animate-pulse', estado);
  });
}

// Renderiza los 4 KPIs del panel superior con el primer y último registro de la serie
export function renderKPIs() {
  if (economicData.length === 0) return;

  const inicial = economicData.find(d => d.year === 2000) || economicData[0];
  const ultimo = economicData[economicData.length - 1];
  const coberturaUltimo = ultimo.cobertura !== undefined ? ultimo.cobertura : parseFloat(((ultimo.smvm / ultimo.cbt) * 100).toFixed(1));

  // KPI 1 - SMVM Inicial (mantener año 2000 o fallback)
  const kpiSmvmInicial = document.getElementById('kpi-smvm-inicial');
  if (kpiSmvmInicial) {
    escribirConFade(kpiSmvmInicial, `${formatMoney(inicial.smvm)} <span class="text-xs text-slate-400 font-normal">ARS</span>`);
  }

  // KPI 2 - SMVM Último
  const kpiSmvmUltimo = document.getElementById('kpi-smvm-ultimo');
  if (kpiSmvmUltimo) {
    escribirConFade(kpiSmvmUltimo, formatMoney(ultimo.smvm));
  }
  const kpiSmvmUltimoYear = document.getElementById('kpi-smvm-ultimo-year');
  if (kpiSmvmUltimoYear) {
    escribirConFade(kpiSmvmUltimoYear, `Año ${ultimo.year}`);
  }

  // KPI 3 - CBT Último
  const kpiCbtUltimo = document.getElementById('kpi-cbt-ultimo');
  if (kpiCbtUltimo) {
    escribirConFade(kpiCbtUltimo, formatMoney(ultimo.cbt));
  }

  // KPI 4 - Cobertura Último
  const kpiCoberturaUltimo = document.getElementById('kpi-cobertura-ultimo');
  if (kpiCoberturaUltimo) {
    escribirConFade(kpiCoberturaUltimo, `${coberturaUltimo.toFixed(1).replace('.', ',')}%`);
  }
}
```

- [ ] **Step 2: Verificar sintaxis del módulo**

```powershell
node --check public/javascripts/modules/kpis.js
```
Nota: `node --check` valida sintaxis de script con import/export. Si fallara por ESM, validar con:
```powershell
node --input-type=module --eval "import('./public/javascripts/modules/kpis.js').catch(e => { if (e.code === 'ERR_MODULE_NOT_FOUND') { console.log('syntax ok, falta browser env'); process.exit(0); } throw e; })"
```
Expected: `syntax ok, falta browser env` (los imports de DOM fallan fuera del browser; solo interesa que no haya SyntaxError) o salida limpia con `node --check`.

- [ ] **Step 3: Commit**

```bash
git add public/javascripts/modules/kpis.js
git commit -m "feat: setKpisCargando y escritura con fade en renderKPIs"
```

---

### Task 3: app.js — wiring del estado de carga en refreshData + verificación end-to-end

**Files:**
- Modify: `public/javascripts/app.js` (líneas 3 y 75-94)
- Modify: `docs/backlog.md`

**Interfaces:**
- Consumes: `setKpisCargando(cargando: boolean)` de `./modules/kpis.js` (Task 2).
- Produces: `window.EconomicData.refreshData()` con misma firma y semántica (nada cambia para el mundo exterior).

- [ ] **Step 1: Actualizar el import**

Línea 3 de `public/javascripts/app.js`, reemplazar:

```js
import { renderKPIs } from './modules/kpis.js';
```

por:

```js
import { renderKPIs, setKpisCargando } from './modules/kpis.js';
```

- [ ] **Step 2: Actualizar refreshData**

Reemplazar el objeto `EconomicData` (filas ~75-94) por:

```js
// Export for potential API data integration
const EconomicData = {
  economicData,
  refreshData: async function() {
    try {
      const response = await fetch('/api/serie-historica');
      const data = await response.json();
      if (data && data.length > 0) {
        // Update economicData with fresh data from API
        economicData.length = 0;
        economicData.push(...data);
        // Re-render
        renderKPIs();
        renderTable();
        rebuildChart();
        // Revelar los valores en vivo con fade
        setKpisCargando(false);
      } else {
        // Sin datos: revelar el fallback
        setKpisCargando(false);
      }
    } catch (error) {
      console.error('Error refreshing data from API:', error);
      // Error: revelar el fallback de datos.js
      setKpisCargando(false);
    }
  }
};
```

- [ ] **Step 3: Levantar el dev server (en background)**

```powershell
npm start
```
Ejecutarlo como comando en background. Expected: `./bin/www` arranca → http://localhost:3000.

- [ ] **Step 4: Verificar endpoints**

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/
curl.exe -s http://localhost:3000/api/version
(curl.exe -s http://localhost:3000/api/serie-historica | ConvertFrom-Json).Count
```
Expected: `200` para `/`; JSON con `version` y `fechaActualizacion`; `27` registros en la serie.

- [ ] **Step 5: Verificar DOM con Chrome headless**

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --dump-dom --virtual-time-budget=10000 http://localhost:3000 > "$env:TEMP\datita-dom.html"
Select-String -Path "$env:TEMP\datita-dom.html" -Pattern "kpi-skeleton" -AllMatches | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "$env:TEMP\datita-dom.html" -Pattern "kpi-valor[^`"]*opacity-100" -AllMatches | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "$env:TEMP\datita-dom.html" -Pattern "<tr" -AllMatches | Measure-Object | Select-Object -ExpandProperty Count
```
Si la ruta de Chrome difiere, ubicar con: `Get-Command chrome` o
`(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe').'(default)'`.

Expected:
- 5 nodos `kpi-skeleton` en el DOM (markup intacto).
- Los 5 nodos `kpi-valor` (4 valores + año) terminan con `opacity-100` tras el fetch (estado listo).
- 27 o más coincidencias de `<tr` (27 filas de tabla + posibles headers).

Nota: chocar una condición aquí sugiere revisar la consola del browser
(`--enable-logging --v=1`) antes de "corregir a ciegas".

- [ ] **Step 6: Verificación visual manual (opcional pero recomendada)**

Abrir http://localhost:3000 en el browser: al recargar se ve el pulso de los skeletons
~1s y luego el fade de los valores. En DevTools (Network → Offline + recargar) el estado
cae al fallback con fade y no hay KPI vacío.

- [ ] **Step 7: Detener el dev server**

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
Expected: sin salida; el puerto 3000 queda libre.

- [ ] **Step 8: Actualizar el backlog y commitear**

Editar `docs/backlog.md`: mover la tarea **Pulido de UI: KPIs + UX** de "Pendiente" a
"Resueltos" con nota corta del resultado, y dejar el commit:

```bash
git add public/javascripts/app.js docs/backlog.md
git commit -m "feat: estado listo tras refreshData con fade en KPIs + backlog"
```

---

## Self-review checklist (ejecutado al escribir el plan)

1. **Spec coverage:** HTML skeletons (Task 1) ✓ · `setKpisCargando` + fade (Task 2) ✓ ·
   estado listo en success/error/sin datos (Task 3) ✓ · fadeSwap para re-actualizaciones
   (`escribirConFade`, Task 2) ✓ · fallback nunca vacío (Task 3, branches else/catch) ✓ ·
   verificación endpoints + dump-dom (Task 3, Steps 4-6) ✓.
2. **Placeholders:** ninguno; todos los pasos tienen código o comando exactos.
3. **Consistencia de tipos:** `setKpisCargando(estado:boolean)` importado en Task 3 con el
   mismo nombre exportado en Task 2; clases `kpi-valor`/`kpi-skeleton` idénticas en
   Task 1 y Task 2; ids de KPI intactos en Tasks 1 y 2.
