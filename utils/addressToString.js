function addressToString(address) {
    // Asegúrate de que la dirección está en minúsculas y sin prefijo '0x'.
    let cleanAddress = address.toLowerCase().replace(/^0x/, "")

    // Convierte la dirección (hex) a un BigInt (equivalente a uint256 en Solidity).
    let bigIntValue = BigInt("0x" + cleanAddress)

    // Convierte el BigInt a string.
    let stringValue = bigIntValue.toString()

    return stringValue
}

module.exports = { addressToString }
