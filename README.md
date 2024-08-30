# Basic Node Architecture Implementation

This project is intended for developers who have control over both the destination API and the source contracts involved in the transaction. If you do not control both, you may encounter issues with gas calculations for the oracle callback, as well as the necessary authorization for accessing the destination API. **NODES DO NOT HANDLE SECRETS; THIS MUST BE MANAGED BY THE DESTINATION API.**

This is a minimalist project that mimics the capabilities of Chainlink. The project consists of a set of nodes that listen to an on-chain event and then perform an HTTP request to an API.

**Note:** This project does not manage encrypted secrets, so the target API must be controlled by the user.

The number of nodes that can be added is arbitrary. Task assignment to the nodes is handled through the `OracleGrid` contract, eliminating the need for a centralized database that could fail.

Each node is "bound" to a Redis server for queue and task management. This repository includes a `docker-compose.yaml` file for deploying both the node and the Redis server. Remember to change the Redis port and host in the `.env` file for each node you deploy.

### Execution Flow:

1. An event is emitted by `OracleRouter`.
2. The listening nodes detect the event.
3. The nodes attempt to register the event in `OracleGrid`. Thanks to a `require` statement in the `oracleAssignWork` function, only one node can claim the task.
4. The node that successfully registers the task in `OracleGrid` performs the HTTP request to the target API.
5. The other nodes receive an error when trying to call `oracleAssignWork`, indicating that another node is processing the request.

**Note:** OracleGrid is not tied to any other contract and only serves to assign tasks to nodes. Therefore, OracleGrid does not need to be on the same network as the other contracts. Ideally, it should be deployed on a testnet so that the oracles do not incur real transaction costs when interacting with OracleGrid. This entire project is ready for deployment on Sepolia. In production, the smart choice would be to keep OracleGrid on Sepolia to save costs.

### Deployment and Starting Flow

1. Deploy `OracleRouter`.
2. Deploy `OracleGrid`.
3. Set the addresses of `OracleRouter` and `OracleGrid` in the `helper-hardhat-config.js` file.
4. Deploy your contract that inherits from `OracleClient`.
5. Request as many access tokens for your API as you have nodes and set this token in `NODE_ACCESS`. Also, assign a unique ID and a `SLEEP` (set 0 in the first node and add 2 seconds on other nodes) value in the `.env` file (note that `NODE_ID` must be a `uint` as `OracleGrid` expects a `uint` in the input parameter).
6. Run the following command:

   ```bash
   yarn concurrently "yarn hardhat run scripts/eventListener.js --network sepolia" "yarn hardhat run scripts/worker.js --network sepolia"


When the node processing the request to the API receives a response, it will call the fulfillRequest() function that the user has implemented in their contract (by inheriting from OracleClient).

## Gas Management in the Callback
I am not particularly proud of how gas payment is handled in the oracle callback, but so far, I haven't found a more efficient way to do it. The function implemented in the original contract must include payment and should make a call with msg.value to the OracleRouter. The OracleRouter will then receive the payment, trigger the receive function, and pay the callback gas to the assigned wallet (in this case, the same wallet used by the node to perform the callback). This way, the caller in the original contract will cover the gas costs of the node's callback.

## Summary
This is a minimalist implementation of Chainlink's services that uses nodes sequentially rather than in parallel, as Chainlink does. This approach avoids the known issue of Chainlink calling APIs with a POST request.

I understand that this might be a complex project with too many variables. If you wish, you can contact me at incaleum@hotmail.com.