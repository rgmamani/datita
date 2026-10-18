import { economicData, formatMoney } from './datos.js';

// Renderiza los 4 KPIs del panel superior con el primer y último registro de la serie
export function renderKPIs() {
  if (economicData.length === 0) return;

  const inicial = economicData.find(d => d.year === 2000) || economicData[0];
  const ultimo = economicData[economicData.length - 1];
  const coberturaUltimo = ultimo.cobertura !== undefined ? ultimo.cobertura : parseFloat(((ultimo.smvm / ultimo.cbt) * 100).toFixed(1));

  // KPI 1 - SMVM Inicial (mantener año 2000 o fallback)
  const kpiSmvmInicial = document.getElementById('kpi-smvm-inicial');
  if (kpiSmvmInicial) {
    kpiSmvmInicial.innerHTML = `${formatMoney(inicial.smvm)} <span class="text-xs text-slate-400 font-normal">ARS</span>`;
  }

  // KPI 2 - SMVM Último
  const kpiSmvmUltimo = document.getElementById('kpi-smvm-ultimo');
  if (kpiSmvmUltimo) {
    kpiSmvmUltimo.textContent = formatMoney(ultimo.smvm);
  }
  const kpiSmvmUltimoYear = document.getElementById('kpi-smvm-ultimo-year');
  if (kpiSmvmUltimoYear) {
    kpiSmvmUltimoYear.textContent = `Año ${ultimo.year}`;
  }

  // KPI 3 - CBT Último
  const kpiCbtUltimo = document.getElementById('kpi-cbt-ultimo');
  if (kpiCbtUltimo) {
    kpiCbtUltimo.textContent = formatMoney(ultimo.cbt);
  }

  // KPI 4 - Cobertura Último
  const kpiCoberturaUltimo = document.getElementById('kpi-cobertura-ultimo');
  if (kpiCoberturaUltimo) {
    kpiCoberturaUltimo.textContent = `${coberturaUltimo.toFixed(1).replace('.', ',')}%`;
  }
}
