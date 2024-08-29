# Basic Node Architecture Implementation

This is a minimalist project that mimics the capabilities of Chainlink. The project consists of a set of nodes that listen to an on-chain event and then perform an HTTP request to an API.

**Note:** This project does not manage encrypted secrets, so the target API must be controlled by the user.

The number of nodes that can be added is arbitrary. Task assignment to the nodes is handled through the `OracleGrid` contract, eliminating the need for a centralized database that could fail.

### Execution Flow:

1. An event is emitted by `OracleRouter`.
2. The listening nodes detect the event.
3. The nodes attempt to register the event in `OracleGrid`. Thanks to a `require` statement in the `oracleAssignWork` function, only one node can claim the task.
4. The node that successfully registers the task in `OracleGrid` performs the HTTP request to the target API.
5. The other nodes receive an error when trying to call `oracleAssignWork`, indicating that another node is processing the request.

When the node processing the request to the API receives a response, it will call the `fulfillRequest()` function that the user has implemented in their contract (by inheriting from `OracleClient`).

### Summary

This is a minimalist implementation of Chainlink's services that uses nodes sequentially rather than in parallel, as Chainlink does. This approach avoids the known issue of Chainlink calling APIs with a POST request.
