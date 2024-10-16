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

  return parseInt(gasPrice.maxFeePerGas);
}

module.exports = { getGasPrice };
