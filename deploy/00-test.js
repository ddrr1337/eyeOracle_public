require("dotenv").config()
const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let rpcUrl = network.config.url
    let provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    // Desplegar FactoryContract
    const factoryTest = await deploy("FactoryContract", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("FactoryContract deployed at:", factoryTest.address)

    // Crear un contrato en ethers.js para FactoryContract
    const factoryAbi = factoryTest.abi
    const factoryContract = new ethers.Contract(
        factoryTest.address,
        factoryAbi,
        provider,
    )

    // Obtener la dirección de TesterContract desde FactoryContract
    const testerContractAddress = await factoryContract.testerContractAddress()
    console.log("TesterContract Address:", testerContractAddress)

    // Obtener el bytecode del contrato TesterContract
    const testerCode = await provider.getCode(testerContractAddress)
    console.log("TesterContract Bytecode:", testerCode)

    // Analizar el bytecode para obtener los parámetros del constructor
    // Nota: El bytecode incluye el constructor y otros datos, por lo que es necesario extraer los datos correctos
    const constructorData = testerCode.slice(2) // Remove '0x' prefix
    // Encontrar el lugar donde el constructor comienza puede ser complejo, aquí asumimos que el parámetro está al principio
    const parameterHex = constructorData.slice(0, 64) // La longitud puede variar dependiendo del tipo de parámetro
    const parameter = ethers.BigNumber.from("0x" + parameterHex).toString()
    console.log("Constructor Parameter:", parameter)
}

module.exports.tags = ["all", "test"]
