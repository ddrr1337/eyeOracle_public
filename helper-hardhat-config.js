const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    UNISWAP_V2_ROUTER: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    UNISWAP_V2_FACTORY: "0x7E0987E5b3a30e3f2828572Bb659A548460a3003",
    ORACLE_ROUTER_ADDRESS: "0x1701B3D53859ba5983a6d8f9aff6E855985A24e8",
    ORACLE_GRID_ADDRESS: "0x3e7685cfE3102AFC87EC60fDb580a8b6859a2CB8",
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
