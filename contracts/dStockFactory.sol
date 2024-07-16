// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {dSTOCK} from "./dSTOCK.sol";

contract dStockFactory is ConfirmedOwner {
    string public s_mintSourceCode;
    string public s_redeemSourceCode;

    address[] public deployedStocks;
    uint64 public subId;
    address public immutable i_FUNCTIONS_ROUTER;

    bytes32 public donId; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public

    constructor(
        uint64 _subId,
        bytes32 _donId,
        uint64 _secretVersion,
        uint8 _secretSlot
    ) ConfirmedOwner(msg.sender) {
        subId = _subId;
        donId = _donId;
        secretVersion = _secretVersion;
        secretSlot = _secretSlot;
    }

    function changeSubId(uint64) public onlyOwner {
        subId = subId;
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

    /*     function deployStock(
        address functionsRouter,
        address usdcAddress,
        string memory stockName
    ) external onlyOwner returns (address) {
        dSTOCK newStock = new dSTOCK(
            s_mintSourceCode,
            subId,
            functionsRouter,
            usdcAddress,
            donId,
            secretVersion,
            secretSlot,
            stockName
        );
        deployedStocks.push(address(newStock));
        return address(newStock);
    } */
}
