require("dotenv").config();
const { network, ethers } = require("hardhat");
const { requestQueue } = require("./queue");
const { networkConfig } = require("../helper-hardhat-config");
const winston = require("winston");
const { checkRedis } = require("../utils/checkRedis");

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

async function main() {
  const isRedisConnected = await checkRedis();

  if (!isRedisConnected) {
    logger.error("Redis server NOT CONNECTED");
    throw new Error("Redis connection failed. Exiting process.");
  }

  logger.info("Redis server ONLINE");

  const chainId = network.config.chainId;
  const oracleRouterAddress = networkConfig[chainId].ORACLE_ROUTER_ADDRESS;
  const oracleGridAddress = networkConfig[chainId].ORACLE_GRID_ADDRESS;

  const ORACLE_ROUTER_ABI = [
    "event OracleRequestHttp(uint256 indexed requestId,address indexed consumer,address indexed originalCaller, bytes request)",
  ];

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_RPC
  );

  const oracleRouter = new ethers.Contract(
    oracleRouterAddress,
    ORACLE_ROUTER_ABI,
    provider
  );

  // Escucha eventos
  oracleRouter.on(
    "OracleRequestHttp",
    async (requestId, consumer, originalCaller, request) => {
      logger.info(`Event detected: RequestId ${requestId.toString()}`);

      await requestQueue.add({
        requestId: requestId.toString(),
        consumer,
        originalCaller,
        request,
      });
    }
  );

  logger.info(
    `Listening OracleRouter at ${oracleRouterAddress} for OracleRequestHttp events...`
  );
  logger.info(`OracleGrid setted at ${oracleGridAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
