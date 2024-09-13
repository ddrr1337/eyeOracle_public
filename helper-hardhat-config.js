const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x1bbdC20BA01d26dcE1FDA03F15964d16898E55A4",
    ORACLE_GRID_ADDRESS: "0x49dec46C97d464378aC0D1480f7d8148Cf5e2708",
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
