const { ethers, deployments, network } = require("hardhat");
const { getAccount } = require("../utils/getAccount");
const { getGasPrice } = require("../utils/getGasPrice");
const { decodeCBOR } = require("../utils/decodeCBOR");

async function main() {
  const rpcUrl = network.config.url;
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const account = getAccount("sec", provider);

  await getGasPrice();

  const testerContractDeployment = await deployments.get("TesterContract");
  const testerContractAddress = testerContractDeployment.address;
  const testerContractAbi = testerContractDeployment.abi;

  const testerContract = new ethers.Contract(
    testerContractAddress,
    testerContractAbi,
    account
  );

  const sendRequestTx = await testerContract.sendRequest("TSLA", 250);

  await sendRequestTx.wait();

  const oracleRouterDeployment = await deployments.get("OracleRouter");
  const oracleRouterAddress = oracleRouterDeployment.address;
  const oracleRouterAbi = oracleRouterDeployment.abi;

  const oracleRouterContract = new ethers.Contract(
    oracleRouterAddress,
    oracleRouterAbi,
    getAccount("sec", provider)
  );

  console.log("Tx:", sendRequestTx.hash);

  const testerHex = await testerContract.tester();

  console.log("testerHex", testerHex);

  const testerBytes = Buffer.from(testerHex.slice(2), "hex");

  const decoded = await decodeCBOR(testerBytes);

  console.log(decoded);

  const requestId = await testerContract.requestIdTester();
  console.log("requestId", requestId * 1);

  const tester = await oracleRouterContract.testerBytes();

  console.log("bytes from router", tester);

  console.log(
    "-------------------- SEND REQUEST COMPLETED -----------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
