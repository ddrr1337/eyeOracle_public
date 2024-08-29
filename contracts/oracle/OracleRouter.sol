// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {IConsumer} from "./interfaces/IConsumer.sol";

contract OracleRouter {
    uint256 public requestId;
    bytes public testerBytes;
    uint256 deploy = 1;
    mapping(address consumer => bool allowed) public allowedConsumer;
    mapping(address nodeCaller => bool allowed) public allowedNodes;

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        bytes request
    );

    constructor(address nodeCaller) {
        allowedNodes[nodeCaller] = true;
    }

    modifier onlyAllowedNodes() {
        require(allowedNodes[msg.sender], "Sender Is Not Allowed");
        _;
    }

    function startRequest(
        bytes memory data,
        address consumer
    ) external returns (uint256) {
        requestId++;
        testerBytes = data;

        emit OracleRequestHttp(requestId, consumer, data);

        return requestId;
    }

    function fulfill(
        address consumer,
        uint256 _requestId,
        uint256 response
    ) external onlyAllowedNodes {
        IConsumer(consumer).fulfillRequest(_requestId, response);
    }

    function addConsumer(address consumer) external {
        allowedConsumer[consumer] = true;
    }

    function removeConsumer(address consumer) external {
        allowedConsumer[consumer] = false;
    }

    function addNodeCaller(address nodeCaller) external {
        allowedNodes[nodeCaller] = true;
    }
}
