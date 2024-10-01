// server.js
const express = require("express");
const redis = require("redis");
const cors = require("cors");

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Configurar Redis
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_SERVER}:${process.env.REDIS_PORT}`,
});

// Conectar Redis
redisClient
  .connect()
  .then(() => {
    console.log("Conectado exitosamente a Redis");
  })
  .catch((err) => {
    console.error("Error al conectar con Redis:", err);
  });

// Manejo de errores de Redis
redisClient.on("error", (err) => {
  console.error("Error de Redis:", err);
});

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
const allowedOrigins = ["http://localhost:3000", "http://85.55.18.40:8000"]; // Ajusta la IP pública de tu backend

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir solicitudes de orígenes en allowedOrigins o sin origen (para algunas herramientas)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("No autorizado por CORS"));
      }
    },
  })
);

// Ruta de prueba para verificar el servidor
app.get("/", (req, res) => {
  res.send("¡Servidor Express en funcionamiento!");
});

// Ruta para guardar un header con addressConsumer como key en Redis
app.post("/store-header", async (req, res) => {
  const { addressConsumer, headers } = req.body;

  if (!addressConsumer || !headers) {
    return res.status(400).send("Faltan datos en la solicitud");
  }

  try {
    await redisClient.set(addressConsumer, JSON.stringify(headers));
    res.send(
      `Header almacenado correctamente para el address: ${addressConsumer}`
    );
  } catch (err) {
    console.error("Error al almacenar en Redis:", err);
    res.status(500).send("Error al almacenar en Redis");
  }
});

// Ruta para obtener el header de un addressConsumer
app.get("/get-header/:addressConsumer", async (req, res) => {
  const { addressConsumer } = req.params;

  try {
    const headers = await redisClient.get(addressConsumer);
    if (headers) {
      res.send(`Header para ${addressConsumer}: ${headers}`);
    } else {
      res.status(404).send("No se encontró el header para esa dirección");
    }
  } catch (err) {
    console.error("Error al obtener de Redis:", err);
    res.status(500).send("Error al obtener el header de Redis");
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
