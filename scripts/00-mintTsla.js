const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)

    await getGasPrice()

    const dStockDeployment = await deployments.get("dSTOCK")
    const dStockAddress = dStockDeployment.address
    const dStockAbi = dStockDeployment.abi

    const dStockContract = new ethers.Contract(
        dStockAddress,
        dStockAbi,
        account,
    )

    console.log("Instance contract address: ", dStockContract.address)

    const fundTx = await dStockContract.fundAccount(BigInt(1000 * 1e6))
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
