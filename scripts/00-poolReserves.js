// scripts/provide-liquidity.js
const { network, ethers } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const { getAccount } = require("../utils/getAccount")
const IUniswapV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json")
const IUniswapV2Pair = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const chainId = network.config.chainId
    const account = getAccount("main", provider)

    // Direcciones del contrato (cambia estas direcciones según tu configuración)
    const tokenAddress = "0xAf9c6B82AD14B4ec19A643dCD7BF5363E415DFeF"
    const usdcAddress = networkConfig[chainId].TESTER_USDC
    const uniswapFactoryAddress = networkConfig[chainId].UNISWAP_V2_FACTORY

    const uniswapFactoryContract = new ethers.Contract(
        uniswapFactoryAddress,
        IUniswapV2Factory.abi,
        account,
    )

    const pairAddress = await uniswapFactoryContract.getPair(
        tokenAddress,
        usdcAddress,
    )

    console.log("PairAddress", pairAddress)

    const uniswapPairContract = new ethers.Contract(
        pairAddress,
        IUniswapV2Pair.abi,
        account,
    )

    const reserves = await uniswapPairContract.getReserves()

    const usdcReserves = parseInt(reserves.reserve1)
    const stockReserves = parseInt(reserves.reserve0)

    const priceInUsdc = usdcReserves / 1e6 / (stockReserves / 1e18)

    console.log("RESERVE_0: ", parseInt(reserves.reserve0))
    console.log("RESERVE_1: ", parseInt(reserves.reserve1))

    console.log("PRICE IN USDC: ", priceInUsdc)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
