// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity 0.8.25;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IdStockStorage} from "./interfaces/IdStockStorage.sol";

contract dSTOCK is ConfirmedOwner, FunctionsClient, ERC20 {
    uint256 public httpRequestNonce;

    using FunctionsRequest for FunctionsRequest.Request;
    using Strings for uint256;

    error dSTOCK__DoesntMeetMinimumWithdrawAmount();
    error dSTOCK__transferFailed();

    // ERRORS NOT USED, DELETE!
    error dSTOCK__NotEnoughCollateral();
    error dSTOCK__notEnoughTslainBroker();

    enum MintOrRedeem {
        mint,
        redeem
    }

    mapping(address user => uint256 accountbalance) public userBalance;

    struct dStockRequest {
        uint256 amountTokenSent;
        address requester;
        MintOrRedeem mintOrRedeem;
    }

    address public immutable i_FUNCTIONS_ROUTER;
    address public immutable i_USDC;
    uint256 public constant USDC_DECIMALS = 10 ** 6;

    address public immutable i_storeSorceCodeAddress;

    uint32 public constant GAS_LIMIT = 300_000;
    uint256 constant MINIMUM_WITHDRAW_AMOUNT = 100 * 1e6;

    mapping(bytes32 requestId => dStockRequest request)
        public s_requestIdToRequest;

    mapping(address user => uint256 pendingWithdrawAmount)
        public s_userToWithdrawAmount;

    constructor(
        address FUNCTIONS_ROUTER,
        address USDC,
        string memory stockName,
        address storeSorceCodeAddress,
        uint256 nonce
    )
        ConfirmedOwner(msg.sender)
        FunctionsClient(FUNCTIONS_ROUTER)
        ERC20(stockName, string(abi.encodePacked("d", stockName)))
    {
        i_FUNCTIONS_ROUTER = FUNCTIONS_ROUTER;
        i_USDC = USDC;

        i_storeSorceCodeAddress = storeSorceCodeAddress;
        httpRequestNonce = nonce;

        IdStockStorage(i_storeSorceCodeAddress).addStock(address(this));
    }

    function sendMintRequest(
        uint256 amountUSDC
    ) external onlyOwner returns (bytes32) {
        require(
            IdStockStorage(i_storeSorceCodeAddress).userBalance(msg.sender) >=
                amountUSDC,
            "Not enought balance in store contract"
        );
        (
            uint64 subId,
            bytes32 donId,
            uint64 secretVersion,
            uint8 secretSlot
        ) = IdStockStorage(i_storeSorceCodeAddress).getVariables();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(getMintCode());
        req.addDONHostedSecrets(secretSlot, secretVersion);
        string[] memory args = new string[](3);
        args[0] = this.name();
        args[1] = amountUSDC.toString();
        args[2] = httpRequestNonce.toString();

        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subId,
            GAS_LIMIT,
            donId
        );
        s_requestIdToRequest[requestId] = dStockRequest(
            amountUSDC * USDC_DECIMALS,
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
        if (uint256(bytes32(response)) != 0) {
            // substract amountUSDC used
            address requester = s_requestIdToRequest[requestId].requester;
            uint256 usdcAmountSent = s_requestIdToRequest[requestId]
                .amountTokenSent;

            IdStockStorage(i_storeSorceCodeAddress).substractAmount(
                requester,
                usdcAmountSent
            );

            _mint(requester, uint256(bytes32(response)));
        }
    }

    function sendRedeemRequest(
        uint256 amountStock
    ) external onlyOwner returns (bytes32) {
        (
            uint64 subId,
            bytes32 donId,
            uint64 secretVersion,
            uint8 secretSlot
        ) = IdStockStorage(i_storeSorceCodeAddress).getVariables();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(getRedeemCode());
        req.addDONHostedSecrets(secretSlot, secretVersion);
        string[] memory args = new string[](3);
        args[0] = "TSLA";
        args[1] = "998058375000000000";
        args[2] = httpRequestNonce.toString();
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subId,
            GAS_LIMIT,
            donId
        );
        s_requestIdToRequest[requestId] = dStockRequest(
            amountStock,
            msg.sender,
            MintOrRedeem.redeem
        );
        httpRequestNonce++;
        return requestId;
    }

    function _redeemFulFillRequest() public {}

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /*err*/
    ) internal override {
        if (s_requestIdToRequest[requestId].mintOrRedeem == MintOrRedeem.mint) {
            _mintFulfillRequest(requestId, response);
        } else {
            _redeemFulFillRequest();
        }
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW AND PURE
    //////////////////////////////////////////////////////////////*/

    function getMintCode() public view returns (string memory) {
        string memory mintCode = IdStockStorage(i_storeSorceCodeAddress)
            .s_mintSourceCode();
        return mintCode;
    }

    function getRedeemCode() public view returns (string memory) {
        string memory redeemCode = IdStockStorage(i_storeSorceCodeAddress)
            .s_redeemSourceCode();
        return redeemCode;
    }

    function getRequest(
        bytes32 requestId
    ) public view returns (dStockRequest memory) {
        return s_requestIdToRequest[requestId];
    }

    function getWithdrawalAmount(address user) public view returns (uint256) {
        return s_userToWithdrawAmount[user];
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
        (
            uint64 subId,
            bytes32 donId,
            uint64 secretVersion,
            uint8 secretSlot
        ) = IdStockStorage(i_storeSorceCodeAddress).getVariables();

        return (subId, donId, secretVersion, secretSlot);
    }

    function changeNonce(uint256 nonce) public {
        httpRequestNonce = nonce;
    }

    //////////////// TESTING ////////////////

    function tester() public view returns (string memory) {
        string memory testName = this.name();
        return testName;
    }
}
