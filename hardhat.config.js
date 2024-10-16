require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC;
const BASE_ETHERSCAN_TOKEN = process.env.BASE_ETHERSCAN_TOKEN;

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.6.6" },
      { version: "0.8.25" },
    ],
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      "base-sepolia": BASE_ETHERSCAN_TOKEN,
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
    enabled: true,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: false,
  },
  networks: {
    base_sepolia: {
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      blockConfirmations: 6,
    },

    localHost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
};
