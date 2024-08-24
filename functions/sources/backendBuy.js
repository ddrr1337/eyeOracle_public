//Buy script backend in middle

async function main() {
    const stockTicker = args[0]
    const amountQty = args[1]
    const nonce = args[2]
    const requester = args[3]
    const selection = args[4]

    _checkKeys()

    const response = await getTesterInt(
        stockTicker,
        amountQty,
        nonce,
        requester,
        selection,
    )

    if (response) {
        return Functions.encodeUint256(response.data)
    } else {
        return Functions.encodeUint256(1)
    }
}

async function getTesterInt(
    stockTicker,
    amountQty,
    nonceId,
    requester,
    selection,
) {
    const backendRequest = Functions.makeHttpRequest({
        method: "POST",
        url: "http://85.53.91.64:8001/api/process-order/",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json", // Agregar esta línea
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
        data: {
            stockTicker: stockTicker,
            amountQty: amountQty,
            nonce: nonceId + stockTicker,
            requester: requester,
            selection: selection,
        },
    })

    const [response] = await Promise.all([backendRequest])

    const testerInt = response.data

    return testerInt
}

function _checkKeys() {
    if (secrets.alpacaKey == "" || secrets.alpacaSecret === "") {
        throw Error("need alpaca keys")
    }
}

const result = await main()
return result
