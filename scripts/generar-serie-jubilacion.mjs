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
  const url = `${SERIES_API_URL}?ids=${ID_JUBILACION}&start_date=2000-01-01&limit=1000&metadata=none`;
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
