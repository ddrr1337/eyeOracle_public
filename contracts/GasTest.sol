// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GasTest {
    uint256 public gasPrice;

    function gasTest() public {
        gasPrice = tx.gasprice;
    }
}
