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

    const dStorageDeploy = await deploy("dStockSourceCodeStorage", {
        from: deployer,
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

    const mintSourceCode = fs
        .readFileSync("./functions/sources/alpacaBuyStock.js")
        .toString()

    const redeemSourceCode = fs
        .readFileSync("./functions/sources/sellTslaAndSendUsdc.js")
        .toString()

    console.log(await getGasPrice())

    const setMintCodeTx =
        await dStockStorageContract.setMintCode(mintSourceCode)
    await setMintCodeTx.wait(1)
    console.log(
        "----------------------- MINT CODE UPLOADED --------------------------",
    )
    await dStockStorageContract.setRedeemCode(redeemSourceCode)

    console.log(
        "----------------------- REDEEM CODE UPLOADED --------------------------",
    )

    const verifyContract = networkConfig[chainId].verify

    if (verifyContract) {
        await verify(dStockStorageContract.address, [])
        console.log(
            "----------------------- VERIFICATION COMPLETED --------------------------",
        )
    }
}

module.exports.tags = ["all", "dStorage"]
