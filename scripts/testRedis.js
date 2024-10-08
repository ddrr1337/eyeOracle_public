// scripts/testRedis.js

require("dotenv").config();
const { getFormattedHeaders } = require("../utils/getFormattedHeaders");

async function main() {
  // Define el consumer que quieres probar
  const consumerAddress = "0x3aa14f5aa2c5ff632fc198d5a6391a29523d08c5"; // Cambia esto por la dirección del consumer
  const index = 4; // Cambia este índice según el que quieras probar

  try {
    // Obtener los headers formateados utilizando la función auxiliar
    const formattedHeaders = await getFormattedHeaders(consumerAddress, index);

    // Imprimir los headers formateados
    console.log("Formatted headers for HTTP request:", formattedHeaders);
  } catch (error) {
    console.error("Error retrieving headers:", error);
  }
}

// Ejecutar el main
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
