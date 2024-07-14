const SLEEP_TIME = 2000 // 5 seconds

const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "APCA-API-KEY-ID": secrets.alpacaKey,
    "APCA-API-SECRET-KEY": secrets.alpacaSecret,
}

async function main() {
    const stockTicker = args[0]
    const amountQty = args[1]

    _checkKeys()

    const isMarketOpen = await checkMarket()

    if (isMarketOpen) {
        const side = "buy"
        let order_id = await placeOrder(stockTicker, amountQty, side)

        let filledQty = await orderDetails(order_id)

        return Functions.encodeUint256(filledQty)
    } else {
        return Functions.encodeUint256(0)
    }
}

// returns string: client_order_id, string: orderStatus, int: responseStatus
async function placeOrder(symbol, qty, side) {
    // TODO, something is wrong with this request, need to fix
    const alpacaBuyRequest = Functions.makeHttpRequest({
        method: "POST",
        url: "https://paper-api.alpaca.markets/v2/orders",
        headers: headers,
        data: {
            side: side,
            type: "market",
            time_in_force: "day",
            symbol: symbol,
            notional: qty,
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

    const responseDetails = responseDetailsRaw.data

    return parseInt(Number(responseDetails.filled_qty) * 1e18)
}

// returns int: responseStatus
async function cancelOrder(order_id) {
    const alpacaCancelRequest = Functions.makeHttpRequest({
        method: "DELETE",
        url: `https://paper-api.alpaca.markets/v2/orders/${order_id}`,
        headers: headers,
    })

    const [response] = await Promise.all([alpacaCancelRequest])

    const responseStatus = response.status
    return responseStatus
}

// @returns bool
async function waitForOrderToFill(order_id) {
    let numberOfSleeps = 0
    const capNumberOfSleeps = 10
    let filled = false

    while (numberOfSleeps < capNumberOfSleeps) {
        const alpacaOrderStatusRequest = Functions.makeHttpRequest({
            method: "GET",
            url: `https://paper-api.alpaca.markets/v2/orders/${order_id}`,
            headers: headers,
        })

        const [response] = await Promise.all([alpacaOrderStatusRequest])

        const responseStatus = response.status
        const { status: orderStatus } = response.data
        if (responseStatus !== 200) {
            return false
        }
        if (orderStatus === "filled") {
            filled = true
            break
        }
        numberOfSleeps++
        await sleep(SLEEP_TIME)
    }
    return filled
}

function _checkKeys() {
    if (secrets.alpacaKey == "" || secrets.alpacaSecret === "") {
        throw Error("need alpaca keys")
    }
}

async function checkMarket() {
    const marketStatus = Functions.makeHttpRequest({
        method: "GET",
        url: "https://paper-api.alpaca.markets/v2/orders",
        headers: headers,
    })

    const marketStatusResponseRaw = await marketStatus
    const marketStatusResponse = marketStatusResponseRaw.data

    return marketStatusResponse.is_open
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const result = await main()
return result
