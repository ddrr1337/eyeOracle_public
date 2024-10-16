// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {IConsumer} from "./interfaces/IConsumer.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OracleRouter is Ownable, ReentrancyGuard {
    uint256 public compileDeployer = 14;
    address public simulationCaller;
    uint256 public requestId;
    bytes public testerBytes;

    mapping(address consumer => address consumerOwner) public allowedConsumer;
    mapping(address consumerOwner => address[] consumers)
        public ownerConsumersArray;
    mapping(address nodeCaller => bool allowed) public allowedNodes;

    uint256 public constant baseOracleGasUsedToFulfill = 25000;
    uint8 public oracleFeeMultiplayer = 120;
    uint256 public lastETHReturned;

    struct RequestIdData {
        uint256 gasAssigned;
        bool isRequestFulfill;
    }

    mapping(uint256 requestId => RequestIdData requestDetails)
        public requestIdData;

    address[] public nodeCallers; // Array to store allowed nodes

    event OracleRequestHttp(
        uint256 indexed requestId,
        address indexed consumer,
        address indexed originalCaller,
        bytes request
    );

    event OracleResponse(
        uint256 indexed requestId,
        address indexed consumer,
        bytes reponse
    );

    // TESTER
    uint256 public testerGasPaid;
    uint256 public testerGasFulfill;
    uint256 public testerGasFulfillPlusFee;
    uint256 public testerGasUsageSent;
    uint256 public testerMsgValue;
    uint256 public testerGasUsed;
    uint256 public testerGasReturned;
    uint256 public testerNodeEthSent;

    // Pass as many wallets as nodes you deploy
    constructor(
        address _simulationCaller,
        address nodeCaller0,
        address nodeCaller1
    ) Ownable(msg.sender) {
        simulationCaller = _simulationCaller;
        allowedNodes[nodeCaller0] = true;
        allowedNodes[nodeCaller1] = true;
        allowedNodes[_simulationCaller] = true;
        nodeCallers.push(nodeCaller0);
        nodeCallers.push(nodeCaller1);
    }

    modifier onlyAllowedNodes() {
        require(allowedNodes[msg.sender], "Sender is not allowed");
        _;
    }

    modifier onlyAllowedConsumers() {
        require(
            allowedConsumer[msg.sender] != address(0),
            "Consumer not allowed"
        );
        _;
    }

    // Internal function that distributes ETH to the nodes with the lowest balance
    function _distributeETHToNodes() internal {
        require(address(this).balance > 0, "No funds available to transfer");

        // Find the node with the lowest balance
        if (address(this).balance > 10 ** 16) {
            address nodeWithLowestBalance = nodeCallers[0];
            uint256 lowestBalance = nodeWithLowestBalance.balance;

            for (uint256 i = 1; i < nodeCallers.length; i++) {
                uint256 currentBalance = nodeCallers[i].balance;
                if (currentBalance < lowestBalance) {
                    nodeWithLowestBalance = nodeCallers[i];
                    lowestBalance = currentBalance;
                }
            }
            uint256 transferAmount = address(this).balance - 10 ** 16;

            // Transfer the funds to the node with the lowest balance
            payable(nodeWithLowestBalance).transfer(transferAmount);
        }
    }

    // Function to start an oracle request
    function startRequest(
        bytes memory data,
        uint256 gasUsed
    ) external payable nonReentrant onlyAllowedConsumers returns (uint256) {
        require(
            msg.value > gasUsed * tx.gasprice,
            "Sent less eth than gas to use"
        );

        testerGasPaid = gasUsed * tx.gasprice;
        testerGasUsageSent = gasUsed;
        testerMsgValue = msg.value;

        requestId++;
        testerBytes = data;
        requestIdData[requestId].gasAssigned = gasUsed;

        // Emit event so nodes can capture the request
        emit OracleRequestHttp(requestId, msg.sender, tx.origin, data);

        // Distribute the ETH to the nodes
        _distributeETHToNodes();

        return requestId;
    }

    function fulfill(
        address originalCaller,
        address consumer,
        uint256 _requestId,
        bytes memory response
    ) external payable onlyAllowedNodes {
        uint256 initialGas = gasleft(); // Store initial gas at the start of fulfill

        // Call the consumer contract to handle the response
        IConsumer(consumer).handleOracleFulfillment(_requestId, response);

        // Calculate gas used during the execution of fulfill
        uint256 userGasPaid = requestIdData[_requestId].gasAssigned;

        emit OracleResponse(_requestId, consumer, response);

        uint256 gasUsed = initialGas - gasleft();
        testerGasUsed = gasUsed;

        if (msg.sender != simulationCaller) {
            /* require(
                msg.value >= lastETHReturned,
                "Node needs to send eth for the last gasReturned"
            ); */
            uint256 gasReturned = userGasPaid -
                (((gasUsed + baseOracleGasUsedToFulfill) *
                    oracleFeeMultiplayer) / 100);
            lastETHReturned = gasReturned * tx.gasprice;

            payable(originalCaller).transfer(gasReturned * tx.gasprice);
        }
    }

    function addConsumer(address consumer) external {
        require(
            allowedConsumer[consumer] == address(0),
            "Can not re-assing a consumerOwner to an active consumer"
        );
        allowedConsumer[consumer] = msg.sender;
        ownerConsumersArray[msg.sender].push(consumer);
    }

    function removeConsumer(address consumer) external {
        require(
            allowedConsumer[consumer] == msg.sender,
            "Remove command not from owner"
        );

        // Remove from the mapping
        allowedConsumer[consumer] = address(0);

        // Remove from the array
        address[] storage consumers = ownerConsumersArray[msg.sender];
        for (uint256 i = 0; i < consumers.length; i++) {
            if (consumers[i] == consumer) {
                // Move the last element to the place of the one being removed
                consumers[i] = consumers[consumers.length - 1];
                consumers.pop(); // Remove the last element
                break; // Exit the loop once the consumer has been found and removed
            }
        }
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

    function getOwnerConsumers(
        address ownerAddress
    ) public view returns (address[] memory) {
        return ownerConsumersArray[ownerAddress];
    }

    function withdrawETH(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    receive() external payable {}
}
