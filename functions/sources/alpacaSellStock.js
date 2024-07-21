//Sell stock in broker
const SLEEP_TIME = 2000 // 2 seconds
const cryptoAsset = "USDC/USD"

const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "APCA-API-KEY-ID": secrets.alpacaKey,
    "APCA-API-SECRET-KEY": secrets.alpacaSecret,
}

async function main() {
    _checkKeys()
    const stockTicker = args[0]
    const amountQty = args[1]
    const nonce = args[2]

    const sellNonce = nonce + "s"
    const buyNonce = nonce + "b"
    const denormalizeAmount = denormalizeResponse(amountQty)

    const marketStatus = await checkMarket()

    if (!marketStatus) {
        return Functions.encodeString(nonce)
    }

    const checkOrder = await checkOpenedOrder(sellNonce)

    if (checkOrder == "01") {
        const order_id_sell = await placeOrderSell(
            stockTicker,
            denormalizeAmount,
            sellNonce,
        )
        await sleep(SLEEP_TIME)
        const {
            responseDetails: detailsStockSell,
            responseStatus: responseStatusSell,
        } = await orderDetails(order_id_sell)

        if (!detailsStockSell.status == "filled") {
            return Functions.encodeUint256(0)
        }
        const usdReturnedRaw = calculateFilledAmount(
            detailsStockSell.filled_qty,
            detailsStockSell.filled_avg_price,
        )
        const usdReturned = parseInt(usdReturnedRaw).toString()

        const order_id_buy = await placeOrderBuy(
            cryptoAsset,
            usdReturned,
            buyNonce,
        )
        await sleep(SLEEP_TIME)
        const {
            responseDetails: detailsUsdcBuy,
            responseStatus: responseStatusBuy,
        } = await orderDetails(order_id_buy)
        if (!detailsUsdcBuy.status == "filled") {
            return Functions.encodeUint256(0)
        }
        const normalizedFilled = parseInt(
            parseFloat(detailsUsdcBuy.filled_qty) * 1e6,
        )

        return Functions.encodeString(detailsUsdcBuy.filled_qty)
    } else {
        await sleep(SLEEP_TIME * 3)
        const buyOrderId = await checkOpenedOrder(buyNonce)
        const {
            responseDetails: detailsUsdcBuy,
            responseStatus: responseStatusBuy,
        } = await orderDetails(buyOrderId)

        const normalizedFilled = parseInt(
            parseFloat(detailsUsdcBuy.filled_qty) * 1e6,
        )

        return Functions.encodeString(detailsUsdcBuy.filled_qty)
    }
}

async function checkMarket() {
    const alpacaRequest = Functions.makeHttpRequest({
        url: "https://paper-api.alpaca.markets/v2/clock",
        headers: headers,
    })

    const [response] = await Promise.all([alpacaRequest])
    const marketStatus = response.data.is_open

    return marketStatus
}

async function checkOpenedOrder(nonceId) {
    const openOrderDetails = Functions.makeHttpRequest({
        method: "GET",
        url: `https://paper-api.alpaca.markets/v2/orders?status=all`,
        headers: headers,
    })

    const openOrdersArrayRaw = await openOrderDetails
    const openOrdersArray = openOrdersArrayRaw.data

    for (let i = 0; i < openOrdersArray.length; i++) {
        if (openOrdersArray[i].client_order_id == nonceId) {
            return openOrdersArray[i].id
        }
    }
    return "01"
}

async function placeOrderSell(symbol, qty, nonceId) {
    // TODO, something is wrong with this request, need to fix
    const alpacaSellRequest = Functions.makeHttpRequest({
        method: "POST",
        url: "https://paper-api.alpaca.markets/v2/orders",
        headers: headers,
        data: {
            side: "sell",
            type: "market",
            time_in_force: "day",
            symbol: symbol,
            qty: qty,
            client_order_id: nonceId,
        },
    })

    const responseRaw = await alpacaSellRequest
    const response = responseRaw.data

    return response.id
}

async function placeOrderBuy(symbol, qty, nonceId) {
    const alpacaBuyRequest = Functions.makeHttpRequest({
        method: "POST",
        url: "https://paper-api.alpaca.markets/v2/orders",
        headers: headers,
        data: {
            side: "buy",
            type: "market",
            time_in_force: "gtc",
            symbol: symbol,
            notional: qty,
            client_order_id: nonceId,
        },
    })

    const responseRaw = await alpacaBuyRequest
    const response = responseRaw.data
    return response.id
}

async function orderDetails(order_id) {
    const alpacaOrderDetailsRequest = Functions.makeHttpRequest({
        method: "GET",
        url: `https://paper-api.alpaca.markets/v2/orders/${order_id}`,
        headers: headers,
    })

    const responseDetailsRaw = await alpacaOrderDetailsRequest

    const responseStatus = responseDetailsRaw.status

    const responseDetails = responseDetailsRaw.data

    return { responseDetails, responseStatus }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateFilledAmount(filled_qty, filled_avg_price) {
    const filledQty = parseFloat(filled_qty)
    const filledAvgPrice = parseFloat(filled_avg_price)
    const result = filledQty * filledAvgPrice

    return Math.floor(result * 100) / 100
}

function _checkKeys() {
    if (secrets.alpacaKey == "" || secrets.alpacaSecret === "") {
        throw Error("need alpaca keys")
    }
}

async function getCash() {
    const alpacaAcountRequest = Functions.makeHttpRequest({
        method: "GET",
        url: `https://paper-api.alpaca.markets/v2/account`,
        headers: headers,
    })

    const accountDetailsRaw = await alpacaAcountRequest

    const accountDetails = accountDetailsRaw.data

    return accountDetails.cash
}

function normalizeResponse(stringAmount) {
    // Separa la parte entera y decimal
    const [integerPart, decimalPart] = stringAmount.split(".")

    // Si no hay parte decimal, agrega una
    const decimals = decimalPart ? decimalPart : "0"

    // Calcula la cantidad de decimales que necesitamos agregar
    const totalDecimals = 6

    // Concatenamos la parte entera y la parte decimal, agregando ceros al final si es necesario
    let scaledQtyStr = integerPart + decimals.padEnd(totalDecimals, "0")

    // Si la longitud es menor que 18, completamos con ceros
    if (scaledQtyStr.length < totalDecimals) {
        scaledQtyStr = scaledQtyStr.padEnd(totalDecimals, "0")
    }

    // Convertimos la cadena a número para retornar
    return BigInt(scaledQtyStr)
}

function denormalizeResponse(scaledQtyStr) {
    // Convertimos la cadena de entrada en un BigInt para hacer la división
    const bigIntValue = BigInt(scaledQtyStr)

    // Dividimos por 1e18
    const divisor = BigInt(1e18)
    const dividedValue = bigIntValue / divisor
    const remainder = bigIntValue % divisor

    // Convertimos los valores divididos y resto a cadenas
    const integerPart = dividedValue.toString()
    const decimalPart = remainder
        .toString()
        .padStart(18, "0")
        .replace(/0+$/, "")

    // Construimos el resultado como una cadena
    if (decimalPart === "") {
        return integerPart // No hay parte decimal
    } else {
        return `${integerPart}.${decimalPart}`
    }
}

const result = await main()
return result
