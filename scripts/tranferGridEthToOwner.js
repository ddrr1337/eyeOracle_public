const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const account = getAccount("main", provider);

  await getGasPrice();

  const gridDeployment = await deployments.get("OracleGrid");
  const gridAddress = gridDeployment.address;
  const gridAbi = gridDeployment.abi;

  const oracleGridContract = new ethers.Contract(gridAddress, gridAbi, account);

  const transferEthToOwner = await oracleGridContract.withdrawEtherToOwner();
  console.log("Tx:", transferEthToOwner.hash);

  console.log(
    "-------------------- RETURNED FUNDS TO OWNER FROM GRID -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
