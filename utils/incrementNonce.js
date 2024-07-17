const fs = require("fs").promises
const filePath = "nonce.txt" // File path

async function incrementNonce() {
    try {
        // Read the file
        const data = await fs.readFile(filePath, "utf8")
        // Convert the content to a number
        let number = parseInt(data, 10)

        // Add one to the number
        number += 1

        // Save the new number to the file
        await fs.writeFile(filePath, number.toString())

        // Return the new number
        return number
    } catch (error) {
        console.error("Error processing the file:", error)
        throw error
    }
}

module.exports = { incrementNonce }
