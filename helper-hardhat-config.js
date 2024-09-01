const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x5eFD1e918A1b5c21568a2b580992E2208e4B43DC",
    ORACLE_GRID_ADDRESS: "0x0E9deAA5716d92154b2deD4F76d39230Cb7b476c",
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
