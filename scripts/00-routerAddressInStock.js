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

  const dStockContract = new ethers.Contract(dStockAddress, dStockAbi, account);

  const routerAddress = await dStockContract.i_FUNCTIONS_ROUTER();

  console.log("dStock Address: ", dStockAddress);

  console.log("Router Address: ", routerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
