FROM node:20-buster

WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json yarn.lock ./

# Instalar todas las dependencias necesarias (incluyendo express)
RUN yarn install

# Copiar el resto de los archivos del proyecto
COPY . .

# Compilar el proyecto Hardhat
RUN yarn hardhat compile

# Exponer el puerto que usará el servidor Express
EXPOSE 3000

# Comando para ejecutar el servidor Express y los scripts de Hardhat de forma concurrente
CMD ["yarn", "concurrently", "yarn hardhat run scripts/eventListener.js --network sepolia", "yarn hardhat run scripts/worker.js --network sepolia", "node server.js"]
