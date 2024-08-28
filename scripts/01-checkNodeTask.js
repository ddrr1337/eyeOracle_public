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

  const oracleGridDeployment = await deployments.get("OracleGrid");
  const oracleGridAddress = oracleGridDeployment.address;
  const oracleGridAbi = oracleGridDeployment.abi;

  const oracleGridContract = new ethers.Contract(
    oracleGridAddress,
    oracleGridAbi,
    account
  );

  const oracleId = await oracleGridContract.requstIdStatus(39);

  console.log(
    `-------------------- ORACLE ID: ${oracleId} -----------------------`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
