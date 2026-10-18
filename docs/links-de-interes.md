# Links de interés — fuentes oficiales

## API de series de tiempo (fuente de datos del proyecto)

- Endpoint base: <https://apis.datos.gob.ar/series/api/series/>
- Catálogo (Subsecretaría de Programación Macroeconómica): <https://infra.datos.gob.ar/catalog/sspm/>
- Series usadas (IDs definidos en `routes/api.js`):

| Serie | ID | Período |
|---|---|---|
| Salario Mínimo, Vital y Móvil | `57.1_SMVMM_0_M_34` | mensual |
| CBT (línea de pobreza, familia tipo) | `150.1_LA_POBREZA_0_D_13` | -- |
| CBA (línea de indigencia, familia tipo) | `150.1_LA_INDICIA_0_D_16` | -- |
| Haber mínimo jubilatorio | `58.1_MP_0_M_13` | mensual |

- Ejemplo de consulta: `https://apis.datos.gob.ar/series/api/series/?ids=57.1_SMVMM_0_M_34&start_date=2025-01-01&metadata=none`
- Consultar cada serie por separado (los IDs combinados dan respuestas poco fiables) y filtrar `fecha <= hoy` (la API incluye meses futuros calendarizados).

## INDEC

- **Calendario de difusión** (cuándo se publica cada dato): <https://www.indec.gob.ar/indec/web/Calendario-Fecha-0>
- Canasta básica alimentaria y canasta básica total: <https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149>

## SMVM (Secretaría de Trabajo)

- Consejo Nacional del Empleo, la Productividad y el Salario Mínimo, Vital y Móvil: <https://www.argentina.gob.ar/trabajo/consejodelsalario>

## ANSES

- Haber mínimo / previsional: <https://www.anses.gob.ar/>
