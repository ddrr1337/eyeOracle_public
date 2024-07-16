#!/bin/bash

# Comprueba si se ha pasado un parámetro
if [ -z "$1" ]; then
  echo "Uso: $0 <nombre_red>"
  exit 1
fi

# Guarda el parámetro como una variable
NETWORK=$1

# Ejecuta el comando de Hardhat con la red especificada
yarn hardhat run scripts/gasPrice.js --network $NETWORK
