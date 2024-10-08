const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  let rpcUrl = network.config.url;
  let provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const account = getAccount("main", provider);

  const exampleDeployment = await deployments.get("ExampleContract");
  const exampleAddress = exampleDeployment.address;
  const exampleAbi = exampleDeployment.abi;

  const exampleContract = new ethers.Contract(
    exampleAddress,
    exampleAbi,
    account
  );

  const routerAddress = await exampleContract.oracleRouter();
  console.log("router", routerAddress);
  console.log("Caller: ", account.address);
  console.log("ExampleContract: ", exampleAddress);
  console.log("OracleRouter Address: ", routerAddress);

  const gasPrice = await getGasPrice();
  const fulfillGasUsed = 100_000;

  const ethToSendInTx = fulfillGasUsed * gasPrice * 1.5;

  const sendRequestPostTx = await exampleContract.exampleSendRequestPOST(
    fulfillGasUsed,
    {
      value: BigInt(ethToSendInTx),
    }
  );
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
