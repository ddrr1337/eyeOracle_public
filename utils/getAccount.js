require("dotenv").config();
const { ethers } = require("ethers");

const privateKey1 = process.env.PRIVATE_KEY;


function getAccount(type, provider) {
  if (type === "main") {
    return new ethers.Wallet(privateKey1, provider);
/*   } else if (type === "sec") {
    return new ethers.Wallet(privateKey2, provider);
  } else if (type === "third") {
    return new ethers.Wallet(privateKey3, provider); */
  } else {
    throw new Error("Wallet must be: main");
  }
}

module.exports = { getAccount };
