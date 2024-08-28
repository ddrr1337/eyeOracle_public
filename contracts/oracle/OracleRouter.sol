// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OracleRouter {
    uint256 public requestId;
    bytes public testerBytes;
    uint256 deploy = 1;

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        bytes request
    );

    function startRequest(
        bytes memory data,
        address consumer
    ) external returns (uint256) {
        requestId++;
        testerBytes = data;

        emit OracleRequestHttp(requestId, consumer, data);

        return requestId;
    }
}
