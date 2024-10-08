// scripts/redisHelper.js

require("dotenv").config();
const redis = require("redis");

// Crear un cliente de Redis
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_SERVER}:${process.env.REDIS_PORT}`,
});

// Función para obtener headers formateados
async function getFormattedHeaders(consumerAddress, index) {
  // Conectar a Redis
  await redisClient.connect();

  try {
    // Obtén la lista de headers para el consumer
    const headersList = await redisClient.lRange(consumerAddress, 0, -1);

    // Verifica si hay headers guardados
    if (headersList.length === 0) {
      throw new Error(`No headers found for consumer: ${consumerAddress}`);
    }

    // Tomar el índice indicado
    const selectedHeaderSet = JSON.parse(headersList[index]);

    // Formatear los headers para que sean válidos en una solicitud HTTP
    const formattedHeaders = selectedHeaderSet.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return formattedHeaders;
  } catch (error) {
    console.error("Error in getFormattedHeaders:", error);
    throw error;
  } finally {
    // Desconectar el cliente de Redis
    await redisClient.disconnect();
  }
}

// Exportar la función
module.exports = { getFormattedHeaders };
