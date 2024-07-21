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

    const chainlinkSubId = process.env.CHAINLINK_SUB_ID

    const gasMultiplier = 1.2

    const slotDon = 0
    const versionDon = await uploadSecrets(
        getAccount("main", provider),
        chainId,
    )

    const DON_ID = networkConfig[chainId].DON_ID
    const donIdBytes32 = ethers.utils.arrayify(`0x${DON_ID}`)

    await getGasPrice()

    const constructorArgs = []

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

    const mintSourceCode = fs
        .readFileSync("./functions/sources/alpacaBuyStock.js")
        .toString()

    const redeemSourceCode = fs
        .readFileSync("./functions/sources/alpacaSellStock.js")
        .toString()

    const setMintCodeTx =
        await dStockStorageContract.setMintCode(mintSourceCode)
    await setMintCodeTx.wait(1)
    console.log(
        "----------------------- MINT CODE UPLOADED --------------------------",
    )
    const setRedeemCondeTx =
        await dStockStorageContract.setRedeemCode(redeemSourceCode)

    await setRedeemCondeTx.wait(1)

    console.log(
        "----------------------- REDEEM CODE UPLOADED --------------------------",
    )

    const setSubIdDonIdTx = await dStockStorageContract.changeSubIdAndDonId(
        chainlinkSubId,
        donIdBytes32,
    )

    await setSubIdDonIdTx.wait(1)

    const setSlotVersionTx =
        await dStockStorageContract.changeSlotAndVersionDon(versionDon, slotDon)

    console.log(
        "----------------------- ROUTER,LINKID,DONID,SLOR,VERSION SETTED --------------------------",
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
