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

  const dStockDeployment = await deployments.get("dSTOCK");
  const dStockAddress = dStockDeployment.address;
  const dStockAbi = dStockDeployment.abi;

  console.log(dStockAddress);

  console.log(
    "-------------------- SEND REQUEST COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
