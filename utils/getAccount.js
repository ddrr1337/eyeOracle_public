require("dotenv").config();
const { ethers } = require("ethers");

// Obtener las claves privadas del archivo .env
const privateKey1 = process.env.PRIVATE_KEY;
const privateKey2 = process.env.PRIVATE_KEY_2;
const privateKey3 = process.env.PRIVATE_KEY_3;

// Verificar que las claves privadas existan
if (!privateKey1 || !privateKey2 || !privateKey3) {
  throw new Error(
    "PRIVATE_KEY o PRIVATE_KEY_2 no están definidas en el archivo .env"
  );
}

/**
 * Función para obtener la billetera según el tipo (main o sec)
 * @param {string} type - El tipo de billetera a obtener ('main' o 'sec')
 * @param {ethers.providers.Provider} provider - El proveedor para conectar la billetera
 * @returns {ethers.Wallet} - La billetera correspondiente conectada al proveedor
 */
function getAccount(type, provider) {
  if (type === "main") {
    return new ethers.Wallet(privateKey1, provider);
  } else if (type === "sec") {
    return new ethers.Wallet(privateKey2, provider);
  } else if (type === "third") {
    return new ethers.Wallet(privateKey3, provider);
  } else {
    throw new Error("Wallet must be: main,sec,third");
  }
}

module.exports = { getAccount };
