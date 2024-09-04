const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x1bbdC20BA01d26dcE1FDA03F15964d16898E55A4",
    ORACLE_GRID_ADDRESS: "0xa309ABCC1D8EC59392C92930d437fd5320F1d69D",
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
