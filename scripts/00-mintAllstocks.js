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

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )

    const fundTx = await dStorageContract.fundAccount(BigInt(6000 * 1e6))
    await fundTx.wait(1)

    console.log(
        "-------------------- FUND ACCOUNT WITH USDC COMPLETED -----------------------",
    )

    const contractsArray = await dStorageContract.getStocksArray()

    for (const stockAddress of contractsArray) {
        const dStockContract = new ethers.Contract(
            stockAddress,
            dStockAbi,
            account,
        )

        const amount = BigInt(Math.floor(Math.random() * (550 - 250 + 1)) + 250)

        await dStockContract.sendMintRequest(amount)

        console.log(
            `-------------------- MINT REQUEST COMPLETED -----------------------`,
        )
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
