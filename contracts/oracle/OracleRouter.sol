// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OracleRouter {
    uint256 public requestId;
    bytes public testerBytes;

    event OracleRequestHttp(uint256 indexed requestId, bytes request);

    function startRequest(bytes memory data) external returns (uint256) {
        requestId++;
        testerBytes = data;

        emit OracleRequestHttp(requestId, data);

        return requestId;
    }
}
