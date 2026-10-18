// Entrada de la app: carga módulos, conecta eventos y sandbox de datos
import { economicData, formatMoney } from './modules/datos.js';
import { renderKPIs, setKpisCargando } from './modules/kpis.js';
import { renderTable } from './modules/tabla.js';
import { initChart, rebuildChart, setMode, toggleLogScale } from './modules/grafico.js';

// Conecta todos los event listeners de la página
function setupEventListeners() {
  // Search Input Event
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderTable(e.target.value);
  });

  // Log Scale Toggle Button
  const btnLogScale = document.getElementById('btnLogScale');
  btnLogScale.addEventListener('click', () => {
    const activado = toggleLogScale(); // null = no aplica en modo cobertura
    if (activado === null) return;

    btnLogScale.classList.toggle('bg-brand-blue', activado);
    btnLogScale.classList.toggle('text-white', activado);
    btnLogScale.classList.toggle('bg-slate-700/60', !activado);
  });

  // Mode Selector Buttons
  const btnModeValues = document.getElementById('btnModeValues');
  const btnModeCoverage = document.getElementById('btnModeCoverage');
  const chartTypeBadge = document.getElementById('chartTypeBadge');

  btnModeValues.addEventListener('click', () => {
    if (!setMode('values')) return;
    btnLogScale.style.display = 'flex';

    btnModeValues.className = 'px-3 py-1 rounded-md text-xs font-medium bg-brand-blue text-white shadow transition';
    btnModeCoverage.className = 'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
    chartTypeBadge.textContent = 'Valores Nominales';
  });

  btnModeCoverage.addEventListener('click', () => {
    if (!setMode('coverage')) return;
    btnLogScale.style.display = 'none';

    btnModeCoverage.className = 'px-3 py-1 rounded-md text-xs font-medium bg-brand-blue text-white shadow transition';
    btnModeValues.className = 'px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white transition';
    chartTypeBadge.textContent = 'Porcentaje de Cobertura';
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

// Inicializa la app cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderTable();
  initChart();
  setupEventListeners();
  // Carga datos reales del backend (serie histórica + años recientes del API oficial)
  EconomicData.refreshData();
  cargarVersion();
});

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

window.EconomicData = EconomicData;
window.EconomicData.formatMoney = formatMoney;
