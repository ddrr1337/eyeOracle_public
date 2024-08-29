// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleGrid is ConfirmedOwner {
    event OracleAssignment(uint256 indexed requestId, uint64 indexed oracleId);

    mapping(uint256 requestId => uint64 tookByOracleId) public requstIdStatus;
    mapping(address nodeCaller => bool isAllowed) public allowedNodeCallers;
    mapping(address consumer => bool isAllowedConsumer) public allowedConsumer;
    address[] public nodeCallers;
    uint256 deployer = 3;

    constructor() ConfirmedOwner(msg.sender) {
        allowedNodeCallers[0x26baAC08CB753303de111e904e19BaF91e6b5E4d] = true;
        allowedNodeCallers[0xF0cfffB35BfADc51AaDdfBbe20fc7a4CBfB2feA8] = true;
        nodeCallers.push(0x26baAC08CB753303de111e904e19BaF91e6b5E4d);
        nodeCallers.push(0xF0cfffB35BfADc51AaDdfBbe20fc7a4CBfB2feA8);
    }

    modifier onlyAllowedNodes() {
        require(allowedNodeCallers[msg.sender], "Caller not Allowed");
        _;
    }

    receive() external payable {}

    function gasSplitter() external payable {
        require(msg.value > 0, "No ETH sent"); // Verifica que se haya enviado ETH

        uint256 minBalance = type(uint256).max;
        address minBalanceAddress = address(0);

        // Itera sobre todos los nodeCallers para encontrar el que tiene el saldo más bajo
        for (uint256 i = 0; i < nodeCallers.length; i++) {
            address recipient = nodeCallers[i];
            uint256 balance = recipient.balance;

            if (balance < minBalance) {
                minBalance = balance;
                minBalanceAddress = recipient;
            }
        }
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

    function addConsumer(address consumer) external {
        allowedConsumer[consumer] = true;
    }

    function removeConsumer(address consumer) external {
        allowedConsumer[consumer] = false;
    }
}
