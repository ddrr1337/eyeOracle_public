// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OracleGrid {
    mapping(uint256 requestId => uint64 tookByOracleId) public requstIdStatus;

    function OracleAssignWork(uint256 _requestId, uint64 oracleId) external {
        require(
            requstIdStatus[_requestId] == 0,
            "RequestId took by other oracle"
        );
        requstIdStatus[_requestId] = oracleId;
    }
}
