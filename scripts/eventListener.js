require("dotenv").config();
const { network, ethers } = require("hardhat");
const { requestQueue } = require("./queue");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  const now = new Date();
  const formattedDate = now.toDateString(); // "Mon Aug 29 2024"
  const formattedTime = now.toLocaleTimeString("en-US"); // "5:30:15 PM"

  const dateTime = `[${formattedDate} | ${formattedTime}]`;

  const chainId = network.config.chainId;
  const oracleRouterAddress = networkConfig[chainId].ORACLE_ROUTER_ADDRESS;

  const ORACLE_ROUTER_ABI = [
    "event OracleRequestHttp(uint256 indexed requestId,address indexed consumer, bytes request)",
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
  oracleRouter.on("OracleRequestHttp", async (requestId, consumer, request) => {
    console.log(
      `${dateTime} Event detected: RequestId ${requestId.toString()}`
    );

    await requestQueue.add({
      requestId: requestId.toString(),
      consumer,
      request,
    });
  });

  console.log(`${dateTime} Listening for OracleRequestHttp events...`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
