const monedaElement = document.querySelector("#moneda");
const apiURL = "https://mindicador.cl/api/";
const montoInput = document.querySelector("#monto");
const convertirButton = document.querySelector("#btnConvertir");
const resultadoElement = document.querySelector("#resultado");
const grafico = document.querySelector("#myChart")

let dataCambio = {};

async function getCambio() {
    try {
        const res = await fetch(apiURL);
        if (!res.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        const data = await res.json();
        dataCambio = data;
        console.log(dataCambio); // Verificar la estructura de los datos
        return data;
    } catch (e) {
        alert("Hubo un problema obteniendo los datos de la API: " + e.message);
    }
}

async function renderCambio() {
    await getCambio();
    let template = "<option value=''>Seleccione tipo de cambio</option>";

    const monedas = ["dolar", "euro", "bitcoin", "tasa_desempleo", "libra_cobre", "imacec", "utm", "ipc", "dolar_intercambio", "ivp", "uf", "tpm"];

    monedas.forEach((moneda) => {
        if (dataCambio[moneda]) {
            template += `
            <option value="${moneda}">${moneda.toUpperCase()}</option>
            `;
        }
    });

    monedaElement.innerHTML = template;
}

async function convertir() {
    const monedaSeleccionada = monedaElement.value;
    const cantidadPesos = parseFloat(montoInput.value);

    if (!monedaSeleccionada || isNaN(cantidadPesos)) {
        resultadoElement.textContent = "Por favor, selecciona una moneda y ingresa una cantidad válida.";
        return;
    }

    if (!dataCambio[monedaSeleccionada]) {
        resultadoElement.textContent = "No se encontró la tasa de cambio para la moneda seleccionada.";
        return;
    }

    const valorCambio = dataCambio[monedaSeleccionada].valor;
    const resultado = cantidadPesos / valorCambio;

    resultadoElement.textContent = `Resultado: ${cantidadPesos} pesos chilenos = ${resultado.toFixed(2)} ${monedaSeleccionada.toUpperCase()}.`;
}

let myLineChart;
monedaElement.addEventListener('change', ()=>{
    const value = monedaElement.value;
    renderGrafica(value);
});

async function getAndCreateDataToChart(moneda){
    const res = await fetch(`${apiURL}${moneda}`);
    const valores = await res.json();
    const ultimosDiez = valores.serie.slice(21, 30).reverse();
    const labels = ultimosDiez.map((dia)=>{
        return new Date(dia.fecha).toLocaleDateString();
    });
    const data = ultimosDiez.map((dia)=>{
        return dia.valor;
    });
    const datasets = [
        {
            label: `Últimos diez días de ${moneda}`,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)", // Fondo de las líneas
            data,
        },
    ];
    return {labels, datasets};
}

async function renderGrafica(moneda) {
    const data = await getAndCreateDataToChart(moneda);
    const config = {
        type: "line",
        data,
        options: {
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                },
                y: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            elements: {
                line: {
                    borderWidth: 2,
                    tension: 0.4
                }
            }
        },
        plugins: [{
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }]
    };
    const ctx = document.querySelector("#myChart").getContext("2d");
    if (myLineChart) {
        myLineChart.destroy();
    }
    myLineChart = new Chart(ctx, config);
}

convertirButton.addEventListener("click", convertir);

renderCambio();
