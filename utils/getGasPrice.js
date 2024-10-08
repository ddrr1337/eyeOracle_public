const { ethers, network } = require("hardhat");

async function getGasPrice() {
  rpcUrl = network.config.url;
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const gasPrice = await provider.getFeeData();
  console.log("---------------- GAS PRICE --------------");
  console.log(
    "⛽ Gas Price gwei: ",
    parseFloat(gasPrice.maxFeePerGas / 10 ** 9)
  );
  console.log("----------------------------------------");

  console.log("lastBaseFeePerGas", gasPrice.lastBaseFeePerGas * 1);
  console.log("maxFeePerGas", gasPrice.maxFeePerGas * 1);
  console.log("maxPriorityFeePerGas", gasPrice.maxPriorityFeePerGas * 1);
  console.log("gasPrice", gasPrice.gasPrice * 1);

  return parseInt(gasPrice.maxFeePerGas);
}

module.exports = { getGasPrice };
