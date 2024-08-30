# Basic Node Architecture Implementation

Este proyecto esta destinado a desarrolladores que tienen el control de la APi destino, asi como de los contratos origenes de la transaccion. Si no esta en control de ambos, podra sufrir problemas con los calculos de gas para el callback del oraculo asi como de la necesaria autorizacion para el acceso al APi destino. LOS NODOS NO MANEJAN SECRETOS Y SE DEBE HACER DESDE LA API DESTINO.

This is a minimalist project that mimics the capabilities of Chainlink. The project consists of a set of nodes that listen to an on-chain event and then perform an HTTP request to an API.

**Note:** This project does not manage encrypted secrets, so the target API must be controlled by the user.

The number of nodes that can be added is arbitrary. Task assignment to the nodes is handled through the `OracleGrid` contract, eliminating the need for a centralized database that could fail.

Each node is "bound" to a Redis server for queue and task management. This repository includes a `docker-compose.yaml` file for deploying both the node and the Redis server. Remember to change the Redis port and host in .env file for each node you deploy.

### Execution Flow:

1. An event is emitted by `OracleRouter`.
2. The listening nodes detect the event.
3. The nodes attempt to register the event in `OracleGrid`. Thanks to a `require` statement in the `oracleAssignWork` function, only one node can claim the task.
4. The node that successfully registers the task in `OracleGrid` performs the HTTP request to the target API.
5. The other nodes receive an error when trying to call `oracleAssignWork`, indicating that another node is processing the request.

### Deployment and Starting Flow

1. Deploy `OracleRouter`.
2. Deploy `OracleGrid`.
3. Set the addresses of `OracleRouter` and `OracleGrid` in the `helper-hardhat-config.js` file.
4. Deploy your contract that inherits from `OracleClient`.
5. Request as many access tokens for your API as you have nodes and set this token in `NODE_ACCESS`. Also, assign a unique ID and a `SLEEP` (set 0 in the first node and add 2 sec on other nodes) value in the `.env` file (note that `NODE_ID` must be a `uint` as `OracleGrid` expects a `uint` in the input parameter).
6. Run the following command:
   ```bash
   yarn concurrently "yarn hardhat run scripts/eventListener.js --network sepolia" "yarn hardhat run scripts/worker.js --network sepolia"


When the node processing the request to the API receives a response, it will call the fulfillRequest() function that the user has implemented in their contract (by inheriting from OracleClient).

Summary
This is a minimalist implementation of Chainlink's services that uses nodes sequentially rather than in parallel, as Chainlink does. This approach avoids the known issue of Chainlink calling APIs with a POST request.