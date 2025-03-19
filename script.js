const axios = require("axios");
const cheerio = require("cheerio");

// Función para obtener el Salario Mínimo
async function obtenerSalarioMinimo() {
  const url = "URL_DE_LA_PAGINA_OFICIAL_DEL_SALARIO";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Cambia el selector según la estructura de la página
    const salario = $("CSS_SELECTOR_DEL_SALARIO").text().trim();
    return salario;
  } catch (error) {
    console.error("Error al obtener el salario mínimo:", error.message);
    return null;
  }
}

// Función para obtener la Canasta Básica
async function obtenerCanastaBasica() {
  const url = "URL_DE_LA_PAGINA_OFICIAL_DEL_INDEC";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const canastaAlimentaria = $("CSS_SELECTOR_CANASTA_ALIMENTARIA")
      .text()
      .trim();
    const canastaTotal = $("CSS_SELECTOR_CANASTA_TOTAL").text().trim();
    return { canastaAlimentaria, canastaTotal };
  } catch (error) {
    console.error("Error al obtener la canasta básica:", error.message);
    return null;
  }
}

// Función para obtener las Jubilaciones
async function obtenerJubilaciones() {
  const url = "URL_DE_LA_PAGINA_OFICIAL_DE_ANSES";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jubilacionMinima = $("CSS_SELECTOR_JUBILACION_MINIMA").text().trim();
    return jubilacionMinima;
  } catch (error) {
    console.error("Error al obtener las jubilaciones:", error.message);
    return null;
  }
}

// Función principal
(async () => {
  console.log("Obteniendo datos económicos...");

  const salarioMinimo = await obtenerSalarioMinimo();
  const canastaBasica = await obtenerCanastaBasica();
  const jubilacion = await obtenerJubilaciones();

  console.log(`Salario Mínimo: ${salarioMinimo}`);
  console.log(
    `Canasta Básica Alimentaria: ${canastaBasica?.canastaAlimentaria}`
  );
  console.log(`Canasta Básica Total: ${canastaBasica?.canastaTotal}`);
  console.log(`Jubilación Mínima: ${jubilacion}`);

  // Opcional: Guardar los datos en un archivo JSON
  const fs = require("fs");
  const datosEconomicos = {
    salarioMinimo,
    canastaBasica,
    jubilacion,
    fechaActualizacion: new Date().toISOString(),
  };

  fs.writeFileSync(
    "datosEconomicos.json",
    JSON.stringify(datosEconomicos, null, 2)
  );
  console.log("Datos guardados en datosEconomicos.json");
})();
