const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x379B179C0e17904b61E4448d91366F7A4f92C42b",
    ORACLE_GRID_ADDRESS: "0x2645A907fd90cA2d4fa356D3a059915711Ee27E7",
    verify: true,
  },
  84532: {
    name: "base_spolia",
    ORACLE_ROUTER_ADDRESS: "0x2474e07410d8D0De79DAa8eA575113913B5cAF82",
    ORACLE_GRID_ADDRESS: "0xFc3eCBE016Ba3a493EE8d78596C31542A5A40bb3",
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
