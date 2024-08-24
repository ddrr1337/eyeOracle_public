require("dotenv").config()
const { incrementNonce } = require("../../utils/incrementNonce.js")
const { addressToString } = require("../../utils/addressToString.js")

const fs = require("fs")
const {
    Location,
    ReturnType,
    CodeLanguage,
} = require("@chainlink/functions-toolkit")

async function requestConfigFunction() {
    const nextNonce = await incrementNonce()
    const requester = addressToString(
        "0x26baAC08CB753303de111e904e19BaF91e6b5E4d",
    )
    // Configure the request by setting the fields below
    const requestConfig = {
        // String containing the source code to be executed
        source: fs.readFileSync("./functions/sources/backendBuy.js").toString(),
        //source: fs.readFileSync("./API-request-example.js").toString(),
        // Location of source code (only Inline is currently supported)
        codeLocation: Location.Inline,
        // Optional. Secrets can be accessed within the source code with `secrets.varName` (ie: secrets.apiKey). The secrets object can only contain string values.
        secrets: {
            alpacaKey: process.env.ALPACA_API_KEY ?? "",
            alpacaSecret: process.env.ALPACA_SECRET_KEY ?? "",
        },
        // Optional if secrets are expected in the sourceLocation of secrets (only Remote or DONHosted is supported)
        secretsLocation: Location.DONHosted,
        // Args (string only array) can be accessed within the source code with `args[index]` (ie: args[0]).
        args: ["TSLA", "250", nextNonce.toString(), requester, "buy"],
        // Code language (only JavaScript is currently supported)
        codeLanguage: CodeLanguage.JavaScript,
        // Expected type of the returned value
        expectedReturnType: ReturnType.uint256,
    }

    return requestConfig
}

module.exports = { requestConfigFunction }
