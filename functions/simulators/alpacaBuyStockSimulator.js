const requestBuyStock = require("../configs/alpacaBuyStockConfig.js")
const { simulateScript, decodeResult } = require("@chainlink/functions-toolkit")

async function main() {
    const { responseBytesHexstring, errorString } =
        await simulateScript(requestBuyStock)

    if (responseBytesHexstring) {
        console.log(
            `Response returned by script during local simulation: ${Number(
                decodeResult(
                    responseBytesHexstring,
                    requestBuyStock.expectedReturnType,
                ).toString(),
            )}\n`,
        )
        /* console.log(
            `Response returned by script during local simulation: ${decodeResult(
                responseBytesHexstring,
                requestBuyStock.expectedReturnType,
            ).toString()}\n`,
        ) */
        console.log("HEXResponse: ", responseBytesHexstring)
    }

    if (errorString) {
        console.log(`Error returned by simulated script:\n${errorString}\n`)
    } else {
        console.log("✅✅✅ Success ✅✅✅")
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
