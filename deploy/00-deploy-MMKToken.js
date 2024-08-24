require("dotenv").config()
const fs = require("fs")
const { networkConfig } = require("../helper-hardhat-config")
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

    const gasMultiplier = 1.2

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStoarageAddress = dStorageDeployment.address

    await getGasPrice()

    const constructorArgs = [dStoarageAddress]

    const MMTokenDeploy = await deploy("MMKToken", {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        gasMultiplier: gasMultiplier,
    })

    console.log(
        "----------------------- DEPLOY COMPLETED --------------------------",
    )

    const MMTokenContract = new ethers.Contract(
        MMTokenDeploy.address,
        MMTokenDeploy.abi,
        getAccount("main", provider),
    )

    const verifyContract = networkConfig[chainId].verify

    if (verifyContract) {
        await verify(MMTokenContract.address, constructorArgs)
        console.log(
            "----------------------- VERIFICATION COMPLETED --------------------------",
        )
    }
}

module.exports.tags = ["all", "MMKToken"]
