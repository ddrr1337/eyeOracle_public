const fs = require("fs")
const path = require("path")

/**
 * Guarda una dirección en un archivo JSON en un formato de array de objetos.
 * @param {string} address - La dirección del contrato a guardar.
 * @param {string} contractName - El nombre del contrato.
 */
function saveContract(address, contractName) {
    const deploymentsPath = path.join(__dirname, "../deployedContracts.json")
    let deployedContracts = []

    // Cargar las direcciones existentes si el archivo ya existe
    if (fs.existsSync(deploymentsPath)) {
        deployedContracts = JSON.parse(fs.readFileSync(deploymentsPath))
    }

    // Agregar el nuevo contrato al array
    deployedContracts.push({
        name: contractName,
        address: address,
    })

    // Guardar el array actualizado en el archivo JSON
    fs.writeFileSync(
        deploymentsPath,
        JSON.stringify(deployedContracts, null, 2),
    )

    console.log(`Contract ${contractName} deployed to: ${address}`)
    console.log(`Address saved to: ${deploymentsPath}`)
}

/**
 * Elimina una dirección del archivo JSON.
 * @param {string} address - La dirección del contrato a eliminar.
 */
function removeContract(address) {
    const deploymentsPath = path.join(__dirname, "../deployedContracts.json")
    let deployedContracts = []

    // Cargar las direcciones existentes si el archivo ya existe
    if (fs.existsSync(deploymentsPath)) {
        deployedContracts = JSON.parse(fs.readFileSync(deploymentsPath))
    }

    // Filtrar el array para eliminar el contrato con la dirección dada
    deployedContracts = deployedContracts.filter(
        (contract) => contract.address !== address,
    )

    // Guardar el array actualizado en el archivo JSON
    fs.writeFileSync(
        deploymentsPath,
        JSON.stringify(deployedContracts, null, 2),
    )

    console.log(`Address ${address} removed from deployedContracts.json`)
}

module.exports = { saveContract, removeContract }
