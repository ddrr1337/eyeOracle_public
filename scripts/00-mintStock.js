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
    const dStockAbi = dStockDeployment.abi

    const dStockAddress = "0xD5088f2d86F2A07e968d5134C8CF470858c3f0B7"
    const dStockContract = new ethers.Contract(
        dStockAddress,
        dStockAbi,
        account,
    )

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )

    const fundTx = await dStorageContract.fundAccount(BigInt(5000 * 1e6))
    await fundTx.wait(1)

    console.log(
        "-------------------- FUND ACCOUNT WITH USDC COMPLETED -----------------------",
    )

    const amount = BigInt("250")

    await dStockContract.sendMintRequest(amount)

    console.log(
        "-------------------- MINT REQUEST COMPLETED -----------------------",
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
