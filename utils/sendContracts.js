async function sendContracts(contractsArray, backendUrl) {
    const apiUrl = backendUrl

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockchain_response: contractsArray }),
        timeout: 10000, // 10 segundos de tiempo de espera
    }

    try {
        const response = await fetch(apiUrl, options)

        if (!response.ok) {
            throw new Error(
                `Error en la solicitud: ${response.status} ${response.statusText}`,
            )
        }

        const data = await response.json()
        console.log("Respuesta del servidor:", data)
    } catch (error) {
        if (error.type === "request-timeout") {
            console.error("Error: La solicitud ha expirado.")
        } else {
            console.error("Error en la solicitud:", error)
        }
    }
}

module.exports = { sendContracts }
