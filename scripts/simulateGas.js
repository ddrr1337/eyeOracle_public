const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const account = getAccount("main", provider);
  await getGasPrice();

  const oracleRouterDeployment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeployment.address;
  const oracleRouterAbi = oracleRouterDeployment.abi;

  const exampleDeployment = await deployments.get("ExampleContract");
  const exampleAddress = exampleDeployment.address;

  const requestId = 1; // Reemplaza con un ID de solicitud válido
  const response = 100; // Reemplaza con una respuesta válida

  const routerOracleContract = new ethers.Contract(
    oracleRouterAddress,
    oracleRouterAbi,
    account
  );

  const gasEstimate = await routerOracleContract.estimateGas.fulfill(
    exampleAddress,
    6,
    BigInt(11)
  );

  console.log(`Gas estimate for fulfill: ${gasEstimate.toString()}`);

  console.log(
    "-------------------- SIMULATION COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
