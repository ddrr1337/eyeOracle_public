require("dotenv").config();

const networkConfig = {
  31337: {
    name: "localhost",
  },

  84532: {
    name: "base_spolia",
    ORACLE_ROUTER_ADDRESS: process.env.BASE_SEPOLIA_ORACLE_ROUTER_ADDRESS,
    verify: true,
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
