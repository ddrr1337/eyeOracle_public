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

    const dTeslaBalance = await dTeslaContract.balanceOf(account.address)

    console.log(
        "-------------------- BALANCE OF dTESLA -----------------------",
    )

    console.log(
        "Balance of account: ",
        account.address,
        "In ERC20",
        dTeslaContract.address,
    )
    console.log(parseFloat(dTeslaBalance), parseFloat(dTeslaBalance / 1e18))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
