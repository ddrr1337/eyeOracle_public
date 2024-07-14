const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let MockV3Aggregator
    let user
    const sendValue = ethers.parseEther("0.01")
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)

        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer,
        )
    })

    describe("constructor", async function () {
        it("set the agreggator V3", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, MockV3Aggregator.target)
        })
    })
    describe("getOwner", async function () {
        it("check owner same than deployer", async function () {
            const response = await fundMe.getOwner()

            assert.equal(response, deployer)
        })
    })

    describe("getVersion", async function () {
        it("version contract equal version mock", async function () {
            const versionMock = await MockV3Aggregator.version()
            const fundMeAggregatorVersion = await fundMe.getVersion()

            assert.equal(fundMeAggregatorVersion, versionMock)
        })
    })

    describe("fund", async function () {
        it("fails if dont send enough eth", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            )
        })
        it("addressAmountFunded correct updated", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("check correct push to funders array", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_funders(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("Only Owner", async function () {
            await expect(fundMe.withdraw({ from: user })).to.be.reverted
        })

        it("withdraws ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const startingDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = BigInt(gasUsed) * BigInt(gasPrice)

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            )
        })
        it("is allows us to withdraw with multiple funders", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const startingDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const withdrawGasCost = BigInt(gasUsed) * BigInt(gasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${gasPrice}`)
            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployer)
            // Assert
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + withdrawGasCost).toString(),
            )
            // Make a getter for storage variables
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })
    })
})
