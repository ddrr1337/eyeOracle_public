#!/bin/bash


if [ -z "$1" ]; then
  echo "Usage: $0 <network_name>"
  exit 1
fi

NETWORK=$1


yarn hardhat run scripts/getRouterAndGridAddress.js --network $NETWORK
