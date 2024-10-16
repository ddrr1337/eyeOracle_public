const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");

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

  const gasPrice = await getGasPrice();
  const fulfillGasUsed = 110499;

  const ethToSendInTx = fulfillGasUsed * gasPrice * 1.5;

  const name = "john";
  const age = "33";

  const sendRequestPostTx = await exampleContract.exampleSendRequestGET(
    fulfillGasUsed,
    name,
    age,
    {
      value: BigInt(ethToSendInTx),
    }
  );
  console.log("Tx:", sendRequestPostTx.hash);

  console.log(
    "-------------------- SEND REQUEST GET COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
