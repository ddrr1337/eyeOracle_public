const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)

    await getGasPrice()

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )

    const userBalances = await dStorageContract.getPriceOnPools(account.address)

    console.log("-------------------- USER BALANCES -----------------------")

    console.log(userBalances)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
