// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {IConsumer} from "./interfaces/IConsumer.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleRouter is ConfirmedOwner {
    uint256 public requestId;
    bytes public testerBytes;
    uint256 deploy = 1;
    mapping(address consumer => bool allowed) public allowedConsumer;
    mapping(address nodeCaller => bool allowed) public allowedNodes;
    address public mainCaller;

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        bytes request
    );

    constructor(address nodeCaller) ConfirmedOwner(msg.sender) {
        allowedNodes[nodeCaller] = true;
        mainCaller = nodeCaller;
    }

    modifier onlyAllowedNodes() {
        require(allowedNodes[msg.sender], "Sender Is Not Allowed");
        _;
    }

    function changeMainCaller(address newMainCaller) external onlyOwner {
        mainCaller = newMainCaller;
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
        IConsumer(consumer).handleOracleFulfillment(_requestId, response);
    }

    function billingCallBack() internal {
        // Transfiere el saldo total del contrato a `mainCaller`
        require(address(this).balance > 0, "No funds available to transfer");
        payable(mainCaller).transfer(address(this).balance);
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

    receive() external payable {
        billingCallBack();
    }
}
