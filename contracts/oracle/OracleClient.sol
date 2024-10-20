// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleRouter} from "./interfaces/IOracleRouter.sol";

abstract contract OracleClient {
    IOracleRouter internal immutable i_router;

    event RequestSent(bytes32 indexed id);
    event RequestFulfilled(bytes32 indexed id);

    constructor(address router) {
        i_router = IOracleRouter(router);
    }

    function _sendRequest(
        bytes memory data,
        uint256 gasUsed
    ) internal returns (uint256) {
        uint256 requestId = i_router.startRequest{value: msg.value}(
            data,
            gasUsed
        );
        return requestId;
    }

    function fulfillRequest(
        uint256 requestId,
        bytes memory response
    ) internal virtual;

    function handleOracleFulfillment(
        uint256 requestId,
        bytes memory response
    ) external {
        require(
            msg.sender == address(i_router),
            "Only OracleRouter can fulfill"
        );

        fulfillRequest(requestId, response);
    }
}
