
FROM node:20-buster


WORKDIR /app

COPY package.json yarn.lock ./


RUN yarn install


COPY . .

RUN yarn hardhat compile


CMD ["yarn", "concurrently", "yarn hardhat run scripts/eventListener.js --network sepolia", "yarn hardhat run scripts/worker.js --network sepolia"]