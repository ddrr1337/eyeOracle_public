// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {IdStockStorage} from "./interfaces/IdStockStorage.sol";

contract MMKToken is ERC20,ConfirmedOwner {

    address public storageAddress;

    modifier onlyAllowedMinter() {
        require(IdStockStorage(storageAddress).allowedMinters(msg.sender), "Only alowed minter can call this function");
        _; 
    }

    constructor(address _storageAddress) ERC20("MidnighMarkets", "MMK") ConfirmedOwner(msg.sender) {
        // Starting some initial supply 
        // this will be the initial supply needed to make all calculations in compound interest (initial capital)
        storageAddress = _storageAddress;
        _mint(msg.sender, 1000000 * 10 ** uint(decimals()));
    }

    


    function getStocksCount() public view returns(uint256) {
        address[] memory stocks = IdStockStorage(storageAddress).getStocksArray();

        return stocks.length;
    }



    // you MUST have this function in your ERC20 implementation, otherwhise stacking contract
    // will fail to compile due mint function not found in this contract.
    function mint(address to, uint256 amount) external onlyAllowedMinter {
        uint256 shareAmount = amount / getStocksCount();
        _mint(to,shareAmount);
    }

}