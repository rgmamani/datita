async function cargarDatos() {
    try {
        let response = await fetch('/api/datos-economicos');
        let data = await response.json();

        document.getElementById('salarioMinimo').innerHTML = data.salarioMinimo;
        document.getElementById('canastaAlimentaria').innerHTML = data.canastaBasica.canastaAlimentaria;
        document.getElementById('canastaTotal').innerHTML = data.canastaBasica.canastaTotal;
        document.getElementById('jubilacion').innerHTML = data.jubilacion;

        let updateString = (new Date(data.fechaActualizacion)).toLocaleDateString();
        document.getElementById('salarioMinimoUpdated').innerHTML = updateString;
        document.getElementById('canastaTotalUpdated').innerHTML = updateString;
        document.getElementById('jubilacionUpdated').innerHTML = updateString;
    } catch (error) {
        console.error('Error al cargar los datos: ', error);
    }
}

// Cargar los datos al inicio
window.onload = cargarDatos;