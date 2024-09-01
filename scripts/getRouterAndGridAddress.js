const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const account = getAccount("sec", provider);

  await getGasPrice();

  const oracleRouterDeplotment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeplotment.address;

  const oracleGridDeplotment = await deployments.get("OracleRouter");
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
