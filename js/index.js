const ConstantesConocidas =
{
    IVA: 1.25,
    CFT: 1.02,
    DESCUENTO: 0.9
}

const BIKES_INFO={
    "BTRK502":{"name":"Benelli TRK 502", "price":7200.00, "photoSrc": "benelli_trk_502.jpg"},
    "HTXR250":{"name":"Honda Tornado XR 250", "price":6100.00, "photoSrc":"honda_tornado_xr_250.jpg"},
    "YTNR250":{"name":"Yamaha Tenere 250", "price":5300.00, "photoSrc":"yamaha_tenere_250.jpg"}
}

function displayQuotes(valorTotal, cantidadDeCuotas, moneda){
    let montoCuota = obtenerValorTotalConIntereses(valorTotal/cantidadDeCuotas);
    let totalConCuotas=0;

    let cuotas = [];

    for(let i=1; i <= cantidadDeCuotas; i++)
    {  
        cuotas.push(montoCuota);
        totalConCuotas+= montoCuota;
    }
    cuotas = aplicarOfertaDescuentoDeCuotas(cuotas);
    return [armarMensajeFinal(cuotas,totalConCuotas,moneda),totalConCuotas];
}

const armarMensajeFinal = (cuotas, total, moneda)=>{
    let mensajeFinal = "<ul>";
    let i=1;
    
    for (cuota of cuotas)
    {
        mensajeFinal +="<li>" +i+"° Cuota: " + formatearValor(cuota,moneda)+ "</li>";
        i++;
    }
    return mensajeFinal + "</ul> <br>Costo final con cuotas: " + formatearValor(total,moneda)+ "</br>";
}

const obtenerValorTotalConIntereses = (valorTotal)=>{
    return valorTotal*ConstantesConocidas.IVA;
}

const formatearValor = (valor, moneda)=>{
    return valor.toFixed(2)+" "+ moneda;
}

//se aplica un descuento del 10% en las ultimas 3 cuotas si la cantidad de cuotas es mayor a 16  
const aplicarOfertaDescuentoDeCuotas = (cuotas)=>{
    if (cuotas.length > 16)
    {
        aux = cuotas.slice(cuotas.length-4,cuotas.length-1);
        for(let i = 0;i<3; i++)
        {
            cuotas.pop();
            aux[i] *= ConstantesConocidas.DESCUENTO;
        }
        
        return cuotas.concat(aux);
    }
    return cuotas;
}

const buildHistoryHTML = (history)=>{
    let finalHtml = "<h6>Historial</h6><ul>"
    history['history'].forEach(obj => {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          finalHtml+="<li>"+key+": "+value+ "</li>"
        });
      });
      return finalHtml+ "</ul>"
}

const displayHistory = (form)=>{
    const data = new FormData(form);
    const resultadosCotizador = document.getElementById("cotizadorResultados");
    const modelInfo = BIKES_INFO[data.get("seleccionModeloCotizador")];
    console.log(modelInfo)
    const quotesRes = displayQuotes(modelInfo["price"],data.get("seleccionCuotasCotizador"),"USD");
    resultadosCotizador.innerHTML= quotesRes[0];

    let history = JSON.parse(sessionStorage.getItem("quoteHistory"));
    history['history'] = [...history['history'],{[modelInfo['name']]:modelInfo['price']}]
    sessionStorage.setItem("quoteHistory",JSON.stringify(history))

    document.getElementById("historialResultados").innerHTML = buildHistoryHTML(history);
}
const buildProductInfoHTML = (modelData, currency)=>{
    let finalHtml = ""
}
//main

//quote history
sessionStorage.setItem("quoteHistory",'{"history":[]}')
const formCotizador = document.getElementById("cotizadorSimulador-form");
formCotizador.addEventListener("submit",(evento)=>{
    evento.preventDefault();
    displayHistory(formCotizador);
})

//product info display
var modelSelect = document.querySelector("#seleccionModeloCotizador");
modelSelect.onchange = ()=> {
    modelData = BIKES_INFO[modelSelect.selectedOptions[0].value];
    document.querySelector("#seleccionModeloCotizador").innerHTML = buildProductInfoHTML(modelData, document.querySelector('input[name="currencyCheck"]:checked').value);
}

