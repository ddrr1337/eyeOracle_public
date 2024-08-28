async function sendRequest(requestId, decodedData) {
  try {
    // Extraer los valores de decodedData
    const { url, method, args } = decodedData;

    // Crear el cuerpo de la solicitud con los valores extraídos
    // Usamos una estructura dinámica para manejar cualquier número de elementos en args
    const requestBody = {
      requestId: requestId,
    };

    // Asignar los elementos de args a requestBody con claves dinámicas
    args.forEach((arg, index) => {
      requestBody[`arg${index}`] = arg;
    });

    // Realizar la llamada POST a la URL proporcionada en los datos decodificados
    const token = process.env.NODE_ACCESS;

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("POST request successful:", responseData);
    return responseData;
  } catch (error) {
    console.error("Failed to post to API:", error);
    return null;
  }
}

module.exports = { sendRequest };
