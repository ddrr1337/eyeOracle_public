// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOracleRouter {
    function startRequest(
        bytes memory data,
        address consumer
    ) external returns (uint256);
}
