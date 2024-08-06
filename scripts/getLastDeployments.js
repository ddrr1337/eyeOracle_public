const { ethers, deployments, network } = require("hardhat")
const { getAccount } = require("../utils/getAccount")
const { getGasPrice } = require("../utils/getGasPrice")

async function main() {
    await getGasPrice()

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address

    console.log("-------------------- DEPLOYMENTS -----------------------")

    console.log("dSTORAGE: ", dStorageAddress)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
