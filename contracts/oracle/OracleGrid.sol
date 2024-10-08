// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleGrid is ConfirmedOwner {
    event OracleAssignment(uint256 indexed requestId, uint64 indexed oracleId);

    mapping(uint256 => uint64) public requstIdStatus;
    mapping(address => bool) public allowedNodeCallers;
    address[] public nodeCallers;
    uint256 public compileIndex = 21; //force redeploy

    // 2 nodes setup
    constructor(
        address allowedCaller1,
        address allowedCaller2
    ) ConfirmedOwner(msg.sender) {
        allowedNodeCallers[allowedCaller1] = true;
        allowedNodeCallers[allowedCaller2] = true;

        nodeCallers.push(allowedCaller1);
        nodeCallers.push(allowedCaller2);
    }

    modifier onlyAllowedNodes() {
        require(allowedNodeCallers[msg.sender], "Caller not Allowed");
        _;
    }

    // Function to receive Ether
    receive() external payable {}

    // Fallback function to handle any incoming Ether
    fallback() external payable {}

    function oracleAssignWork(
        uint256 _requestId,
        uint64 oracleId
    ) external onlyAllowedNodes {
        require(
            requstIdStatus[_requestId] == 0,
            "RequestId taken by other oracle"
        );

        uint256 startGas = gasleft(); // Start gas measurement

        requstIdStatus[_requestId] = oracleId;

        emit OracleAssignment(_requestId, oracleId);

        uint256 gasUsed = startGas - gasleft(); // Calculate gas used
        uint256 gasCost = gasUsed * tx.gasprice; // Calculate the cost of gas

        // Check if the contract has enough ETH to cover the gas cost
        if (address(this).balance >= gasCost) {
            // Transfer the gas cost to the caller if there is enough balance
            payable(msg.sender).transfer(gasCost);
        }
    }

    // Function to withdraw all Ether to the owner
    function withdrawEtherToOwner() external onlyOwner {
        uint256 balance = address(this).balance; // Get the contract's balance
        require(balance > 0, "No Ether available");

        // Transfer the entire balance to the owner
        payable(owner()).transfer(balance);
    }
}
