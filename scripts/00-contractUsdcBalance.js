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

    const contractUsdcBalance = await dStockContract.userBalance(
        account.address,
    )

    console.log(
        "-------------------- BALANCE OF USDC IN CONTRACT -----------------------",
    )

    console.log("Balance of USDC in contract: ", account.address)
    console.log(
        parseInt(contractUsdcBalance),
        parseFloat(contractUsdcBalance / 1e6),
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
