const { getGasPrice } = require("../utils/getGasPrice");

async function gasPrice() {
  await getGasPrice();
}

gasPrice()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
