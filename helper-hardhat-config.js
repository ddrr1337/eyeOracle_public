const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    UNISWAP_V2_ROUTER: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    UNISWAP_V2_FACTORY: "0x7E0987E5b3a30e3f2828572Bb659A548460a3003",
    ORACLE_ROUTER_ADDRESS: "0x4b45AE93074c8ABf5203aA2b19a10c370fF4321E",
    ORACLE_GRID_ADDRESS: "0xd913ac1C54f3D76e3A60F5CB58cE17f4089aE2ec",
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
