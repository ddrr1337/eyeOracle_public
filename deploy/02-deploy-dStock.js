require("dotenv").config()
const fs = require("fs")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { getAccount } = require("../utils/getAccount")
const { uploadSecrets } = require("../functions/uploadSecrets")
const { getGasPrice } = require("../utils/getGasPrice")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    let rpcUrl = network.config.url
    let provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const chainlinkSubId = process.env.CHAINLINK_SUB_ID
    const mintSourceCode = fs
        .readFileSync("./functions/sources/alpacaBuyStock.js")
        .toString()

    const gasMultiplier = 1.2
    const versionDon = await uploadSecrets(
        getAccount("main", provider),
        chainId,
    )
    const slotDon = 0

    const FUNCTIONS_ROUTER = networkConfig[chainId].FUNCTIONS_ROUTER
    const USDC = networkConfig[chainId].USDC
    const DON_ID = networkConfig[chainId].DON_ID
    const stockName = "TSLA"

    const donIdBytes32 = ethers.utils.arrayify(`0x${DON_ID}`)

    console.log(await getGasPrice())

    const dStorageDeployment = await deployments.get("dStockSourceCodeStorage")
    const dStoarageAddress = dStorageDeployment.address

    const constructorArgs = [
        mintSourceCode,
        chainlinkSubId,
        FUNCTIONS_ROUTER,
        USDC,
        donIdBytes32,
        versionDon,
        slotDon,
        stockName,
        dStoarageAddress,
    ]

    const dStockDeploy = await deploy("dSTOCK", {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        gasMultiplier: gasMultiplier,
    })

    console.log(
        "----------------------- DEPLOY COMPLETED --------------------------",
    )

    const verifyContract = networkConfig[chainId].verify

    if (verifyContract) {
        await verify(dStockDeploy.address, constructorArgs)
        console.log(
            "----------------------- VERIFICATION COMPLETED --------------------------",
        )
    }
}

module.exports.tags = ["all", "dStock"]
