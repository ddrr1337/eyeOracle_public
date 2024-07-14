if (secrets.alpacaKey === "" || secrets.alpacaSecret === "") {
    throw Error("Need Alpaca Keys")
}

const stockTicker = args[0]

const headers = {
    accept: "application/json",
    "APCA-API-KEY-ID": secrets.alpacaKey,
    "APCA-API-SECRET-KEY": secrets.alpacaSecret,
}

// Solicitud para comprobar si el mercado está abierto
const alpacaRequestMarketClock = Functions.makeHttpRequest({
    url: "https://paper-api.alpaca.markets/v2/clock",
    headers: headers,
})

// Realizar la solicitud para verificar el estado del mercado
const marketClockResponse = await alpacaRequestMarketClock
const marketClockData = marketClockResponse.data

// Comprobar si el mercado está abierto
if (marketClockData.is_open) {
    // Solicitud para obtener la cantidad de la posición
    const alpacaRequestStockQty = Functions.makeHttpRequest({
        url: `https://paper-api.alpaca.markets/v2/positions/${stockTicker}`,
        headers: headers,
    })

    // Realizar la solicitud para obtener la posición
    const response = await alpacaRequestStockQty
    const positionQuantity = response.data.qty

    console.log("Alpaca equity: ", positionQuantity)

    return Functions.encodeUint256(Math.round(positionQuantity))
} else {
    console.log("Market is closed")
    return Functions.encodeUint256(0) // O maneja esto de la manera que prefieras
}
