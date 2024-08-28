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
const ARBITRUM_SEPOLIA_RPC = process.env.ARBITRUM_SEPOLIA_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
const ETHERSCAN_TOKEN = process.env.ETHERSCAN_TOKEN;
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
    apiKey: ETHERSCAN_TOKEN,
    customChains: [],
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
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    base_sepolia: {
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      chainId: 84532,
      blockConfirmations: 6,
    },
    arbitrum_sepolia: {
      url: ARBITRUM_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      chainId: 421614,
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
