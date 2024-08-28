FROM node:20-alpine

COPY . /app
WORKDIR /app

RUN yarn install

# Compila los contratos de Hardhat (opcional si necesitas compilar antes de ejecutar los scripts)
RUN yarn hardhat compile

# Comando por defecto para ejecutar cuando el contenedor se inicia
CMD yarn concurrently "yarn hardhat run scripts/eventListener.js --network sepolia" "yarn hardhat run scripts/worker.js --network sepolia"
