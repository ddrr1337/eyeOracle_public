require("dotenv").config();
const fs = require("fs");
const { networkConfig } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  let rpcUrl = network.config.url;
  let provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const gasMultiplier = 1.2;

  await getGasPrice();

  const oracleRouterDeployment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeployment.address;

  const constructorArgs = [oracleRouterAddress];

  const testerContractDeploy = await deploy("TesterContract", {
    from: deployer,
    args: constructorArgs,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    gasMultiplier: gasMultiplier,
  });

  console.log(
    "----------------------- TESTER CONTRACT DEPLOYED --------------------------"
  );

  const verifyContract = networkConfig[chainId].verify;

  if (verifyContract) {
    await verify(testerContractDeploy.address, constructorArgs);
    console.log(
      "----------------------- VERIFICATION COMPLETED --------------------------"
    );
  }
};

module.exports.tags = ["all", "testerContract"];
