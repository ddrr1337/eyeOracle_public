const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        FUNCTIONS_ROUTER: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        TSLA_PRICE_FEED: "0xc59E3633BAAC79493d908e63626716e204A45EdF",
        USDC_PRICE_FEED: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        TESTER_USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        DON_ID: "66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
        DON_ID_ADDRESS: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        DON_ID_SUBSCRIPTION: 3179,
        DON_ID_STRING: "fun-ethereum-sepolia-1",
        UNISWAP_V2_ROUTER: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
        UNISWAP_V2_FACTORY: "0x7E0987E5b3a30e3f2828572Bb659A548460a3003",
        verify: true,
    },
    84532: {
        name: "base_sepolia",
        ethUsdPriceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
        FUNCTIONS_ROUTER: "0xf9B8fc078197181C841c296C876945aaa425B278",
        TSLA_PRICE_FEED: "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61",
        USDC_PRICE_FEED: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        DON_ID: "66756e2d626173652d7365706f6c69612d310000000000000000000000000000",
        USDC: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
        DON_ID_STRING: "fun-base-sepolia-1",
        verify: false,
    },
    421614: {
        name: "arbitrum_sepolia",
        ethUsdPriceFeed: "",
        FUNCTIONS_ROUTER: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
        TSLA_PRICE_FEED: "",
        USDC_PRICE_FEED: "",
        DON_ID: "66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000",
        USDC: "",
        DON_ID_STRING: "fun-arbitrum-sepolia-1",
        verify: false,
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
