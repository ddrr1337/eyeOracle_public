require("dotenv").config()
const { ethers } = require("ethers")

// Obtener las claves privadas del archivo .env
const privateKey1 = process.env.PRIVATE_KEY
const privateKey2 = process.env.PRIVATE_KEY_2

// Verificar que las claves privadas existan
if (!privateKey1 || !privateKey2) {
    throw new Error(
        "PRIVATE_KEY o PRIVATE_KEY_2 no están definidas en el archivo .env",
    )
}

/**
 * Función para obtener la billetera según el tipo (main o sec)
 * @param {string} type - El tipo de billetera a obtener ('main' o 'sec')
 * @param {ethers.providers.Provider} provider - El proveedor para conectar la billetera
 * @returns {ethers.Wallet} - La billetera correspondiente conectada al proveedor
 */
function getAccount(type, provider) {
    if (type === "main") {
        return new ethers.Wallet(privateKey1, provider)
    } else if (type === "sec") {
        return new ethers.Wallet(privateKey2, provider)
    } else {
        throw new Error("El tipo debe ser 'main' o 'sec'")
    }
}

module.exports = { getAccount }
