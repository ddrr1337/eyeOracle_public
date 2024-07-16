// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract dStockSourceCodeStorage is ConfirmedOwner {
    bool public tester = false;
    uint256 public testerint = 3;

    string public s_mintSourceCode;
    string public s_redeemSourceCode;

    uint64 public subId;
    bytes32 public donId; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public

    constructor() ConfirmedOwner(msg.sender) {}

    function changeSubIdAndDonId(
        uint64 _subId,
        bytes32 _donId
    ) public onlyOwner {
        subId = _subId;
        donId = _donId;
    }

    function changeSlotAndVersionDon(
        uint64 _secretVersion,
        uint8 _secretSlot
    ) external onlyOwner {
        secretVersion = _secretVersion;
        secretSlot = _secretSlot;
    }

    function setMintCode(string memory mintSourceCode) external onlyOwner {
        s_mintSourceCode = mintSourceCode;
    }

    function setRedeemCode(string memory redeemSourceCode) external onlyOwner {
        s_redeemSourceCode = redeemSourceCode;
    }
}
