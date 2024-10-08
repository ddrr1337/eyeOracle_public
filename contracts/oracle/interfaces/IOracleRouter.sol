// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOracleRouter {
    struct RequestIdData {
        uint256 gasAssigned;
        bool isRequestFulfill;
    }

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        address indexed originalCaller,
        bytes request
    );

    event OracleResponse(
        uint256 indexed requestId,
        address indexed consumer,
        uint256 indexed response
    );

    function startRequest(
        bytes memory data,
        uint256 gasUsed
    ) external payable returns (uint256);

    function fulfill(
        address consumer,
        uint256 _requestId,
        uint256 response
    ) external;

    function addConsumer(address consumer) external;

    function removeConsumer(address consumer) external;

    function addNodeCaller(address nodeCaller) external;

    function removeNodeCaller(address nodeCaller) external;

    function getOwnerConsumers(
        address ownerAddress
    ) external view returns (address[] memory);

    function allowedConsumer(address consumer) external view returns (address);

    function ownerConsumersArray(
        address owner
    ) external view returns (address[] memory);

    function allowedNodes(address nodeCaller) external view returns (bool);

    function requestIdData(
        uint256 requestId
    ) external view returns (RequestIdData memory);

    function nodeCallers(uint256 index) external view returns (address);

    function simulationCaller() external view returns (address);

    function baseOracleGasUsedToFulfill() external view returns (uint256);
}
