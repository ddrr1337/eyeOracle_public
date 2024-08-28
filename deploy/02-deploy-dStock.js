require("dotenv").config();
const fs = require("fs");

const { networkConfig } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const { getGasPrice } = require("../utils/getGasPrice");
const { sendContracts } = require("../utils/sendContracts");

const { getAccount } = require("../utils/getAccount");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const STOCKS = ["TSLA", "AAPL", "KO", "AMZN", "MSFT", "GOOG"];
  const { deploy, log } = deployments;
  let rpcUrl = network.config.url;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const oracleRouterAddress = networkConfig[chainId].ORACLE_ROUTER_ADDRESS;
  const uniswapFactory = networkConfig[chainId].UNISWAP_V2_FACTORY;

  const dStorageDeployment = await deployments.get("dStockStorage");
  const dStoarageAddress = dStorageDeployment.address;
  const dStoarageAbi = dStorageDeployment.abi;

  const MMKTokenDeployment = await deployments.get("MMKToken");
  const MMKTokenAddress = MMKTokenDeployment.address;

  function annualRate(rate) {
    const aRate = 1 * 10 ** 27 + (rate / (365 * 86400)) * 10 ** 27;
    console.log("rate", BigInt(Math.floor(aRate)));
    return BigInt(Math.floor(aRate));
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const account = getAccount("main", provider);

  const gasMultiplier = 1.2;
  const USDC = networkConfig[chainId].USDC;

  console.log(await getGasPrice());

  const verifyContract = networkConfig[chainId].verify;

  for (const stockName of STOCKS) {
    const constructorStockArgs = [
      oracleRouterAddress,
      USDC,
      stockName,
      uniswapFactory,
      dStoarageAddress,
      MMKTokenAddress,
      annualRate(0.05).toString(),
    ];

    const dStockDeploy = await deploy("dSTOCK", {
      from: deployer,
      args: constructorStockArgs,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
      gasMultiplier: gasMultiplier,
    });

    console.log(
      `----------------------- DEPLOY COMPLETED OF ${stockName} --------------------------`
    );

    if (verifyContract) {
      await verify(dStockDeploy.address, constructorStockArgs);

      console.log(
        "----------------------- VERIFICATION COMPLETED --------------------------"
      );
    }
    break;
  }

  const dStorageContract = new ethers.Contract(
    dStoarageAddress,
    dStoarageAbi,
    account
  );

  const dStorageArray = await dStorageContract.getStocksArray();
  const localBackend = process.env.LOCAL_BACKEND;
  const deployedBackend = process.env.DEPLOYED_BACKEND;

  await sendContracts(dStorageArray, localBackend);
  await sendContracts(dStorageArray, deployedBackend);

  console.log(
    "----------------------- CONTRACTS UPDATED IN BACKEND --------------------------"
  );
};

module.exports.tags = ["all", "dStock"];
