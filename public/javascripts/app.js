// Fallback estático (2000 - 2024) con valores oficiales; al cargar se reemplaza por /api/serie-historica
const economicData = [
  { year: 2000, smvm: 200, cbt: 477, note: 'Ley de Convertibilidad ($1 USD = $1 ARS).' },
  { year: 2001, smvm: 200, cbt: 463, note: 'Fin del régimen de convertibilidad.' },
  { year: 2002, smvm: 200, cbt: 716, note: 'Devaluación y salida del 1 a 1.' },
  { year: 2003, smvm: 300, cbt: 710, note: 'Recomposición salarial inicial.' },
  { year: 2004, smvm: 450, cbt: 737, note: 'Normalización del Consejo del Salario.' },
  { year: 2005, smvm: 630, cbt: 823, note: 'Recuperación del salario real.' },
  { year: 2006, smvm: 800, cbt: 883, note: 'Crecimiento económico continuo. Último dato oficial de línea de pobreza pre-2007.' },
  { year: 2007, smvm: 980, cbt: 958, note: 'Inicio de discrepancias en índices oficiales.' },
  { year: 2008, smvm: 1240, cbt: 1015, note: 'Impacto de la crisis financiera global.' },
  { year: 2009, smvm: 1440, cbt: 1060, note: 'Desaceleración y ajustes salariales.' },
  { year: 2010, smvm: 1740, cbt: 1220, note: 'Recomposición en paritarias.' },
  { year: 2011, smvm: 2300, cbt: 1400, note: 'Inicio de restricciones cambiarias.' },
  { year: 2012, smvm: 2670, cbt: 1610, note: 'Aumento gradual de precios.' },
  { year: 2013, smvm: 3300, cbt: 1780, note: 'Cierre de ciclo de mediciones preliminares (SMVM oficial).' },
  { year: 2014, smvm: 4400, cbt: 2400, note: 'Devaluación de enero de 2014.' },
  { year: 2015, smvm: 5588, cbt: 3200, note: 'Fin de etapa previo a normalización del INDEC.' },
  { year: 2016, smvm: 7560, cbt: 13155, note: 'Sinceramiento metodológico de la CBT (INDEC).' },
  { year: 2017, smvm: 8860, cbt: 16677, note: 'Ajustes periódicos del SMVM.' },
  { year: 2018, smvm: 11300, cbt: 25493, note: 'Salto inflacionario y devaluación.' },
  { year: 2019, smvm: 16875, cbt: 38960, note: 'Deterioro del poder de compra.' },
  { year: 2020, smvm: 20587, cbt: 54208, note: 'Pandemia COVID-19 y controles de precios.' },
  { year: 2021, smvm: 32000, cbt: 76146, note: 'Aceleración del ritmo inflacionario.' },
  { year: 2022, smvm: 61953, cbt: 152515, note: 'Inflación anual alcanza casi el 95%.' },
  { year: 2023, smvm: 156000, cbt: 495798, note: 'Alta inflación (211.4% anual).' },
  { year: 2024, smvm: 279718, cbt: 1012300, note: 'Corrección de precios e inflación acumulada.' }
];

// Format Currency Helper
const formatMoney = (val) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
};

// State variables
let chartInstance = null;
let isLogScale = false;
let currentMode = 'values'; // 'values' | 'coverage'

