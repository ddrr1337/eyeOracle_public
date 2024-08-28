const cbor = require("cbor");

async function decodeCBOR(request) {
  try {
    const decodedData = cbor.decodeFirstSync(
      Buffer.from(request.slice(2), "hex")
    );

    return decodedData;
  } catch (error) {
    console.error("Failed to decode CBOR data:", error);
  }
}

module.exports = { decodeCBOR };
