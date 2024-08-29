// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IConsumer {
    function fulfillRequest(uint256 _requestId, uint256 response) external;
}
