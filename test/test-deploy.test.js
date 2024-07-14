const { ethers } = require("hardhat")
const { expect, assert } = require("chai")

describe("SimpleStorage", () => {
    let simpleStorageFactory
    let simpleStorage
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })

    it("Should start with favourite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve()
        const expectedValue = "0"
        // assert
        assert.equal(currentValue.toString(), expectedValue)
    })
    it("Should update when call store", async function () {
        const expectedValue = "10"
        const storeTx = await simpleStorage.store(expectedValue)
        storeTx.wait(1)

        const curentValue = await simpleStorage.retrieve()

        assert.equal(curentValue, expectedValue)
    })
    it("adds person to array", async function () {
        const name = "tester"
        const favNumber = 10
        await simpleStorage.addPerson(name, favNumber)
        const expected = [BigInt(favNumber), name]
        const response = await simpleStorage.people(0)

        assert.deepEqual(response, expected)
    })
})
