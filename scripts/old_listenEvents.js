require("dotenv").config();
const { ethers, deployments } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const cbor = require("cbor");
const { sendRequest } = require("../utils/sendRequest");

// Dirección del contrato desplegado
const ORACLE_ROUTER_ADDRESS = "0x48f8308b66eD7f135814b1F94Bc828a9a68a28b6";

// ABI del contrato
const ORACLE_ROUTER_ABI = [
  "event OracleRequestHttp(uint256 indexed requestId,address indexed consumer, bytes request)",
];

const consumerContractAbi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "response",
        type: "uint256",
      },
    ],
    name: "fulfillRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Configura el proveedor
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC);

// Crea una instancia del contrato
const oracleRouter = new ethers.Contract(
  ORACLE_ROUTER_ADDRESS,
  ORACLE_ROUTER_ABI,
  provider
);

// Función claimProcess que retorna true o false
async function claimProcess(contract, requestId) {
  const ORACLE_ID = 1;
  try {
    const assignTaskTx = await contract.oracleAssignWork(requestId, ORACLE_ID);

    return true;
  } catch (error) {
    return false;
  }
}

async function decodeAndPrintCBOR(request) {
  try {
    // Decodifica el request en formato CBOR
    const decodedData = cbor.decodeFirstSync(
      Buffer.from(request.slice(2), "hex")
    );
    console.log("Decoded CBOR data:", decodedData);
    return decodedData;
  } catch (error) {
    console.error("Failed to decode CBOR data:", error);
  }
}

async function main() {
  const oracleGridDeployment = await deployments.get("OracleGrid");
  const oracleGridAddress = oracleGridDeployment.address;
  const oracleGridAbi = oracleGridDeployment.abi;

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount("main", provider)
  );

  console.log(
    "--------------------- LISTENING FOR EVENTS -------------------------"
  );

  // Escucha eventos
  oracleRouter.on("OracleRequestHttp", async (requestId, consumer, request) => {
    console.log(`Event detected:`);
    console.log(`RequestId: ${requestId.toString()}`);
    console.log(`Request Data (hex): ${request}`);
    console.log(`Consumer: ${consumer}`);

    // Llama a claimProcess y chequea el resultado
    const success = await claimProcess(oracleGridContract, requestId);
    if (success) {
      console.log(`Request ${requestId.toString()} processed successfully.`);

      // Decodifica el CBOR request e imprime el resultado
      const decodedRequest = await decodeAndPrintCBOR(request);

      const backendResponse = await sendRequest(
        requestId.toString(),
        decodedRequest
      );

      console.log("BACKEND RESPONSE:", backendResponse);

      console.log("requestId", requestId);
      console.log("response", backendResponse.data);

      const consumerContract = new ethers.Contract(
        consumer,
        consumerContractAbi,
        getAccount("main", provider)
      );

      const responseTx = await consumerContract.fulfillRequest(
        requestId,
        backendResponse.data
      );

      console.log("Response TX:", responseTx.hash);
    } else {
      console.log(`Failed to process request ${requestId.toString()}.`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
