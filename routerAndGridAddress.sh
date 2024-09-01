#!/bin/bash

# Comprueba si se ha pasado un parámetro
if [ -z "$1" ]; then
  echo "Usage: $0 <network_name>"
  exit 1
fi

# Guarda el parámetro como una variable
NETWORK=$1

# Ejecuta el comando de Hardhat con la red especificada
yarn hardhat run scripts/getRouterAndGridAddress.js --network $NETWORK
