const networkConfig = {
  31337: {
    name: "localhost",
  },

  84532: {
    name: "base_spolia",
    ORACLE_ROUTER_ADDRESS: "0x5B06eEF47eC7Ff4Ecb892846Dbb2edaa81f5FCE6",
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
