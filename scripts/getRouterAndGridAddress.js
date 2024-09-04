const { ethers, deployments, network } = require("hardhat");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );

  await getGasPrice();

  const oracleRouterDeplotment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeplotment.address;

  const oracleGridDeplotment = await deployments.get("OracleGrid");
  const oracleGridAddress = oracleGridDeplotment.address;

  console.log("Router Address: ", oracleRouterAddress);
  console.log("Grid Address: ", oracleGridAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
