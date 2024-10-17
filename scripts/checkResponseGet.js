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

  await getGasPrice();

  const checkResponseBytes =
    await exampleContract.exampleFulfillResponseBytes();

  console.log("Response from oracle in bytes:", checkResponseBytes);

  const checkResponseUint = await exampleContract.decodeBytesToString();

  console.log("Response from oracle in string:", checkResponseUint);

  console.log(
    "-------------------- CHECK RESPONSE GET COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
