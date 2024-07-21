// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract dStockStorage is ConfirmedOwner {
    address[] public stocksDeployed;
    string public s_mintSourceCode;
    string public s_redeemSourceCode;

    address public functionsRouter;
    uint64 public subId;
    bytes32 public donId; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public

    mapping(address addressStock => bool isAllowed) public allowedContract;

    mapping(address user => uint256 accountbalance) public userBalance;

    constructor() ConfirmedOwner(msg.sender) {}

    modifier onlyStockContract() {
        require(allowedContract[msg.sender], "Sender Not Allowed");
        _;
    }

    function addStock(address stock) external {
        require(owner() == tx.origin);
        allowedContract[stock] = true;
        stocksDeployed.push(stock);
    }

    function fundAccount(uint256 amountUsdc) external {
        userBalance[msg.sender] += amountUsdc;
    }

    function substractAmount(
        address user,
        uint256 amountUSdc
    ) external onlyStockContract {
        require(
            userBalance[user] >= amountUSdc,
            "Too much amount to substract"
        );
        userBalance[user] -= amountUSdc;
    }

    function getStocksArray() external view returns (address[] memory) {
        return stocksDeployed;
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
