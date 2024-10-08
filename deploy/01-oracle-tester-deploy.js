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
  const account = getAccount("main", provider);

  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const gasMultiplier = 1.2;

  await getGasPrice();

  const oracleRouterDeployment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeployment.address;
  const oracleRouterAbi = oracleRouterDeployment.abi;

  const oracleRouterContract = new ethers.Contract(
    oracleRouterAddress,
    oracleRouterAbi,
    account
  );

  const constructorArgs = [oracleRouterAddress];

  const exampleContractDeploy = await deploy("ExampleContract", {
    from: deployer,
    args: constructorArgs,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    gasMultiplier: gasMultiplier,
  });

  console.log(
    "----------------------- EXAMPLE CONTRACT DEPLOYED --------------------------"
  );

  const verifyContract = networkConfig[chainId].verify;

  if (verifyContract) {
    await verify(exampleContractDeploy.address, constructorArgs);
    console.log(
      "----------------------- VERIFICATION COMPLETED --------------------------"
    );
  }

  const addConsumerTx = await oracleRouterContract.addConsumer(
    exampleContractDeploy.address
  );
  console.log(
    "----------------------- ADD CONSUMER COMPLETED --------------------------"
  );
};

module.exports.tags = ["all", "example"];
