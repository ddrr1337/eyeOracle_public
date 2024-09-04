require("dotenv").config();
const { ethers } = require("ethers");

const privateKey1 = process.env.PRIVATE_KEY;
const privateKey2 = process.env.PRIVATE_KEY_2;
const privateKey3 = process.env.PRIVATE_KEY_3;

function getAccount(type, provider) {
  if (type === "main") {
    return new ethers.Wallet(privateKey1, provider);
  } else if (type === "sec") {
    return new ethers.Wallet(privateKey2, provider);
  } else if (type === "third") {
    return new ethers.Wallet(privateKey3, provider);
  } else {
    throw new Error("Wallet must be: main,sec,third");
  }
}

module.exports = { getAccount };
