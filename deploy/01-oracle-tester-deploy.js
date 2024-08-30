require("dotenv").config();
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

  const oracleGridDeployment = await deployments.get("OracleGrid");
  const oracleGridAddress = oracleGridDeployment.address;
  const oracleGridAbi = oracleGridDeployment.abi;

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    getAccount("main", provider)
  );

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

  const addConsumer = await oracleGridContract.addConsumer(
    testerContractDeploy.address
  );

  console.log(
    "----------------------- ADD CONSUMER COMPLETED --------------------------"
  );
};

module.exports.tags = ["all", "testerContract"];
