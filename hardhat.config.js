require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-contract-sizer");

const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
const PRIVATE_KEY_3 = process.env.PRIVATE_KEY_3;
const ETHERSCAN_TOKEN = process.env.ETHERSCAN_TOKEN;
const BASE_ETHERSCAN_TOKEN = process.env.BASE_ETHERSCAN_TOKEN;
const COINMARKETCAP_TOKEN = process.env.COINMARKETCAP_TOKEN;

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
      sepolia: ETHERSCAN_TOKEN,
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
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io/",
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
  gasReporter: {
    enabled: false,
    outputFile: "gas-reports.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_TOKEN,
    token: "ETH",
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2, PRIVATE_KEY_3],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    base_sepolia: {
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2, PRIVATE_KEY_3],
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
