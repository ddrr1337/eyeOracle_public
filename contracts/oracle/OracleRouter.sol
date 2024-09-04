// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {IConsumer} from "./interfaces/IConsumer.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleRouter is ConfirmedOwner {
    uint256 public requestId;
    bytes public testerBytes;
    uint256 deploy = 2;
    mapping(address consumer => bool allowed) public allowedConsumer;
    mapping(address nodeCaller => bool allowed) public allowedNodes;

    address[] public nodeCallers; // Arreglo para almacenar los nodos permitidos

    //test
    address eventCaller;

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        address indexed originalCaller,
        bytes request
    );

    constructor(
        address nodeCaller0,
        address nodeCaller1
    ) ConfirmedOwner(msg.sender) {
        allowedNodes[nodeCaller0] = true;
        allowedNodes[nodeCaller1] = true;
        nodeCallers.push(nodeCaller0);
        nodeCallers.push(nodeCaller1);
    }

    modifier onlyAllowedNodes() {
        require(allowedNodes[msg.sender], "Sender Is Not Allowed");
        _;
    }

    modifier onlyAllowedConsumers() {
        require(allowedConsumer[msg.sender], "Consumer Not Allowed");
        _;
    }

    function startRequest(
        bytes memory data
    ) external onlyAllowedConsumers returns (uint256) {
        eventCaller = tx.origin;
        requestId++;
        testerBytes = data;

        emit OracleRequestHttp(requestId, msg.sender, tx.origin, data);

        return requestId;
    }

    function fulfill(
        address consumer,
        uint256 _requestId,
        uint256 response
    ) external onlyAllowedNodes {
        IConsumer(consumer).handleOracleFulfillment(_requestId, response);
    }

    function addConsumer(address consumer) external onlyOwner {
        allowedConsumer[consumer] = true;
    }

    function removeConsumer(address consumer) external onlyOwner {
        allowedConsumer[consumer] = false;
    }

    function addNodeCaller(address nodeCaller) external onlyOwner {
        allowedNodes[nodeCaller] = true;
        nodeCallers.push(nodeCaller);
    }

    function removeNodeCaller(address nodeCaller) external onlyOwner {
        require(allowedNodes[nodeCaller], "NodeCaller not found");

        allowedNodes[nodeCaller] = false;

        for (uint256 i = 0; i < nodeCallers.length; i++) {
            if (nodeCallers[i] == nodeCaller) {
                nodeCallers[i] = nodeCallers[nodeCallers.length - 1];
                nodeCallers.pop();
                break;
            }
        }
    }

    receive() external payable {
        require(address(this).balance > 0, "No funds available to transfer");

        // Find lower ETH balance nodeCaller
        address nodeWithLowestBalance = nodeCallers[0];
        uint256 lowestBalance = nodeWithLowestBalance.balance;

        for (uint256 i = 1; i < nodeCallers.length; i++) {
            uint256 currentBalance = nodeCallers[i].balance;
            if (currentBalance < lowestBalance) {
                nodeWithLowestBalance = nodeCallers[i];
                lowestBalance = currentBalance;
            }
        }

        // Transfer to lower balance nodeCaller
        payable(nodeWithLowestBalance).transfer(address(this).balance);
    }
}
