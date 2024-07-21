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

    const stringData = "hola"
    const encodedData = encodeStringToBytes(stringData)
    console.log(encodedData)
    return encodedData
}

function encodeStringToBytes(stringData) {
    const textEncoder = new TextEncoder()
    const encodedBytes = textEncoder.encode(stringData)
    return encodedBytes
}

function _checkKeys() {
    if (secrets.alpacaKey === "" || secrets.alpacaSecret === "") {
        throw Error("need alpaca keys")
    }
}

const result = await main()
return result
