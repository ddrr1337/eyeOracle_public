const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)

    await getGasPrice()

    const dStockDeployment = await deployments.get("dSTOCK")
    //const dStockAddress = dStockDeployment.address
    const dStockAddress = "0x3B4f07f6BE386B46f60aE5F34B743179D17Bd593"
    const dStockAbi = dStockDeployment.abi

    const dStockContract = new ethers.Contract(
        dStockAddress,
        dStockAbi,
        account,
    )

    const mintCode = await dStockContract.getMintCode()

    console.log(mintCode)
    console.log("-------------------- MINT CODE -----------------------")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
