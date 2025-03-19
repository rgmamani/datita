const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

// Función para obtener los datos económicos
async function obtenerDatosEconomicos() {
  try {
    // Simulación de scraping
    const salarioMinimo = "286.711 ARS"; // Reemplaza con el resultado real del scraping
    const canastaAlimentaria = "439.239,58 ARS"; // Reemplaza con el resultado real
    const canastaTotal = "1.001.466 ARS"; // Reemplaza con el resultado real
    const jubilacionMinima = "259.598,76 ARS"; // Reemplaza con el resultado real

    return {
      salarioMinimo,
      canastaBasica: { canastaAlimentaria, canastaTotal },
      jubilacion: jubilacionMinima,
      fechaActualizacion: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error al obtener datos:", error.message);
    return null;
  }
}

// Endpoint para servir los datos al frontend
app.get("/api/datos-economicos", async (req, res) => {
  const datos = await obtenerDatosEconomicos();
  if (datos) {
    res.json(datos);
  } else {
    res.status(500).json({ error: "No se pudieron obtener los datos" });
  }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
