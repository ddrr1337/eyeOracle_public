require("dotenv").config()
const { incrementNonce } = require("../../utils/incrementNonce.js")

const fs = require("fs")
const {
    Location,
    ReturnType,
    CodeLanguage,
} = require("@chainlink/functions-toolkit")

async function requestConfigFunction() {
    const nextNonce = await incrementNonce()
    // Configure the request by setting the fields below
    const requestConfig = {
        // String containing the source code to be executed
        source: fs
            .readFileSync("./functions/sources/alpacaBuyStock.js")
            .toString(),
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
        args: ["TSLA", "250", nextNonce.toString()],
        // Code language (only JavaScript is currently supported)
        codeLanguage: CodeLanguage.JavaScript,
        // Expected type of the returned value
        expectedReturnType: ReturnType.uint256,
    }

    return requestConfig
}

module.exports = { requestConfigFunction }
