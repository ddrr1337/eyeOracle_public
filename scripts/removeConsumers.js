const { ethers, network, deployments } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { networkConfig } = require("../helper-hardhat-config")
const { removeContract } = require("../utils/saveRemoveContracts")
const fs = require("fs")
const path = require("path")

async function main() {
    const deploymentsPath = path.join(__dirname, `../deployments/${"sepolia"}`)
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)
    const chainId = network.config.chainId
    const donIdAddress = networkConfig[chainId].DON_ID_ADDRESS
    const donIdSubscription = networkConfig[chainId].DON_ID_SUBSCRIPTION

    const IChainlinkConsumerArtifact =
        await deployments.getArtifact("IChainlinkConsumer")

    const chainlinkConsumerContract = new ethers.Contract(
        donIdAddress,
        IChainlinkConsumerArtifact.abi,
        account,
    )

    const stockContractsRaw = fs.readFileSync(
        path.join(__dirname, `../deployedContracts.json`),
    )
    const stockContracts = JSON.parse(stockContractsRaw)

    console.log(stockContracts)

    for (const stockContract of stockContracts) {
        const removeContractTx = await chainlinkConsumerContract.removeConsumer(
            donIdSubscription,
            stockContract.address,
        )
        await removeContractTx.wait()
        removeContract(stockContract.address)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
