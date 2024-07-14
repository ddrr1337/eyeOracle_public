const { ethers, run, network } = require("hardhat")

async function main() {
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage")

    console.log("Depolying Contract...")
    const gasPrice = await ethers.provider.getGasPrice()
    const gasPriceWithMultiplier = gasPrice
        .mul(ethers.BigNumber.from("15"))
        .div(ethers.BigNumber.from("10"))
    const simpleStorage = await SimpleStorageFactory.deploy({
        gasPrice: gasPriceWithMultiplier,
    })
    await simpleStorage.deployed()

    console.log(`Deployed Contract to ${simpleStorage.address}`)
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_TOKEN) {
        await simpleStorage.deployTransaction.wait(6)
        await verify(simpleStorage.address, [])
    }

    const currentValue = await simpleStorage.retrieve()
    console.log(`Current Value is: ${currentValue}`)

    //update

    const transactionResponse = await simpleStorage.store(12)
    await transactionResponse.wait(1)

    const updatedValue = await simpleStorage.retrieve()

    console.log(`Updated value to: ${updatedValue}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying Contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified")
        } else {
            console.log(e)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
