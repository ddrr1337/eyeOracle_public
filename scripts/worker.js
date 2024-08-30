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
    ` Node ${ORACLE_ID} Worker attached to OracleRouter ${oracleRouterAddress} ready for task...`
  );

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount("main", provider)
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
    const { requestId, consumer, request } = job.data;

    try {
      logger.info(`Processing request ${requestId}`);

      const success = await claimProcess(oracleGridContract, requestId);

      logger.info(`Task assignment success? ${success}`);
      if (success) {
        logger.info(`Request ${requestId} processed successfully.`);

        const decodedRequest = await decodeCBOR(request);
        logger.info(`Decoded request: ${JSON.stringify(decodedRequest)}`);

        const token = process.env.NODE_ACCESS;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const backendResponse = await sendRequest(
          requestId,
          decodedRequest,
          headers
        );

        const routerContract = new ethers.Contract(
          oracleRouterAddress,
          oracleRouterAbi,
          getAccount("main", provider)
        );

        await routerContract.fulfill(
          consumer,
          requestId,
          BigInt(backendResponse.data)
        );

        logger.info(`POST request successful`);
        logger.info(`BACKEND response: ${backendResponse.data}`);
        logger.info(`Successfully fulfilled request ${requestId}`);
      } else {
        logger.info(`Request Already Taken ${requestId}`);
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
