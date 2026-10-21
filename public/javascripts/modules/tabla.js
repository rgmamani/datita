import { economicData, formatMoney } from './datos.js';

// Orden de la tabla por año (true = ascendente 2000→2026). Sobrevive a las búsquedas.
let ordenAscendente = true;

// Renderiza la tabla histórica con filtro opcional por año o nota
export function renderTable(filterText = '') {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  const filteredData = economicData
    .filter(item =>
      item.year.toString().includes(filterText) ||
      item.note.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => (ordenAscendente ? a.year - b.year : b.year - a.year));

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
      <td class="py-3 px-4 text-emerald-400 font-medium">${item.jubilacion !== undefined && item.jubilacion !== null ? formatMoney(item.jubilacion) : '—'}</td>
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

// Invierte el orden por año, actualiza el indicador y re-renderiza con el filtro vigente
export function toggleOrdenAnio() {
  ordenAscendente = !ordenAscendente;

  const icono = document.getElementById('iconoOrdenAnio');
  if (icono) {
    icono.classList.toggle('fa-arrow-up', ordenAscendente);
    icono.classList.toggle('fa-arrow-down', !ordenAscendente);
  }

  // Re-renderiza respetando la búsqueda activa
  const filtro = document.getElementById('searchInput')?.value ?? '';
  renderTable(filtro);
}
