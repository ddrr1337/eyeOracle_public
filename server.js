require("dotenv").config();

const express = require("express");
const redis = require("redis");
const bodyParser = require("body-parser");

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el puerto
const PORT = process.env.EXPRESS_PORT;

// Configurar Redis y conectarse de forma asíncrona
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_SERVER}:${process.env.REDIS_PORT}`,
});

// Middleware para procesar solicitudes JSON
app.use(bodyParser.json());

// Middleware para verificar la API Key
app.use((req, res, next) => {
  const apiKey = req.headers["api_key"]; // Cambia según el encabezado que uses
  if (apiKey && apiKey === process.env.API_KEY) {
    next(); // Si la API Key es válida, continúa con la siguiente función de middleware
  } else {
    res.status(403).send("Forbidden: Invalid API Key"); // Responde con un error 403 si la API Key es inválida
  }
});

// Función para conectar Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("REDIS CONNECTED!!");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}

// Llamar a la función de conexión a Redis
connectRedis();

// Manejo de errores de Redis
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

// Ruta de prueba para verificar el servidor
app.get("/", (req, res) => {
  res.send("Express server running!");
});

// Endpoint para guardar addressConsumer y headers en Redis como un array
app.post("/save-header", async (req, res) => {
  const { addressConsumer, headers } = req.body;

  if (!addressConsumer || !headers) {
    return res.status(400).send("addressConsumer and headers are required");
  }

  try {
    // Convertir el objeto headers a JSON antes de guardarlo
    const headersJSON = JSON.stringify(headers);

    // Verificar el tipo de dato existente
    const type = await redisClient.type(addressConsumer);
    if (type !== "none" && type !== "list") {
      // Si no es una lista, eliminamos la clave existente
      await redisClient.del(addressConsumer);
    }

    // Verificar si el header ya existe en la lista de headers para el addressConsumer
    const existingHeaders = await redisClient.lRange(addressConsumer, 0, -1);
    if (existingHeaders.includes(headersJSON)) {
      return res
        .status(200)
        .send("Header already exists for this addressConsumer");
    }

    // Añadir los nuevos headers al array usando RPUSH
    await redisClient.rPush(addressConsumer, headersJSON);

    res.send(`Headers added for ${addressConsumer} in Redis`);
  } catch (err) {
    console.error("Error saving headers in Redis:", err);
    res.status(500).send("Error saving headers in Redis");
  }
});

// Endpoint para obtener el valor (headers) de un addressConsumer
app.get("/get-header/:addressConsumer", async (req, res) => {
  const { addressConsumer } = req.params;

  try {
    // Obtener el valor almacenado en Redis para el addressConsumer
    const headersJSON = await redisClient.get(addressConsumer);

    if (headersJSON) {
      const headers = JSON.parse(headersJSON);
      res.json({ addressConsumer, headers });
    } else {
      res.status(404).send(`Headers not found for ${addressConsumer}`);
    }
  } catch (err) {
    console.error("Error retrieving redis value:", err);
    res.status(500).send("Error retrieving redis value");
  }
});

// Ruta para probar Redis
app.get("/test-redis", async (req, res) => {
  try {
    await redisClient.set("key", "value");
    const value = await redisClient.get("key");
    res.send(`Value saved in Redis: ${value}`);
  } catch (err) {
    res.status(500).send("Redis Error");
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`SERVER RUNNING AT http://localhost:${PORT}`);
});
