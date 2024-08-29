const { ethers, deployments, network } = require("hardhat");
const { requestQueue } = require("./queue");
const { sendRequest } = require("../utils/sendRequest");
const { getAccount } = require("../utils/getAccount");
const { decodeCBOR } = require("../utils/decodeCBOR");
const { networkConfig } = require("../helper-hardhat-config");
const oracleGridAbi =
  require("../artifacts/contracts/oracle/OracleGrid.sol/OracleGrid.json").abi;

const SLEEP_TIME = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const chainId = network.config.chainId;

  const oracleGridAddress = networkConfig[chainId].ORACLE_GRID_ADDRESS;

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount("main", provider)
  );

  async function claimProcess(contract, requestId) {
    const ORACLE_ID = process.env.ORACLE_ID;
    console.log("start_wait");
    await sleep(SLEEP_TIME * process.env.ORACLE_WAIT);
    console.log("stop wait");
    try {
      const assignTaskTx = await contract.oracleAssignWork(
        requestId,
        ORACLE_ID
      );
      const receipt = await assignTaskTx.wait();
      console.log("Tx Success?: ", receipt.status === 1 ? true : false);
      if (receipt.status === 1) {
        return true;
      } else {
        return false;
      }
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
        console.log(`Request Already Taken ${requestId}`);
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
