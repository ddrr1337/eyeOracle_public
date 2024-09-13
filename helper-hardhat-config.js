const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x1bbdC20BA01d26dcE1FDA03F15964d16898E55A4",
    ORACLE_GRID_ADDRESS: "0x24F4bb361736cA2FD7db0d6DE5363E27D31aC716",
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
