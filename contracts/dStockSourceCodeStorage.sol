// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract dStockSourceCodeStorage is ConfirmedOwner {
    string public s_mintSourceCode;
    string public s_redeemSourceCode;

    address public functionsRouter;
    uint64 public subId;
    bytes32 public donId; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public
    uint256 public httpRequestNonce;

    constructor(uint256 nonce) ConfirmedOwner(msg.sender) {
        httpRequestNonce = nonce;
    }

    function changeNonce(uint256 nonce) public onlyOwner {
        httpRequestNonce = nonce;
    }

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

    function getVariables()
        external
        view
        returns (
            uint64 _subId,
            bytes32 _donId,
            uint64 _secretVersion,
            uint8 _secretSlot
        )
    {
        return (subId, donId, secretVersion, secretSlot);
    }
}
