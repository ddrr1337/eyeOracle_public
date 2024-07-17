const { ethers, deployments, network } = require("hardhat")
const { uploadSecrets } = require("../functions/uploadSecrets")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")
const fs = require("fs")
const { networkConfig } = require("../helper-hardhat-config")
const { incrementNonce } = require("../utils/incrementNonce")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)
    const chainId = network.config.chainId

    await getGasPrice()

    const chainlinkSubId = process.env.CHAINLINK_SUB_ID
    const DON_ID = networkConfig[chainId].DON_ID
    const donIdBytes32 = ethers.utils.arrayify(`0x${DON_ID}`)

    const versionDon = await uploadSecrets(account, chainId)
    const slotDon = 0
    const dStorageDeployment = await deployments.get("dStockSourceCodeStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStockDeployment = await deployments.get("dSTOCK")
    const dStockAddress = dStockDeployment.address
    const dStockAbi = dStockDeployment.abi

    const dStockStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )
    const dStockContract = new ethers.Contract(
        dStockAddress,
        dStockAbi,
        account,
    )

    const mintSourceCode = fs
        .readFileSync("./functions/sources/alpacaBuyStock.js")
        .toString()

    const redeemSourceCode = fs
        .readFileSync("./functions/sources/sellTslaAndSendUsdc.js")
        .toString()

    const setMintCodeTx =
        await dStockStorageContract.setMintCode(mintSourceCode)
    await setMintCodeTx.wait(1)
    console.log(
        "----------------------- MINT CODE UPDATED --------------------------",
    )
    const setRedeemCondeTx =
        await dStockStorageContract.setRedeemCode(redeemSourceCode)

    await setRedeemCondeTx.wait(1)

    console.log(
        "----------------------- REDEEM CODE UPDATED --------------------------",
    )

    const setSubIdDonIdTx = await dStockStorageContract.changeSubIdAndDonId(
        chainlinkSubId,
        donIdBytes32,
    )

    await setSubIdDonIdTx.wait(1)

    const setSlotVersionTx =
        await dStockStorageContract.changeSlotAndVersionDon(versionDon, slotDon)

    await setSlotVersionTx.wait(1)

    console.log(
        "----------------------- LINK_ID,DONID,SLOR,VERSION SETTED --------------------------",
    )

    const nextNonce = await incrementNonce()
    console.log("nonce", nextNonce)
    const setNewNonceTx = await dStockContract.changeNonce(nextNonce)

    console.log(
        "----------------------- NONCE UPDATED --------------------------",
    )

    console.log("NEW VERSION AND SLOT: ")
    console.log("LINK_ID:", chainlinkSubId)
    console.log("DON_ID:", DON_ID)
    console.log("VERSION:", parseInt(versionDon))
    console.log("SLOT: ", slotDon)
    console.log("dSTOCK address: ", dStockContract.address)
    console.log("dSTORAGE sddress: ", dStockStorageContract.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
