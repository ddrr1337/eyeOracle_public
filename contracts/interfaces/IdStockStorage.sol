// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

interface IdStockStorage {
    function changeSubIdAndDonId(uint64 _subId, bytes32 _donId) external;

    function changeSlotAndVersionDon(
        uint64 _secretVersion,
        uint8 _secretSlot
    ) external;

    function setMintCode(string memory mintSourceCode) external;

    function setRedeemCode(string memory redeemSourceCode) external;

    function subId() external view returns (uint64);

    function donId() external view returns (bytes32);

    function secretVersion() external view returns (uint64);

    function secretSlot() external view returns (uint8);

    function s_mintSourceCode() external view returns (string memory);

    function s_redeemSourceCode() external view returns (string memory);

    function getVariables()
        external
        view
        returns (
            uint64 _subId,
            bytes32 _donId,
            uint64 _secretVersion,
            uint8 _secretSlot
        );

    function addStock(address stock) external;

    function getStocksArray() external view returns (address[] memory);

    function fundAccount(address user, uint256 amountUsdc) external;

    function userBalance(address user) external returns (uint256);

    function substractAmount(address user, uint256 amountUsdc) external;
}
