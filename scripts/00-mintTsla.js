const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)

    await getGasPrice()

    const dTeslaDeployment = await deployments.get("dTESLA")
    const dTeslaAddress = dTeslaDeployment.address
    const dTeslaAbi = dTeslaDeployment.abi

    const dTeslaContract = new ethers.Contract(
        dTeslaAddress,
        dTeslaAbi,
        account,
    )

    console.log(dTeslaContract.address)

    const amount = BigInt("250")

    await dTeslaContract.sendMintRequest(amount)

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
