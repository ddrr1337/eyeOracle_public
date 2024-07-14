// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity 0.8.25;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract dTESLA is ConfirmedOwner, FunctionsClient, ERC20 {
    bool public testing = true;
    uint256 public test = 3;
    address public testAddress;

    using FunctionsRequest for FunctionsRequest.Request;
    using Strings for uint256;

    error dTESLA__NotEnoughCollateral();
    error dTSLA__DoesntMeetMinimumWithdrawAmount();
    error sTESLA_transferFailed();
    error sTESLA_notEnoughTslainBroker();

    enum MintOrRedeem {
        mint,
        redeem
    }

    struct dTeslaRequest {
        uint256 amountOfToken;
        address requester;
        MintOrRedeem mintOrRedeem;
    }

    uint256 PRECISION = 1e18;
    uint256 ADDITIONAL_FEED_PRECCISION = 1e10;

    address public immutable i_SEPOLIA_FUNCTIONS_ROUTER;
    address public immutable i_SEPOLIA_TSLA_PRICE_FEED;
    address public immutable i_SEPOLIA_USDC_PRICE_FEED;
    address public immutable i_SEPOLIA_USDC;
    bytes32 public immutable i_DON_ID;
    string public s_mintSourceCode;
    string public s_redeemSourceCode;
    uint64 immutable i_subId;
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public

    uint32 constant GAS_LIMIT = 300_000;
    uint256 constant COLLATERAL_RATIO = 200; //
    uint256 constant COLLATERAL_PRECISION = 100; //
    uint256 constant MINIMUM_WITHDRAW_AMOUNT = 100 * 1e6;
    uint256 constant ERC20_DECIMALS = 1e18;

    uint256 private s_portfolioBalance;

    mapping(bytes32 requestId => dTeslaRequest request)
        public s_requestIdToRequest;

    mapping(address user => uint256 accountbalance) public uerBalance;

    mapping(address user => uint256 pendingWithdrawAmount)
        public s_userToWithdrawAmount;

    uint256 public httpRequestNonce;

    constructor(
        string memory mintSourceCode,
        uint64 subId,
        address SEPOLIA_FUNCTIONS_ROUTER,
        address SEPOLIA_TSLA_PRICE_FEED,
        address SEPOLIA_USDC_PRICE_FEED,
        address SEPOLIA_USDC,
        bytes32 DON_ID,
        uint64 _secretVersion,
        uint8 _secretSlot
    )
        ConfirmedOwner(msg.sender)
        FunctionsClient(SEPOLIA_FUNCTIONS_ROUTER)
        ERC20("dTSLA", "dTSLA")
    {
        s_mintSourceCode = mintSourceCode;
        i_subId = subId;
        i_SEPOLIA_FUNCTIONS_ROUTER = SEPOLIA_FUNCTIONS_ROUTER;
        i_SEPOLIA_TSLA_PRICE_FEED = SEPOLIA_TSLA_PRICE_FEED;
        i_SEPOLIA_USDC_PRICE_FEED = SEPOLIA_USDC_PRICE_FEED;
        i_SEPOLIA_USDC = SEPOLIA_USDC;
        i_DON_ID = DON_ID;
        secretVersion = _secretVersion;
        secretSlot = _secretSlot;
    }

    function testBool(bool testBoolValue) external {
        testing = testBoolValue;
    }

    function setRedeemCode(string memory redeemSourceCode) external onlyOwner {
        s_redeemSourceCode = redeemSourceCode;
    }

    function changeSlotAndVersionDon(
        uint64 _secretVersion,
        uint8 _secretSlot
    ) external onlyOwner {
        secretVersion = _secretVersion;
        secretSlot = _secretSlot;
    }

    function fundAccount() external {
        //fund your account with USDC
    }

    function sendMintRequest(
        uint256 amount
    ) external onlyOwner returns (bytes32) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_mintSourceCode);
        req.addDONHostedSecrets(secretSlot, secretVersion);
        string[] memory args = new string[](2);
        args[0] = "AAPL";
        args[1] = amount.toString();
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            i_subId,
            GAS_LIMIT,
            i_DON_ID
        );
        s_requestIdToRequest[requestId] = dTeslaRequest(
            amount,
            msg.sender,
            MintOrRedeem.mint
        );
        httpRequestNonce++;
        return requestId;
    }

    function _mintFulfillRequest(
        bytes32 requestId,
        bytes memory response
    ) internal {
        _mint(
            s_requestIdToRequest[requestId].requester,
            uint256(bytes32(response))
        );
    }

    function sendRedeemRequest(uint256 amountdTesla) external {
        uint256 amountTslaInUsdc = getUsdcValueOfUsd(
            getusdValueOfTsla(amountdTesla)
        );
        if (amountTslaInUsdc > MINIMUM_WITHDRAW_AMOUNT) {
            revert dTSLA__DoesntMeetMinimumWithdrawAmount();
        }

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_redeemSourceCode);

        string[] memory args = new string[](2);

        args[0] = amountdTesla.toString();
        args[1] = amountTslaInUsdc.toString();

        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            i_subId,
            GAS_LIMIT,
            i_DON_ID
        );
        s_requestIdToRequest[requestId] = dTeslaRequest(
            amountdTesla,
            msg.sender,
            MintOrRedeem.redeem
        );

        _burn(msg.sender, amountdTesla);
    }

    function _redeemFulFillRequest(
        bytes32 requestId,
        bytes memory response
    ) internal {
        // This is going to have redemptioncoindecimals decimals
        uint256 usdcAmount = uint256(bytes32(response));
        if (usdcAmount == 0) {
            uint256 amountOfdTESLABurned = s_requestIdToRequest[requestId]
                .amountOfToken;
            _mint(
                s_requestIdToRequest[requestId].requester,
                amountOfdTESLABurned
            );
            return;
        }

        s_userToWithdrawAmount[
            s_requestIdToRequest[requestId].requester
        ] += usdcAmount;
    }

    function withdraw() external {
        uint256 amountToWithdraw = s_userToWithdrawAmount[msg.sender];
        s_userToWithdrawAmount[msg.sender] = 0;

        bool succ = ERC20(i_SEPOLIA_USDC).transfer(
            msg.sender,
            amountToWithdraw
        );
        if (!succ) {
            revert sTESLA_transferFailed();
        }
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /*err*/
    ) internal override {
        _mintFulfillRequest(requestId, response);
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW AND PURE
    //////////////////////////////////////////////////////////////*/

    function _getCollateralRatioAdjustedTotalBalance(
        uint256 amountOfTokensToMint
    ) internal view returns (uint256) {
        uint256 calculatedNewTotalValue = getCalculatedNewTotalValue(
            amountOfTokensToMint
        );
        return
            (calculatedNewTotalValue * COLLATERAL_RATIO) / COLLATERAL_PRECISION;
    }

    function getCalculatedNewTotalValue(
        uint256 addedNumberOfTokens
    ) internal view returns (uint256) {
        return
            ((totalSupply() + addedNumberOfTokens) * getTslaPrice()) /
            PRECISION;
    }

    function getUsdcValueOfUsd(
        uint256 usdAmount
    ) public view returns (uint256) {
        return (usdAmount * getUsdcPrice()) / PRECISION;
    }

    function getusdValueOfTsla(
        uint256 tlsaAmount
    ) public view returns (uint256) {
        return (tlsaAmount * getTslaPrice()) / PRECISION;
    }

    function getTslaPrice() public view returns (uint256) {
        AggregatorV3Interface piceFeed = AggregatorV3Interface(
            i_SEPOLIA_TSLA_PRICE_FEED
        );
        (, int256 price, , , ) = piceFeed.latestRoundData();
        return uint256(price) * ADDITIONAL_FEED_PRECCISION;
    }

    function getUsdcPrice() public view returns (uint256) {
        AggregatorV3Interface piceFeed = AggregatorV3Interface(
            i_SEPOLIA_USDC_PRICE_FEED
        );
        (, int256 price, , , ) = piceFeed.latestRoundData();
        return uint256(price) * ADDITIONAL_FEED_PRECCISION;
    }

    function getRequest(
        bytes32 requestId
    ) public view returns (dTeslaRequest memory) {
        return s_requestIdToRequest[requestId];
    }

    function getWithdrawalAmount(address user) public view returns (uint256) {
        return s_userToWithdrawAmount[user];
    }
}
