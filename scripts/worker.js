const { ethers, deployments, network } = require("hardhat");
const { requestQueue } = require("./queue");
const { sendRequest } = require("../utils/sendRequest");
const { getAccount } = require("../utils/getAccount");
const { decodeCBOR } = require("../utils/decodeCBOR");
const { networkConfig } = require("../helper-hardhat-config");
const oracleGridAbi =
  require("../artifacts/contracts/oracle/OracleGrid.sol/OracleGrid.json").abi;
const oracleRouterAbi =
  require("../artifacts/contracts/oracle/OracleRouter.sol/OracleRouter.json").abi;

const winston = require("winston");

const SLEEP_TIME = 1000;
const MAX_GAS_ON_CALLBACK = process.env.MAX_GAS_ON_CALLBACK;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "worker.log" }),
  ],
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const ORACLE_ID = process.env.ORACLE_ID;

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_RPC
  );
  const chainId = network.config.chainId;

  const oracleGridAddress = networkConfig[chainId].ORACLE_GRID_ADDRESS;
  const oracleRouterAddress = networkConfig[chainId].ORACLE_ROUTER_ADDRESS;

  logger.info(
    `Node ${ORACLE_ID} Worker attached to OracleRouter ${oracleRouterAddress} ready for task...`
  );

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount(process.env.NODE_SELECTED_WALLET, provider)
  );

  async function claimProcess(contract, requestId) {
    const ORACLE_ID = process.env.ORACLE_ID;
    await sleep(SLEEP_TIME * process.env.ORACLE_WAIT);

    try {
      const assignTaskTx = await contract.oracleAssignWork(
        requestId,
        ORACLE_ID
      );
      const receipt = await assignTaskTx.wait();

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
    const { requestId, consumer, originalCaller, request } = job.data;

    try {
      logger.info(`Processing request ${requestId}...`);

      const success = await claimProcess(oracleGridContract, requestId);

      if (success) {
        logger.info(
          `Task of Request ${requestId} assigned to this node, node_id: ${ORACLE_ID}`
        );

        const decodedRequest = await decodeCBOR(request);
        logger.info(`Decoded request: ${JSON.stringify(decodedRequest)}`);

        const token = process.env.NODE_ACCESS;

        // this headers are setted to call a python django backend, modify this headers depending of your backend
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        let backendResponse;
        try {
          backendResponse = await sendRequest(
            requestId,
            decodedRequest,
            originalCaller,
            headers
          );

          if (!backendResponse || !backendResponse.data) {
            logger.error(
              "Invalid response from backend, returning uint256=0 to consumer contract"
            );
            backendResponse = { data: 0 };
          }
        } catch (sendRequestError) {
          logger.error(`Error in sendRequest: ${sendRequestError.message}`);
          logger.error(
            "Error in sendRequest, returning uint256=0 to consumer contract"
          );
          backendResponse = { data: 0 };
        }

        const routerContract = new ethers.Contract(
          oracleRouterAddress,
          oracleRouterAbi,
          getAccount(process.env.NODE_SELECTED_WALLET, provider)
        );

        await routerContract.fulfill(
          consumer,
          requestId,
          BigInt(backendResponse.data), //.data is my response from my API {'data':<int>}, change depending of your API reposnse
          {
            gasLimit: MAX_GAS_ON_CALLBACK,
          }
        );

        logger.info(`${decodedRequest.method} request ended`);
        logger.info(`BACKEND response: ${backendResponse.data}`);
        logger.info(
          `Successfully fulfilled request to consumer contract ${requestId}`
        );
      } else {
        logger.info(`Request ${requestId} Already Taken `);
      }
    } catch (error) {
      logger.error(`Error processing request ${requestId}: ${error.message}`);
    }
  });
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
