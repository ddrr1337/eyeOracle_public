const cbor = require("cbor");

async function decodeCBOR(dataBuffer) {
  try {
    // Decodificar el Buffer CBOR
    const decodedData = await cbor.decodeFirst(dataBuffer);
    return decodedData;
  } catch (error) {
    console.error("Error decoding CBOR:", error);
    return null;
  }
}

module.exports = { decodeCBOR };
