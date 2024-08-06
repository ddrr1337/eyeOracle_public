// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {IERC20Extended} from "./interfaces/IERC20Extended.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract dStockStorage is ConfirmedOwner {
    uint256 public compileDeploy;

    string public s_mintSourceCode;
    string public s_redeemSourceCode;

    address public functionsRouter;
    uint64 public subId;
    bytes32 public donId; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public

    struct Stock {
        string name;
        address stockAddress;
    }
    Stock[] public stocksDeployed;

    struct StockBalance {
        string name;
        address stockAddress;
        uint256 balance;
    }

    struct PoolReserves {
        string name;
        address stockAddress;
        address pairAddress;
        uint112 reserves0;
        uint112 reserves1;
    }

    mapping(address addressStock => bool isAllowed) public allowedContract;

    mapping(address user => uint256 accountbalance) public userBalance;

    constructor(uint256 _complieDeploy) ConfirmedOwner(msg.sender) {
        compileDeploy = _complieDeploy;
    }

    modifier onlyStockContract() {
        require(allowedContract[msg.sender], "Sender Is Not Allowed");
        _;
    }

    function addStock(string memory name, address stock) external {
        require(owner() == tx.origin, "Original Tx not from owner");
        allowedContract[stock] = true;
        stocksDeployed.push(Stock(name, stock));
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

    function getStocksArray() external view returns (Stock[] memory) {
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

    /////////////////////////// FRONTEND /////////////////////////////////////

    function getUserStockBalances(
        address account
    ) external view returns (StockBalance[] memory) {
        uint256 length = stocksDeployed.length;
        StockBalance[] memory stockBalances = new StockBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address stock = stocksDeployed[i].stockAddress;
            uint256 balance = IERC20Extended(stock).balanceOf(account);

            string memory name = IERC20Extended(stock).name();
            stockBalances[i] = StockBalance(name, stock, balance);
        }

        return stockBalances;
    }

    function getPriceOnPools(
        address factoryAddress,
        address addressTokenB
    ) external view returns (PoolReserves[] memory) {
        uint256 length = stocksDeployed.length;
        PoolReserves[] memory poolReserves = new PoolReserves[](length);

        for (uint256 i = 0; i < length; i++) {
            address stock = stocksDeployed[i].stockAddress;
            address pairAddress = IUniswapV2Factory(factoryAddress).getPair(
                stock,
                addressTokenB
            );

            if (pairAddress != address(0)) {
                // Verifica si el par existe
                (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(
                    pairAddress
                ).getReserves();
                string memory name = IERC20Extended(stock).name();
                poolReserves[i] = PoolReserves(
                    name,
                    stock,
                    pairAddress,
                    reserve0,
                    reserve1
                );
            } else {
                string memory name = IERC20Extended(stock).name();
                poolReserves[i] = PoolReserves(name, stock, pairAddress, 0, 0);
            }
        }
        return poolReserves;
    }
}
