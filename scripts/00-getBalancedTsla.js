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

    const dStockBalance = await dStockContract.balanceOf(account.address)

    console.log(
        "-------------------- BALANCE OF dStock -----------------------",
    )

    console.log(
        "Balance of account: ",
        account.address,
        "In ERC20",
        dStockContract.address,
    )
    console.log(parseFloat(dStockBalance), parseFloat(dStockBalance / 1e18))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
