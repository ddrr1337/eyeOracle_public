const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x0553cb82EEce1B3C3be84AAcBDc201c6c6b7EECf",
    ORACLE_GRID_ADDRESS: "0x65a11FB3e93eA16a3844869C4ED27E4d9C8bc063",
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
