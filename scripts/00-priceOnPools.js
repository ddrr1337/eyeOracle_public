const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)
    const chainId = network.config.chainId
    const factoryAddress = networkConfig[chainId].UNISWAP_V2_FACTORY
    const addressUsdc = networkConfig[chainId].TESTER_USDC

    await getGasPrice()

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )

    const pricePools = await dStorageContract.getPriceOnPools(factoryAddress,addressUsdc)

    console.log("-------------------- USER BALANCES -----------------------")

    console.log(pricePools)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
