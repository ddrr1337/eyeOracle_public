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
  const fulfillGasUsed = 136970; // <== input the gas usage here

  const ethToSendInTx = fulfillGasUsed * gasPrice * 1.5; //<== apply 50% more gas just for small fluctuactions. Exceed gas wil refund to caller by the oracle

  const inputValue_1 = "3";
  const inputValue_2 = "7";

  const sendRequestPostTx = await exampleContract.exampleSendRequestPOST(
    fulfillGasUsed,
    inputValue_1,
    inputValue_2,
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
