const { ethers, deployments, network } = require("hardhat")
const { uploadSecrets } = require("../functions/uploadSecrets")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const account = getAccount("main", provider)
    const chainId = network.config.chainId

    await getGasPrice()

    const versionDon = await uploadSecrets(account, chainId)
    const slotDon = 0
    const dTeslaDeployment = await deployments.get("dTESLA")
    const dTeslaAddress = dTeslaDeployment.address
    const dTeslaAbi = dTeslaDeployment.abi

    const dTeslaContract = new ethers.Contract(
        dTeslaAddress,
        dTeslaAbi,
        account,
    )

    await dTeslaContract.changeSlotAndVersionDon(versionDon, slotDon)

    const newVersionUpdated = await dTeslaContract.secretVersion()

    console.log("-------------------- UPDATED SECRETS -----------------------")

    console.log("NEW VERSION AND SLOT: ")
    console.log("VERSION:", parseInt(newVersionUpdated))
    console.log("SLOT: ", slotDon)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
