async function sendRequest(requestId, decodedData, originalCaller, headers) {
  try {
    const { url, method, args } = decodedData;

    let options = {
      method: method,
      headers: headers,
    };

    if (method !== "GET") {
      const requestBody = {
        requestId: requestId,
        originalCaller: originalCaller,
      };

      args.forEach((arg, index) => {
        requestBody[`arg${index}`] = arg;
      });

      options.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Failed to send request to API:", error);
    return null;
  }
}

module.exports = { sendRequest };
