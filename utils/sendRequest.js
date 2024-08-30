async function sendRequest(requestId, decodedData, headers) {
  try {
    const { url, method, args } = decodedData;

    const requestBody = {
      requestId: requestId,
    };

    args.forEach((arg, index) => {
      requestBody[`arg${index}`] = arg;
    });

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Failed to post to API:", error);
    return null;
  }
}

module.exports = { sendRequest };
