// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOracleRouter {
    function startRequest(bytes memory data) external returns (uint256);

    function addConsumer(address consumer) external;
}
