const networkConfig = {
  31337: {
    name: "localhost",
  },

  11155111: {
    name: "sepolia",
    ORACLE_ROUTER_ADDRESS: "0x8360E9729a195c04F073aFd24a73BF0D5df3F9DE",
    ORACLE_GRID_ADDRESS: "0xF4188491eaEF43D66Fb95fc2adE5dbf9320D0223",
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
