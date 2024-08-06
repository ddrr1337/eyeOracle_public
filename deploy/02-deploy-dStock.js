require("dotenv").config()
const fs = require("fs")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { getGasPrice } = require("../utils/getGasPrice")
const { incrementNonce } = require("../utils/incrementNonce")
const { sendContracts } = require("../utils/sendContracts")
const { getAccount } = require("../utils/getAccount")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const STOCKS = ["TSLA", "AAPL", "KO", "AMZN", "MSFT", "GOOG"]
    const { deploy, log } = deployments
    let rpcUrl = network.config.url
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)

    const gasMultiplier = 1.2
    const FUNCTIONS_ROUTER = networkConfig[chainId].FUNCTIONS_ROUTER
    const USDC = networkConfig[chainId].USDC

    console.log(await getGasPrice())

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStoarageAddress = dStorageDeployment.address
    const dStoarageAbi = dStorageDeployment.abi

    const verifyContract = networkConfig[chainId].verify

    for (const stockName of STOCKS) {
        const nonce = await incrementNonce()

        const constructorArgs = [
            FUNCTIONS_ROUTER,
            USDC,
            stockName,
            dStoarageAddress,
            nonce,
        ]

        const dStockDeploy = await deploy("dSTOCK", {
            from: deployer,
            args: constructorArgs,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
            gasMultiplier: gasMultiplier,
        })

        console.log(
            `----------------------- DEPLOY COMPLETED OF ${stockName} --------------------------`,
        )

        if (verifyContract) {
            await verify(dStockDeploy.address, constructorArgs)
            console.log(
                "----------------------- VERIFICATION COMPLETED --------------------------",
            )
        }
    }

    const dStorageContract = new ethers.Contract(
        dStoarageAddress,
        dStoarageAbi,
        account,
    )

    const dStorageArray = await dStorageContract.getStocksArray()

    await sendContracts(dStorageArray)

    console.log(
        "----------------------- CONTRACTS UPDATED IN BACKEND --------------------------",
    )
}

module.exports.tags = ["all", "dStock"]
