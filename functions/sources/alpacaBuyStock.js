const SLEEP_TIME = 2000 // 2 seconds
const cryptoAsset = "USDC/USD"

if (secrets.alpacaKey == "" || secrets.alpacaSecret == "") {
    throw Error("Need Apalaca Keys")
}

async function main() {
    const stockTicker = args[0]
    const amountQty = args[1]
    const nonce = args[2]
    const marketStatus = await checkMarket()

    if (!marketStatus) {
        return Functions.encodeUint256(0)
    }
    const checkOrder = await checkOpenedOrder(nonce)

    if (checkOrder == "01") {
        const order_id = await placeOrderSell(cryptoAsset, amountQty, nonce)
        await sleep(SLEEP_TIME)
        const orderDataSell = await orderDetails(order_id)

        if (!orderDataSell.status == "filled") {
            return Functions.encodeUint256(0)
        }
        const filledQty = calculateFilledAmount(
            orderDataSell.filled_qty,
            orderDataSell.filled_avg_price,
        )

        return Functions.encodeUint256(parseInt(filledQty))
    } else {
        await sleep(SLEEP_TIME)
        const orderData = await orderDetails(checkOrder)

        if (orderData.status == "filled") {
            const filledQty = calculateFilledAmount(
                orderData.filled_qty,
                orderData.filled_avg_price,
            )
            return Functions.encodeUint256(parseInt(filledQty))
        } else {
            return Functions.encodeUint256(0)
        }
    }
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

async function checkOpenedOrder(nonceId) {
    const openOrderDetails = Functions.makeHttpRequest({
        method: "GET",
        url: `https://paper-api.alpaca.markets/v2/orders?status=all`,
        headers: {
            accept: "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
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
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
        data: {
            side: "sell",
            type: "market",
            time_in_force: "gtc",
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
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
        data: {
            side: "buy",
            type: "market",
            time_in_force: "day",
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
        headers: {
            accept: "application/json",
            "APCA-API-KEY-ID": secrets.alpacaKey,
            "APCA-API-SECRET-KEY": secrets.alpacaSecret,
        },
    })

    const responseDetailsRaw = await alpacaOrderDetailsRequest

    const responseDetails = responseDetailsRaw.data

    return responseDetails
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateFilledAmount(filled_qty, filled_avg_price) {
    const filledQty = parseFloat(filled_qty)
    const filledAvgPrice = parseFloat(filled_avg_price)

    return filledQty * filledAvgPrice
}

const result = await main()
return result