function renderTable(filterText = '') {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  const filteredData = economicData.filter(item => 
    item.year.toString().includes(filterText) ||
    item.note.toLowerCase().includes(filterText.toLowerCase())
  );

  filteredData.forEach(item => {
    const coverage = ((item.smvm / item.cbt) * 100).toFixed(1);
    let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (coverage < 50) badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    else if (coverage < 80) badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-800/60 transition-colors';
    row.innerHTML = `
      <td class="py-3 px-4 font-bold text-white">${item.year}</td>
      <td class="py-3 px-4 text-blue-400 font-medium">${formatMoney(item.smvm)}</td>
      <td class="py-3 px-4 text-rose-400 font-medium">${formatMoney(item.cbt)}</td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}">
          ${coverage}%
        </span>
      </td>
      <td class="py-3 px-4 text-slate-400">${item.note}</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderKPIs() {
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

function initChart() {
  const ctx = document.getElementById('evolutionChart').getContext('2d');
  
  const labels = economicData.map(d => d.year);
  const smvmValues = economicData.map(d => d.smvm);
  const cbtValues = economicData.map(d => d.cbt);
  const coverageValues = economicData.map(d => {
    if (d.cobertura !== undefined) return d.cobertura.toFixed(1);
    return ((d.smvm / d.cbt) * 100).toFixed(1);
  });

  const valuesDataConfig = {
    labels: labels,
    datasets: [
      {
        label: 'Salario Mínimo (SMVM)',
        data: smvmValues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Canasta Básica Total (CBT)',
        data: cbtValues,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const coverageDataConfig = {
    labels: labels,
    datasets: [
      {
        label: 'Porcentaje de Cobertura (SMVM / CBT)',
        data: coverageValues,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: currentMode === 'values' ? valuesDataConfig : coverageDataConfig,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 12, weight: '500' },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                if (currentMode === 'values') {
                  label += formatMoney(context.parsed.y);
                } else {
                  label += context.parsed.y + '%';
                }
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
        },
        y: {
          type: (currentMode === 'values' && isLogScale) ? 'logarithmic' : 'linear',
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11 },
            callback: function(value) {
              if (currentMode === 'coverage') return value + '%';
              if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
              return '$' + value;
            }
          }
        }
      }
    }
  });
}

function setupEventListeners() {
  // Search Input Event
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderTable(e.target.value);
  });

  // Log Scale Toggle Button
  const btnLogScale = document.getElementById('btnLogScale');
  btnLogScale.addEventListener('click', () => {
    if (currentMode !== 'values') return; // Only applicable in values mode
    isLogScale = !isLogScale;

    btnLogScale.classList.toggle('bg-brand-blue', isLogScale);
    btnLogScale.classList.toggle('text-white', isLogScale);
    btnLogScale.classList.toggle('bg-slate-700/60', !isLogScale);

    chartInstance.options.scales.y.type = isLogScale ? 'logarithmic' : 'linear';
    chartInstance.update();
  });

  // Mode Selector Buttons
  const btnModeValues = document.getElementById('btnModeValues');
  const btnModeCoverage = document.getElementById('btnModeCoverage');
  const chartTypeBadge = document.getElementById('chartTypeBadge');

  btnModeValues.addEventListener('click', () => {
    if (currentMode === 'values') return;
    currentMode = 'values';
    btnLogScale.style.display = 'flex';

    btnModeValues.className = 'px-3 py-1 rounded-md text-xs font-medium bg-brand-blue text-white shadow transition';
    btnModeCoverage.className = 'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
    chartTypeBadge.textContent = 'Valores Nominales';

    chartInstance.destroy();
    initChart();
  });

  btnModeCoverage.addEventListener('click', () => {
    if (currentMode === 'coverage') return;
    currentMode = 'coverage';
    btnLogScale.style.display = 'none';

    btnModeCoverage.className = 'px-3 py-1 rounded-md text-xs font-medium bg-brand-blue text-white shadow transition';
    btnModeValues.className = 'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
    chartTypeBadge.textContent = 'Porcentaje de Cobertura';

    chartInstance.destroy();
    initChart();
  });
}

// Carga la versión de la app desde el backend y la muestra en el footer
async function cargarVersion() {
  try {
    const response = await fetch('/api/version');
    const info = await response.json();
    const el = document.getElementById('footer-version');
    if (el && info && info.version) {
      el.innerHTML = `<span class="font-semibold text-slate-500">v${info.version}</span> &bull; Actualizado: ${info.fechaActualizacion}`;
    }
  } catch (error) {
    console.error('Error cargando versión:', error);
  }
}

// Initialize App on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderTable();
  initChart();
  setupEventListeners();
  // Carga datos reales del backend (serie histórica + años recientes del API oficial)
  window.EconomicData.refreshData();
  cargarVersion();
});

// Export for potential API data integration
window.EconomicData = {
  economicData,
  formatMoney,
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
        chartInstance.destroy();
        initChart();
      }
    } catch (error) {
      console.error('Error refreshing data from API:', error);
    }
  }
};