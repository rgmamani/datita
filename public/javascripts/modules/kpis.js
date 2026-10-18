import { economicData, formatMoney } from './datos.js';

// El HTML inicial ya llega en estado de carga (valores con opacity-0, skeletons con animate-pulse).

// Timer pendiente por elemento: un swap no puede ser pisado por el fade anterior
const timersFades = new WeakMap();

// Escribe html en el elemento. Si el valor está oculto (cargando) solo escribe: lo revela
// el fade de setKpisCargando(false). Si está visible, escribe con fade y solo si cambió.
function escribirConFade(el, html) {
  clearTimeout(timersFades.get(el));
  timersFades.delete(el);
  if (el.classList.contains('opacity-0')) {
    el.innerHTML = html;
    return;
  }
  if (el.innerHTML === html) return;
  el.classList.add('opacity-0');
  el.classList.remove('opacity-100');
  timersFades.set(el, setTimeout(() => {
    el.innerHTML = html;
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
    timersFades.delete(el);
  }, 150));
}

// Muestra u oculta los skeletons de los KPIs. El fade lo hace el CSS
// (transition-opacity duration-300 en cada elemento).
export function setKpisCargando(estado) {
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

// Renderiza los 5 elementos KPI del panel superior (4 valores + año) con el primer y último registro de la serie
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
