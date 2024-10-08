const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  let rpcUrl = network.config.url;
  let provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const account = getAccount("main", provider);

  const gasPrice = await getGasPrice();

  const gasDeployment = await deployments.get("GasTest");
  const gasAddress = gasDeployment.address;
  const gasAbi = gasDeployment.abi;

  console.log("gasTest", gasAddress);

  const gasContract = new ethers.Contract(gasAddress, gasAbi, account);

  const gas = await gasContract.gasTest();
  await gas.wait();

  const gasPriceOnChain = await gasContract.gasPrice();

  console.log("gasPriceOnChain", gasPriceOnChain * 1);
  console.log("gasPriceOffChain", gasPrice * 1);

  console.log(
    "-------------------- GAS TEST COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
