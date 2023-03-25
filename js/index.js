const ConstantesConocidas =
{
    CFT: 1.63
}

const BIKES_INFO={
    "BTRK502":{"name":"Benelli TRK 502", "price":7200.00, "photoSrc": "benelli_trk_502.jpg"},
    "HTXR250":{"name":"Honda Tornado XR 250", "price":6100.00, "photoSrc":"honda_tornado_xr_250.jpg"},
    "YTNR250":{"name":"Yamaha Tenere 250", "price":5300.00, "photoSrc":"yamaha_tenere_250.jpg"}
}
const BASEDIR = "../"

async function quotesResults(valorTotal, cantidadDeCuotas, moneda){
    let interestVal = calcTotalInterestVal(valorTotal)
    console.log(interestVal)
    
    return await getARSValueConversion(interestVal).then((arsVal=>{
        if(moneda === 'ARS')
        interestVal = arsVal;

        console.log (arsVal)
        return {
        finalValue: interestVal,
        singleQuote: interestVal / cantidadDeCuotas,
        quotes: cantidadDeCuotas,
        currency: moneda
        }
    }))
    
}

function buildQuoterResHTML(results){
    return  `<h6>Precio en ${results.quotes} cuotas de ${results.finalValue/results.quotes + " " + results.currency}:</h6>
            <h4>${results.finalValue + " " + results.currency}</h4>
            `
}
async function getARSValueConversion(valorTotal){
        return await fetch ('https://api.bluelytics.com.ar/v2/latest').then(async (res)=>res.json()).then((data) =>{
            console.log(data['blue']['value_sell']);
            return valorTotal*data['blue']['value_sell'];
        })
}

function calcTotalInterestVal(val){
    return val*ConstantesConocidas.CFT
}

const buildHistoryHTML = (history)=>{
    let finalHtml = "<h6>Historial</h6><ul>"
    history['history'].forEach(obj => { 
        finalHtml+='<li class= "card">'
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          finalHtml+= "<p>" + key+": "+value +"</p>" 
        });
        finalHtml+="</li>"
      });
      return finalHtml+ "</ul>"
}

async function displayQuoterResults  (data){
    
    const resultadosCotizador = document.getElementById("cotizadorResultados");
    const modelInfo = BIKES_INFO[data.get("seleccionModeloCotizador")];
    await quotesResults(modelInfo.price, data.get("seleccionCuotasCotizador"),data.get("currencyCheck")).then((res =>{
        console.log(res)
        resultadosCotizador.innerHTML = buildQuoterResHTML(res);
        
        displayHistory(modelInfo, res);     
    }))
}

const displayHistory = (model,results)=>{

    let history = JSON.parse(sessionStorage.getItem("quoteHistory"));
    let newhistoryItem = {'Modelo':model['name'],'Cuotas': results.quotes, 'Valor final en cuotas': results.finalValue};

    if(!history['history'].some(obj => 
        obj.name == newhistoryItem.name &&  obj.quotes == newhistoryItem.name &&  obj.name == newhistoryItem.name)
        ){
       history['history'] = [...history['history'], newhistoryItem]
       sessionStorage.setItem("quoteHistory",JSON.stringify(history)) 
    }
    document.getElementById("historialResultados").innerHTML = buildHistoryHTML(history);
}
const buildProductInfoHTML = (modelData, currency)=>{
    return `<img src="${BASEDIR+"img/"+modelData.photoSrc}">
            <h3>${modelData.name}</h3>
            <h4>${modelData.price +" " + currency}</h4>
            `
}

//main

//quote history
sessionStorage.setItem("quoteHistory",'{"history":[]}')
const formCotizador = document.getElementById("cotizadorSimulador-form");
formCotizador.addEventListener("submit",async (evento)=>{
    evento.preventDefault();
    const data = new FormData(formCotizador);
    await displayQuoterResults(data);
})

//product info display
var modelSelect = document.querySelector("#seleccionModeloCotizador");
modelSelect.onchange = async()=> {
    modelData = BIKES_INFO[modelSelect.selectedOptions[0].value];
    await getARSValueConversion(modelData.price).then(price=>{
        if(document.querySelector('input[name="currencyCheck"]:checked').value === 'ARS')
          modelData.price = price;
        }    
    )
    document.querySelector("#selectedModelInfo").innerHTML = await buildProductInfoHTML(modelData, document.querySelector('input[name="currencyCheck"]:checked').value|"USD");
}

