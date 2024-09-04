const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const account = getAccount("main", provider);
  const gasUnitsCallback = 100_000;

  const gasPrice = await getGasPrice();
  console.log(gasPrice * 1);

  const ethToSendInTx = gasUnitsCallback * gasPrice * 1.5;
  console.log("ETH to Send wei:", ethToSendInTx);
  console.log("eth:", ethToSendInTx / 10 ** 18);

  const exampleDeployment = await deployments.get("ExampleContract");
  const exampleAddress = exampleDeployment.address;
  const exampleAbi = exampleDeployment.abi;

  const exampleContract = new ethers.Contract(
    exampleAddress,
    exampleAbi,
    account
  );
  const routerAddress = await exampleContract.oracleRouter();

  console.log("Caller: ", account.address);
  console.log("ExampleContract: ", exampleAddress);
  console.log("OracleRouter Address: ", routerAddress);

  const sendRequestPostTx = await exampleContract.exampleSendRequestPOST({
    value: BigInt(ethToSendInTx),
  });
  console.log("Tx:", sendRequestPostTx.hash);

  console.log(
    "-------------------- SEND REQUEST POST COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
