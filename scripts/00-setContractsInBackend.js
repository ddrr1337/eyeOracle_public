const dns = require("node:dns")
dns.setDefaultResultOrder("ipv4first")

const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")
const { sendContracts } = require("../utils/sendContracts")

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

    const dStorageArray = await dStorageContract.getStocksArray()

    console.log("-------------------- dSTOCKs ARRAY -----------------------")

    console.log(dStorageArray)

    const localBackend = process.env.LOCAL_BACKEND
    const deployedBackend = process.env.DEPLOYED_BACKEND

    await sendContracts(dStorageArray, localBackend)
    await sendContracts(dStorageArray, deployedBackend)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
