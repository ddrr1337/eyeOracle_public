const requestConfig = require("../configs/alpacaMintConfig.js")
const { simulateScript, decodeResult } = require("@chainlink/functions-toolkit")

async function main() {
    const { responseBytesHexstring, errorString } =
        await simulateScript(requestConfig)

    if (responseBytesHexstring) {
        console.log(
            `Response returned by script during local simulation: ${decodeResult(
                responseBytesHexstring,
                requestConfig.expectedReturnType,
            ).toString()}\n`,
        )
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
