const { ethers, network, deployments } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { networkConfig } = require("../helper-hardhat-config")
const { saveContract } = require("../utils/saveRemoveContracts")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)
    const chainId = network.config.chainId
    const donIdAddress = networkConfig[chainId].DON_ID_ADDRESS
    const donIdSubscription = networkConfig[chainId].DON_ID_SUBSCRIPTION

    console.log("Subscription ID:", donIdSubscription)

    // Cargar el ABI desde los artefactos compilados por Hardhat
    const IChainlinkConsumerArtifact =
        await deployments.getArtifact("IChainlinkConsumer")

    // Crear una instancia del contrato usando el ABI y la dirección
    const chainlinkConsumerContract = new ethers.Contract(
        donIdAddress,
        IChainlinkConsumerArtifact.abi,
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

    const dStorageArray = await dStorageContract.getStocksArray()
    console.log("Deployed Stocks Array:", dStorageArray)

    console.log(
        "Chainlink Consumer Contract Address:",
        chainlinkConsumerContract.address,
    )

    console.log(dStorageArray)

    for (const stockAddress of dStorageArray) {
        try {
            const addConsumerTx = await chainlinkConsumerContract.addConsumer(
                donIdSubscription,
                stockAddress.stockAddress,
            )
            await addConsumerTx.wait()
            console.log(`Added consumer: ${stockAddress.stockAddress}`)
            saveContract(stockAddress.stockAddress, stockAddress.name)
        } catch (error) {
            console.error(
                `Failed to add consumer for address ${stockAddress.stockAddress}:`,
                error,
            )
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
