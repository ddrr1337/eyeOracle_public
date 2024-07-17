require("dotenv").config()
const fs = require("fs")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { getAccount } = require("../utils/getAccount")
const { uploadSecrets } = require("../functions/uploadSecrets")
const { getGasPrice } = require("../utils/getGasPrice")
const { incrementNonce } = require("../utils/incrementNonce")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    let rpcUrl = network.config.url
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const gasMultiplier = 1.2
    const FUNCTIONS_ROUTER = networkConfig[chainId].FUNCTIONS_ROUTER
    const USDC = networkConfig[chainId].USDC
    const stockName = "TSLA"

    console.log(await getGasPrice())

    const dStorageDeployment = await deployments.get("dStockSourceCodeStorage")
    const dStoarageAddress = dStorageDeployment.address

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
