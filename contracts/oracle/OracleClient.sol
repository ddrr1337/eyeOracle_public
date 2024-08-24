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

    function _sendRequest(bytes memory data) internal returns (uint256) {
        uint256 requestId = i_router.startRequest(data);
        return requestId;
    }

    /// @notice User defined function to handle a response from the DON
    /// @param requestId The request ID, returned by sendRequest()
    /// @param response Aggregated response from the execution of the user's source code
    /// @param err Aggregated error from the execution of the user code or from the execution pipeline
    /// @dev Either response or error parameter will be set, but never both
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external virtual;
}
