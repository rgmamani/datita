import { economicData, formatMoney } from './datos.js';

// Estado privado del gráfico: instancia, escala y modo activo ('values' | 'coverage')
let chartInstance = null;
let isLogScale = false;
let currentMode = 'values';

// Datasets según el modo activo
function buildDataConfig() {
  const labels = economicData.map(d => d.year);
  const smvmValues = economicData.map(d => d.smvm);
  const cbtValues = economicData.map(d => d.cbt);
  const coverageValues = economicData.map(d => {
    if (d.cobertura !== undefined) return d.cobertura.toFixed(1);
    return ((d.smvm / d.cbt) * 100).toFixed(1);
  });
  const jubValues = economicData.map(d => (d.jubilacion !== undefined && d.jubilacion !== null) ? d.jubilacion : null);
  const coberturaJubValues = economicData.map(d => {
    if (d.jubilacion === undefined || d.jubilacion === null || !d.cbt) return null;
    return ((d.jubilacion / d.cbt) * 100).toFixed(1);
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
      },
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
      },
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
    ]
  };

  return currentMode === 'values' ? valuesDataConfig : coverageDataConfig;
}

// Crea la instancia del gráfico en #evolutionChart
export function initChart() {
  const ctx = document.getElementById('evolutionChart').getContext('2d');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: buildDataConfig(),
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

// Destruye y vuelve a crear el gráfico con los datos actuales (tras refreshData)
export function rebuildChart() {
  if (chartInstance) chartInstance.destroy();
  initChart();
}

// Alterna escala lineal/logarítmica (solo en modo valores). Devuelve el nuevo estado o null si no aplica
export function toggleLogScale() {
  if (currentMode !== 'values') return null;
  isLogScale = !isLogScale;
  chartInstance.options.scales.y.type = isLogScale ? 'logarithmic' : 'linear';
  chartInstance.update();
  return isLogScale;
}

// Cambia entre niveles 'values' y 'coverage'. Devuelve true si cambió de modo
export function setMode(mode) {
  if (mode === currentMode) return false;
  currentMode = mode;
  chartInstance.destroy();
  initChart();
  return true;
}
