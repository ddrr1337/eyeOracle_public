const { ethers, deployments, network } = require("hardhat");
const { requestQueue } = require("./queue");
const { sendRequest } = require("../utils/sendRequest");
const { getAccount } = require("../utils/getAccount");
const { decodeCBOR } = require("../utils/decodeCBOR");

const testerContractAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint256", name: "response", type: "uint256" },
    ],
    name: "fulfillRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  console.log("Worker ready for task...");
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_RPC
  );

  const oracleGridDeployment = await deployments.get("OracleGrid");
  const oracleGridAddress = oracleGridDeployment.address;
  const oracleGridAbi = oracleGridDeployment.abi;

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount("main", provider)
  );

  async function claimProcess(contract, requestId) {
    const ORACLE_ID = 1;
    try {
      const assignTaskTx = await contract.oracleAssignWork(
        requestId,
        ORACLE_ID
      );
      console.log("Tx: ", assignTaskTx.hash);
      return true;
    } catch (error) {
      return false;
    }
  }

  requestQueue.process(async (job) => {
    const { requestId, consumer, request } = job.data;

    try {
      console.log(`Processing request ${requestId}`);

      const success = await claimProcess(oracleGridContract, requestId);

      console.log("Success", success);
      if (success) {
        console.log(`Request ${requestId} processed successfully.`);

        const decodedRequest = await decodeCBOR(request);
        console.log("decoded", decodedRequest);

        const backendResponse = await sendRequest(requestId, decodedRequest);
        console.log(backendResponse.data);

        const consumerContract = new ethers.Contract(
          consumer,
          testerContractAbi,
          getAccount("main", provider)
        );

        await consumerContract.fulfillRequest(
          requestId,
          BigInt(backendResponse.data)
        );
        console.log(`Successfully fulfilled request ${requestId}`);
      } else {
        console.log(`Failed to process request ${requestId}`);
      }
    } catch (error) {
      console.error(`Error processing request ${requestId}: ${error.message}`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
