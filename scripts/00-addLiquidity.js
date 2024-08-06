// scripts/provide-liquidity.js
const { network, ethers } = require("hardhat")
const { BigNumber } = require("ethers")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { getAccount } = require("../utils/getAccount")
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json")
const IUniswapV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json")

async function main() {
    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const chainId = network.config.chainId
    const account = getAccount("main", provider)

    // Direcciones del contrato (cambia estas direcciones según tu configuración)
    const tokenAddress = "0x2d18a895BeAD7CFEE7B54EEE6B2dD94aDC103600"
    const usdcAddress = networkConfig[chainId].TESTER_USDC
    const uniswapRouterAddress = networkConfig[chainId].UNISWAP_V2_ROUTER
    const uniswapFactoryAddress = networkConfig[chainId].UNISWAP_V2_FACTORY

    const IERC20ExtendedArtifact =
        await deployments.getArtifact("IERC20Extended")

    const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ExtendedArtifact.abi,
        account,
    )

    const usdcContract = new ethers.Contract(
        usdcAddress,
        IERC20ExtendedArtifact.abi,
        account,
    )

    const uniswapRouterContract = new ethers.Contract(
        uniswapRouterAddress,
        IUniswapV2Router02.abi,
        account,
    )
    const tokenAmount = ethers.utils.parseUnits((1 / 2).toString(), 18) // 1 ERC20 token
    const usdcAmount = ethers.utils.parseUnits((158 / 2).toString(), 6)

    const approveTokenTx = await tokenContract.approve(
        uniswapRouterAddress,
        tokenAmount,
    )
    await approveTokenTx.wait()

    console.log(
        `-------------------- APPROVED STOCK TO UNISWAP ROUTER -----------------------`,
    )
    const approveUsdcTx = await usdcContract.approve(
        uniswapRouterAddress,
        tokenAmount,
    )
    await approveUsdcTx.wait()

    console.log(
        `-------------------- APPROVED USDC TO UNISWAP ROUTER -----------------------`,
    )

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20

    // Proveer liquidez
    const addLiquidityTx = await uniswapRouterContract.addLiquidity(
        tokenAddress,
        usdcAddress,
        tokenAmount,
        usdcAmount,
        tokenAmount.mul(99).div(100), // Slippage del 1%
        usdcAmount.mul(99).div(100), // Slippage del 1%
        account.address,
        deadline,
    )

    await addLiquidityTx.wait()

    console.log(`-------------------- LIQUIDITY ADDED -----------------------`)

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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
