if (secrets.alpacaKey == "" || secrets.alpacaSecret == "") {
    throw Error("Need Apalaca Keys")
}

async function main() {
    const marketStatus = await checkMarket()

    if (marketStatus) {
        const cash = await getCashBalance()

        return Functions.encodeUint256(Math.round(cash))
    } else {
        return Functions.encodeUint256(0)
    }
}

async function getCashBalance() {
    const alpacaRequest = Functions.makeHttpRequest({
        url: "https://paper-api.alpaca.markets/v2/account",
        headers: {
            accept: "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
    })

    const [response] = await Promise.all([alpacaRequest])

    const portfolioBalance = response.data.cash

    return portfolioBalance
}

async function checkMarket() {
    const alpacaRequest = Functions.makeHttpRequest({
        url: "https://paper-api.alpaca.markets/v2/clock",
        headers: {
            accept: "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
    })

    const [response] = await Promise.all([alpacaRequest])
    const marketStatus = response.data.is_open

    return marketStatus
}

const result = await main()
return result
