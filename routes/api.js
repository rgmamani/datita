var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var NodeCache = require('node-cache');

// Caché con TTL 1 hora (3600 segundos)
var cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Serie histórica SMVM vs CBT (2000-2024)
// Cargada desde archivo JSON separado
const serieHistoricaPath = path.join(__dirname, '../data/serie-historica.json');
let serieHistorica = [];
try {
  const data = fs.readFileSync(serieHistoricaPath, 'utf8');
  serieHistorica = JSON.parse(data);
} catch (error) {
  console.error('Error cargando serie histórica:', error.message);
  serieHistorica = [];
}

// ===== Datos actuales desde la API oficial de datos.gob.ar =====
// Catálogo: https://infra.datos.gob.ar/catalog/sspm/ (Subsecretaría de Programación Macroeconómica)
const SERIES_API_URL = 'https://apis.datos.gob.ar/series/api/series/';

const SERIES_IDS = {
    smvm: '57.1_SMVMM_0_M_34',        // Salario Mínimo, Vital y Móvil mensual (Secretaría de Trabajo)
    cba: '150.1_LA_INDICIA_0_D_16',   // Línea de indigencia / CBA familia tipo (INDEC)
    cbt: '150.1_LA_POBREZA_0_D_13',   // Línea de pobreza / CBT familia tipo (INDEC)
    jubilacion: '58.1_MP_0_M_13'      // Haber mínimo jubilatorio mensual (ANSES)
};

function formatoAR(valor) {
    return valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ARS';
}

// Devuelve el último valor publicado de una serie: { valor, fecha } | null
async function fetchUltimoValor(idSerie) {
    const haceDosAnios = new Date();
    haceDosAnios.setUTCFullYear(haceDosAnios.getUTCFullYear() - 2);
    const start = haceDosAnios.toISOString().slice(0, 10);

    const rows = await fetchSerieCompleta(idSerie, start);
    if (rows.length === 0) return null;
    return rows[rows.length - 1];
}

// Función para obtener los datos económicos actuales desde fuentes oficiales
async function obtenerDatosEconomicos() {
    try {
        const resultados = await Promise.allSettled([
            fetchUltimoValor(SERIES_IDS.smvm),
            fetchUltimoValor(SERIES_IDS.cba),
            fetchUltimoValor(SERIES_IDS.cbt),
            fetchUltimoValor(SERIES_IDS.jubilacion)
        ]);
        const [smvm, cba, cbt, jub] = resultados.map(
            r => (r.status === 'fulfilled' ? r.value : null)
        );

        // Necesitamos al menos SMVM o CBT para devolver datos útiles
        if (!smvm && !cbt) return null;

        return {
            salarioMinimo: smvm ? formatoAR(smvm.valor) : null,
            salarioMinimoValor: smvm ? smvm.valor : null,
            salarioMinimoFecha: smvm ? smvm.fecha : null,
            canastaBasica: {
                canastaAlimentaria: cba ? formatoAR(cba.valor) : null,
                canastaTotal: cbt ? formatoAR(cbt.valor) : null,
                canastaTotalValor: cbt ? cbt.valor : null
            },
            jubilacion: jub ? formatoAR(jub.valor) : null,
            jubilacionValor: jub ? jub.valor : null,
            fuente: 'apis.datos.gob.ar (INDEC / ANSES / Secretaría de Trabajo)',
            fechaActualizacion: new Date().toISOString(),
            fechaDatoCbt: cbt ? cbt.fecha : null,
            fechaDatoJubilacion: jub ? jub.fecha : null
        };
    } catch (error) {
        console.error("Error al obtener datos oficiales:", error.message);
        return null;
    }
}

// Endpoint para servir los datos actuales al frontend
router.get("/datos-economicos", async (req, res) => {
    const cacheKey = 'datos-economicos';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }

    let datos = await obtenerDatosEconomicos();
    if (!datos) {
        // Intentar obtener del último elemento de serie histórica como fallback
        if (serieHistorica.length > 0) {
            const ultimo = serieHistorica[serieHistorica.length - 1];
            datos = {
                salarioMinimo: ultimo.smvm.toLocaleString('es-AR') + ' ARS',
                canastaBasica: {
                    canastaAlimentaria: (ultimo.cbt * 0.438).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ARS',
                    canastaTotal: ultimo.cbt.toLocaleString('es-AR') + ' ARS'
                },
                jubilacion: '259.598,76 ARS',
                fechaActualizacion: new Date().toISOString(),
                fuente: 'fallback-historico'
            };
        }
    }

    if (datos) {
        cache.set(cacheKey, datos);
        res.json(datos);
    } else {
        res.status(500).json({ error: "No se pudieron obtener los datos" });
    }
});

// Información de versión de la app (leída de package.json)
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const FECHA_ACTUALIZACION_APP = '18/10/2026';

router.get('/version', (req, res) => {
    res.json({
        version: packageJson.version,
        nombre: packageJson.name,
        fechaActualizacion: FECHA_ACTUALIZACION_APP
    });
});

// ===== Serie histórica extendida con datos reales de la API =====
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Devuelve todos los datos de una serie: [{ fecha, valor }]
async function fetchSerieCompleta(idSerie, start) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const url = `${SERIES_API_URL}?ids=${idSerie}&start_date=${start}&metadata=none`;
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} consultando ${idSerie}`);
        }
        const json = await resp.json();
        const hoy = new Date().toISOString().slice(0, 10);
        // Solo valores publicados (fecha <= hoy); la API incluye meses futuros calendarizados
        return (json.data || [])
            .filter(r => r[0] <= hoy && r[1] !== null && r[1] !== undefined)
            .map(r => ({ fecha: r[0], valor: r[1] }));
    } finally {
        clearTimeout(timeout);
    }
}

// Agrega los años más recientes (desde el último año del JSON) con datos oficiales vivos
async function construirSerieExtendida() {
    const base = serieHistorica.map(item => ({
        ...item,
        cobertura: parseFloat(((item.smvm / item.cbt) * 100).toFixed(1))
    }));

    try {
        const anioBase = serieHistorica.length > 0 ? serieHistorica[serieHistorica.length - 1].year : 2016;
        const start = `${anioBase + 1}-01-01`;

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

        const aniosNuevos = Object.keys(smvmPorAnio)
            .map(Number)
            .filter(a => a > anioBase)
            .sort();

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
        return base;
    } catch (error) {
        console.warn('No se pudo extender la serie con datos reales:', error.message);
        return base;
    }
}

// Endpoint para la serie evolutiva del gráfico (JSON histórico + años recientes del API oficial)
router.get("/serie-historica", async (req, res) => {
    try {
        const cacheKey = 'serie-historica';
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const serie = await construirSerieExtendida();
        cache.set(cacheKey, serie);
        res.json(serie);
    } catch (error) {
        console.error("Error al obtener serie histórica:", error.message);
        res.status(500).json({ error: "No se pudo obtener la serie histórica" });
    }
});

module.exports = router;
