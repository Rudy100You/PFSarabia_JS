var USDtoARSSell;
window.onload = async()=>{
    USDtoARSSell = await getUSDtoARSValueConversion();
}
const ConstantesConocidas = {
  CFT: 1.63,
};

const BIKES_INFO = {
  BTRK502: {
    name: "Benelli TRK 502",
    price: 7200.0,
    photoSrc: "benelli_trk_502.jpg",
  },
  HTXR250: {
    name: "Honda Tornado XR 250",
    price: 6100.0,
    photoSrc: "honda_tornado_xr_250.jpg",
  },
  YTNR250: {
    name: "Yamaha Tenere 250",
    price: 5300.0,
    photoSrc: "yamaha_tenere_250.jpg",
  },
};
const BASEDIR = "../";

async function quotesResults(valorTotal, cantidadDeCuotas, moneda) {
  let interestVal = valorTotal * ConstantesConocidas.CFT;
  console.log(interestVal);
  if (moneda === "ARS") {
      interestVal = USDtoARSSell * interestVal;
      console.log(interestVal);
  }
  return {
    finalValue: interestVal,
    singleQuote: interestVal / cantidadDeCuotas,
    quotes: cantidadDeCuotas,
    currency: moneda,
  };
}

function buildQuoterResHTML(results) {
  return `<h6>Precio en ${results.quotes} cuotas de ${
    (results.finalValue / results.quotes).toFixed(2) + " " + results.currency
  }:</h6>
            <h4>${results.finalValue + " " + results.currency}</h4>
            `;
}
async function getUSDtoARSValueConversion() {
    let sellValue;
    await $.get("https://api.bluelytics.com.ar/v2/latest", (data) => {
        sellValue = data["blue"]["value_sell"];
  });
  return sellValue;
}

const buildHistoryHTML = (history) => {
  let finalHtml = "<h6>Historial</h6><ul>";
  history["history"].forEach((obj) => {
    finalHtml += '<li class= "card">';
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      finalHtml += "<p>" + key + ": " + value + "</p>";
    });
    finalHtml += "</li>";
  });
  return finalHtml + "</ul>";
};

async function displayQuoterResults(data) {
  const resultadosCotizador = document.getElementById("cotizadorResultados");
  const modelInfo = BIKES_INFO[data.get("seleccionModeloCotizador")];
  await quotesResults(
    modelInfo.price,
    data.get("seleccionCuotasCotizador"),
    data.get("currencyCheck")
  ).then((res) => {
    console.log(res);
    resultadosCotizador.innerHTML = buildQuoterResHTML(res);

    displayHistory(modelInfo, res,data.get("currencyCheck"));
  });
}

const displayHistory = (model, results, currency) => {
  let history = JSON.parse(sessionStorage.getItem("quoteHistory"));
  let newhistoryItem = {
    Modelo: model["name"],
    Moneda: currency,
    Cuotas: results.quotes,
    "Valor final en cuotas": results.finalValue,
  };

  if (
    !history["history"].some(
      (obj) =>
        obj["Modelo"] == newhistoryItem["Modelo"] &&
        obj["Cuotas"] == newhistoryItem["Cuotas"] &&
        obj["Valor final"] == newhistoryItem["Valor final"] &&
        obj["Moneda"] == newhistoryItem["Moneda"]
    )
  ) {
    history["history"] = [...history["history"], newhistoryItem];
    sessionStorage.setItem("quoteHistory", JSON.stringify(history));
  }
  document.getElementById("historialResultados").innerHTML = buildHistoryHTML(
    history
  );
};
const buildProductInfoHTML = (modelData, currency) => {
  console.log(modelData);
  return `<img src="${BASEDIR + "img/" + modelData.photoSrc}">
            <h3>${modelData.name}</h3>
            <h4>${modelData.price.toFixed(2) + " " + currency}</h4>
            `;
};

//main

  //quote history
  sessionStorage.setItem("quoteHistory", '{"history":[]}');
  const formCotizador = document.getElementById("cotizadorSimulador-form");
  formCotizador.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const data = new FormData(formCotizador);
    await displayQuoterResults(data);
  });

  //product info display
  var modelSelect = document.querySelector("#seleccionModeloCotizador");
  var currencySelect = document.querySelectorAll(
    "#seleccionMonedaCotizador input"
  );
  console.log(currencySelect);
  var updateProductInfoDisplay = async () => {
    let modelData = {...BIKES_INFO[modelSelect.selectedOptions[0].value]};
    console.log(USDtoARSSell)
    var currency = "USD";
    currencySelect.forEach((radio) => {
        if (radio.checked) 
        currency = radio.value;
    })
    if (currency === "ARS"){
        modelData.price = USDtoARSSell*modelData['price'];
    }
    document.querySelector(
      "#selectedModelInfo"
    ).innerHTML = await buildProductInfoHTML(modelData, currency);
  };

  modelSelect.onchange = updateProductInfoDisplay;
  currencySelect.forEach((item)=>{item.onchange = updateProductInfoDisplay})

