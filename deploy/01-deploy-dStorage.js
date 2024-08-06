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

    function getRandomInt() {
        const min = 1
        const max = 10000000
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const deployCompile = getRandomInt()

    await getGasPrice()

    const constructorArgs = [deployCompile]

    const dStorageDeploy = await deploy("dStockStorage", {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        gasMultiplier: gasMultiplier,
    })

    console.log(
        "----------------------- DEPLOY COMPLETED --------------------------",
    )

    const dStockStorageContract = new ethers.Contract(
        dStorageDeploy.address,
        dStorageDeploy.abi,
        getAccount("main", provider),
    )

    const verifyContract = networkConfig[chainId].verify

    if (verifyContract) {
        await verify(dStockStorageContract.address, constructorArgs)
        console.log(
            "----------------------- VERIFICATION COMPLETED --------------------------",
        )
    }
}

module.exports.tags = ["all", "dStorage"]
