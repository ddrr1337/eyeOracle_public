// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleRouter} from "./interfaces/IOracleRouter.sol";
import {OracleRequest} from "./lib/OracleRequest.sol";

/// @title The Chainlink Functions client contract
/// @notice Contract developers can inherit this contract in order to make Chainlink Functions requests
abstract contract OracleClient {
    using OracleRequest for OracleRequest.Request;

    IOracleRouter internal immutable i_router;

    event RequestSent(bytes32 indexed id);
    event RequestFulfilled(bytes32 indexed id);

    constructor(address router) {
        i_router = IOracleRouter(router);
    }

    function _sendRequest(
        bytes memory data,
        address consumer
    ) internal returns (uint256) {
        uint256 requestId = i_router.startRequest(data, consumer);
        return requestId;
    }

    function fulfillRequest(
        uint256 requestId,
        uint256 response
    ) internal virtual;

    function handleOracleFulfillment(
        uint256 requestId,
        uint256 response
    ) external {
        require(
            msg.sender == address(i_router),
            "Only OracleRouter can fulfill"
        );

        fulfillRequest(requestId, response);
    }
}
