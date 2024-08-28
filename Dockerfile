# Usa una imagen base de Node.js 20 con Debian
FROM node:20-buster

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y yarn.lock al contenedor primero para aprovechar el cacheo de Docker
COPY package.json yarn.lock ./

# Instala las dependencias del proyecto
RUN yarn install

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Compila los contratos de Hardhat (opcional si necesitas compilar antes de ejecutar los scripts)
RUN yarn hardhat compile

# Instala concurrently (necesario para ejecutar múltiples scripts en paralelo)
RUN yarn add concurrently

# Comando por defecto para ejecutar cuando el contenedor se inicia
CMD ["yarn", "concurrently", "yarn hardhat run scripts/eventListener.js --network sepolia", "yarn hardhat run scripts/worker.js --network sepolia"]