// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleGrid is ConfirmedOwner {
    event OracleAssignment(uint256 indexed requestId, uint64 indexed oracleId);

    mapping(uint256 requestId => uint64 tookByOracleId) public requstIdStatus;
    mapping(address nodeCaller => bool isAllowed) public allowedNodeCallers;
    address[] public nodeCallers;

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

    function oracleAssignWork(
        uint256 _requestId,
        uint64 oracleId
    ) external onlyAllowedNodes {
        require(
            requstIdStatus[_requestId] == 0,
            "RequestId took by other oracle"
        );
        requstIdStatus[_requestId] = oracleId;

        emit OracleAssignment(_requestId, oracleId);
    }
}
