if (secrets.alpacaKey == "" || secrets.alpacaSecret == "") {
    throw Error("Need Apalaca Keys")
}

const alpacaRequest = Functions.makeHttpRequest({
    url: "https://paper-api.alpaca.markets/v2/account",
    headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": secrets.alpacaKey,
        "APCA-API-SECRET-KEY": secrets.alpacaSecret,
    },
})

const [response] = await Promise.all([alpacaRequest])

const portfolioBalance = response.data.equity

console.log("Alpaca equity: ", portfolioBalance)

return Functions.encodeUint256(Math.round(portfolioBalance))
