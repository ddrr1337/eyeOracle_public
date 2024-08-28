const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");
const { decodeCBOR } = require("../utils/decodeCBOR");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const account = getAccount("sec", provider);

  await getGasPrice();

  const oracleRouterDeplotment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeplotment.address;
  const oracleRouterAbi = oracleRouterDeplotment.abi;

  console.log("Router Address: ", oracleRouterAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
