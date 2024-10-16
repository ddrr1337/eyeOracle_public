const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x995f0fe900E2AaC07b27145598905937C4eC6f82",
    verify: true,
  },
  84532: {
    name: "base_spolia",
    ORACLE_ROUTER_ADDRESS: "0x2474e07410d8D0De79DAa8eA575113913B5cAF82",
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
