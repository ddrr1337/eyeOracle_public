// server.js
const express = require("express");
const redis = require("redis");

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Configurar Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Manejo de errores de Redis
redisClient.on("error", (err) => {
  console.error("Error de Redis:", err);
});

// Ruta de prueba para verificar el servidor
app.get("/", (req, res) => {
  res.send("¡Servidor Express en funcionamiento!");
});

// Ruta para probar Redis
app.get("/test-redis", (req, res) => {
  redisClient.set("clave", "valor", (err, reply) => {
    if (err) {
      return res.status(500).send("Error al establecer valor en Redis");
    }
    redisClient.get("clave", (err, value) => {
      if (err) {
        return res.status(500).send("Error al obtener valor de Redis");
      }
      res.send(`Valor almacenado en Redis: ${value}`);
    });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
