// Fallback estático (2000 - 2024) con valores oficiales; en runtime se reemplaza por /api/serie-historica
export const economicData = [
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

// Formatea un valor como moneda ARS en es-AR
export const formatMoney = (val) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
};
