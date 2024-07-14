require("dotenv").config()

const { SecretsManager } = require("@chainlink/functions-toolkit")
const { networkConfig } = require("../helper-hardhat-config")

const uploadSecrets = async (account, chainId) => {
    const routerAddress = networkConfig[chainId].FUNCTIONS_ROUTER
    const donId = networkConfig[chainId].DON_ID_STRING
    const gatewayUrls = [
        "https://01.functions-gateway.testnet.chain.link/",
        "https://02.functions-gateway.testnet.chain.link/",
    ]

    console.log(routerAddress)
    console.log(donId)

    const secrets = {
        alpacaKey: process.env.ALPACA_API_KEY ?? "",
        alpacaSecret: process.env.ALPACA_SECRET_KEY ?? "",
    }

    console.log("SECRETS", secrets)

    const secretsManager = new SecretsManager({
        signer: account,
        functionsRouterAddress: routerAddress,
        donId: donId,
    })
    await secretsManager.initialize()

    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets)

    const slotIdNumber = 0
    const expirationTimeMinutes = 1440

    console.log(
        `Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`,
    )

    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: gatewayUrls,
        slotId: slotIdNumber,
        minutesUntilExpiration: expirationTimeMinutes,
    })

    if (!uploadResult.success) {
        throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`)
    }

    console.log(
        `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
        uploadResult,
    )

    const donHostedSecretsVersion = parseInt(uploadResult.version)
    console.log(`\n✅ Secrets version: ${donHostedSecretsVersion}`)

    return donHostedSecretsVersion
}

module.exports = { uploadSecrets }
