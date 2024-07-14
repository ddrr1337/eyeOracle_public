const { ethers, deployments } = require("hardhat")

async function main() {
    // Obtén el contrato desplegado usando hardhat-deploy
    const { deployer } = await getNamedAccounts()
    const { address } = await deployments.get("dTESLA")

    const dTeslaContract = await ethers.getContractAt("dTESLA", address)

    // Ahora puedes interactuar con el contrato
    const testerBool = false
    await dTeslaContract.testBool(testerBool)

    console.log("testBool llamada exitosamente con el valor:", testerBool)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
