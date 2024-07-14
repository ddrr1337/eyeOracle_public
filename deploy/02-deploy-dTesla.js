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
    const TSLA_PRICE_FEED = networkConfig[chainId].TSLA_PRICE_FEED
    const USDC_PRICE_FEED = networkConfig[chainId].USDC_PRICE_FEED
    const USDC = networkConfig[chainId].USDC
    const DON_ID = networkConfig[chainId].DON_ID

    const donIdBytes32 = ethers.utils.arrayify(`0x${DON_ID}`)

    const constructorArgs = [
        mintSourceCode,
        chainlinkSubId,
        FUNCTIONS_ROUTER,
        TSLA_PRICE_FEED,
        USDC_PRICE_FEED,
        USDC,
        donIdBytes32,
        versionDon,
        slotDon,
    ]

    console.log(await getGasPrice())

    const dTeslaDeploy = await deploy("dTESLA", {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        gasMultiplier: gasMultiplier,
    })

    console.log(
        "----------------------- DEPLOY COMPLETED --------------------------",
    )

    const dTeslaContract = new ethers.Contract(
        dTeslaDeploy.address,
        dTeslaDeploy.abi,
        getAccount("main", provider),
    )

    const redeemSourceCode = fs
        .readFileSync("./functions/sources/sellTslaAndSendUsdc.js")
        .toString()

    console.log(await getGasPrice())

    await dTeslaContract.setRedeemCode(redeemSourceCode)

    console.log(
        "----------------------- REDEEM CODE UPLOADED --------------------------",
    )

    const verifyContract = networkConfig[chainId].verify

    if (verifyContract) {
        await verify(dTeslaDeploy.address, constructorArgs)
        console.log(
            "----------------------- VERIFICATION COMPLETED --------------------------",
        )
    }
}

module.exports.tags = ["all", "dTesla"]
