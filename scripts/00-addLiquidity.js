// scripts/provide-liquidity.js
const { network, ethers } = require("hardhat")
const { BigNumber } = require("ethers")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { getAccount } = require("../utils/getAccount")
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json")
const IUniswapV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json")

async function main() {
    const apiUrl = "http://85.53.91.64:8001/api/yahoo-data/"

    // Función para realizar la solicitud
    async function fetchData() {
        try {
            // Realizar la solicitud GET
            const response = await fetch(apiUrl)

            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Convertir la respuesta a JSON
            const data = await response.json()
            const tikers = data.data_tickers

            // Mostrar los datos en la consola
            return tikers
        } catch (error) {
            // Manejar cualquier error que ocurra durante la solicitud
            console.error("Error fetching data:", error)
        }
    }

    // Llamar a la función para realizar la solicitud
    const pricesRaw = await fetchData()
    const prices = JSON.parse(pricesRaw)

    const rpcUrl = network.config.url
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const chainId = network.config.chainId
    const account = getAccount("main", provider)

    // Direcciones del contrato (cambia estas direcciones según tu configuración)
    const tokenAddress = "0xc6b00982d03013526389cC97a55d4E5270b17830"
    const usdcAddress = networkConfig[chainId].TESTER_USDC
    const uniswapRouterAddress = networkConfig[chainId].UNISWAP_V2_ROUTER
    const uniswapFactoryAddress = networkConfig[chainId].UNISWAP_V2_FACTORY

    const dStorageDeployment = await deployments.get("dStockStorage")
    const dStorageAddress = dStorageDeployment.address
    const dStorageAbi = dStorageDeployment.abi

    const dStorageContract = new ethers.Contract(
        dStorageAddress,
        dStorageAbi,
        account,
    )

    const stocks = await dStorageContract.getStocksArray()

    const IERC20ExtendedArtifact =
        await deployments.getArtifact("IERC20Extended")

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

    for (const stock of stocks) {
        const infiniteApprovalAmount = BigNumber.from(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        )
        console.log("ADDING LIQUIDITY TO STOCK", stock.name.slice(1))
        const formattedStock = stock.name.slice(1)
        const stockPrice = parseInt(prices[formattedStock].current_price * 0.98)

        const tokenAmount = ethers.utils.parseUnits((1 / 4).toString(), 18) // 1 ERC20 token
        const usdcAmount = ethers.utils.parseUnits(
            (stockPrice / 4).toString(),
            6,
        )
        console.log("AMOUNT STOCK", tokenAmount * 1)
        console.log("AMOUNT USDC", usdcAmount * 1)

        const tokenContract = new ethers.Contract(
            stock.stockAddress,
            IERC20ExtendedArtifact.abi,
            account,
        )
        const approveTokenTx = await tokenContract.approve(
            uniswapRouterAddress,
            infiniteApprovalAmount,
        )
        await approveTokenTx.wait()

        console.log(
            `-------------------- APPROVED STOCK TO UNISWAP ROUTER -----------------------`,
        )
        const approveUsdcTx = await usdcContract.approve(
            uniswapRouterAddress,
            infiniteApprovalAmount,
        )
        await approveUsdcTx.wait()

        console.log(
            `-------------------- APPROVED USDC TO UNISWAP ROUTER -----------------------`,
        )

        const deadline = Math.floor(Date.now() / 1000) + 60 * 20

        if (stock.stockAddress > usdcAddress) {
            const addLiquidityTx = await uniswapRouterContract.addLiquidity(
                stock.stockAddress,
                usdcAddress,
                BigInt(tokenAmount),
                BigInt(usdcAmount),
                BigInt(tokenAmount.mul(99).div(100)), // Slippage del 1%
                BigInt(usdcAmount.mul(99).div(100)), // Slippage del 1%
                account.address,
                deadline,
            )
            await addLiquidityTx.wait()
        } else {
            const addLiquidityTx = await uniswapRouterContract.addLiquidity(
                usdcAddress,
                stock.stockAddress,
                BigInt(usdcAmount),
                BigInt(tokenAmount),
                BigInt(tokenAmount.mul(99).div(100)), // Slippage del 1%
                BigInt(usdcAmount.mul(99).div(100)), // Slippage del 1%
                account.address,
                deadline,
            )
            await addLiquidityTx.wait()
        }

        console.log(
            `-------------------- LIQUIDITY ADDED -----------------------`,
        )

        const uniswapFactoryContract = new ethers.Contract(
            uniswapFactoryAddress,
            IUniswapV2Factory.abi,
            account,
        )

        const pairAddress = await uniswapFactoryContract.getPair(
            stock.stockAddress,
            usdcAddress,
        )

        console.log("PairAddress", pairAddress)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
