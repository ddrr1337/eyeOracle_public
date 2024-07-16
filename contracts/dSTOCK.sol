// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity 0.8.25;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IdStockSourceCodeStorage} from "./interfaces/IdStockSourceCodeStorage.sol";

contract dSTOCK is ConfirmedOwner, FunctionsClient, ERC20 {
    uint256 public httpRequestNonce = 2150;
    address tester;
    bool testerBool = true;
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
        uint256 amountUsdcSent;
        address requester;
        MintOrRedeem mintOrRedeem;
    }

    uint256 PRECISION = 1e18;
    uint256 ADDITIONAL_FEED_PRECCISION = 1e10;

    address public immutable i_FUNCTIONS_ROUTER;
    address public immutable i_USDC;
    uint256 public constant USDC_DECIMALS = 10 ** 6;

    string public s_mintSourceCode;
    string public s_redeemSourceCode;
    uint64 immutable i_subId;
    bytes32 public i_DON_ID; //testing public
    uint64 public secretVersion; //testing public
    uint8 public secretSlot; //testing public
    address public immutable i_storeSorceCodeAddress;

    uint32 constant GAS_LIMIT = 300_000;
    uint256 constant COLLATERAL_RATIO = 200; //
    uint256 constant COLLATERAL_PRECISION = 100; //
    uint256 constant MINIMUM_WITHDRAW_AMOUNT = 100 * 1e6;
    uint256 constant ERC20_DECIMALS = 1e18;

    uint256 private s_portfolioBalance;

    mapping(bytes32 requestId => dStockRequest request)
        public s_requestIdToRequest;

    mapping(address user => uint256 pendingWithdrawAmount)
        public s_userToWithdrawAmount;

    constructor(
        string memory mintSourceCode,
        uint64 subId,
        address FUNCTIONS_ROUTER,
        address USDC,
        bytes32 DON_ID,
        uint64 _secretVersion,
        uint8 _secretSlot,
        string memory stockName,
        address storeSorceCodeAddress
    )
        ConfirmedOwner(msg.sender)
        FunctionsClient(FUNCTIONS_ROUTER)
        ERC20(stockName, string(abi.encodePacked("d", stockName)))
    {
        s_mintSourceCode = mintSourceCode;
        i_subId = subId;
        i_FUNCTIONS_ROUTER = FUNCTIONS_ROUTER;
        i_USDC = USDC;
        i_DON_ID = DON_ID;
        secretVersion = _secretVersion;
        secretSlot = _secretSlot;
        i_storeSorceCodeAddress = storeSorceCodeAddress;
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

    function fundAccount(uint256 amountToFund) external {
        userBalance[msg.sender] += amountToFund;
    }

    function sendMintRequest(
        uint256 amountUSDC
    ) external onlyOwner returns (bytes32) {
        require(
            amountUSDC * USDC_DECIMALS < userBalance[msg.sender],
            "Not enought usdc balance, fund contract first"
        );
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_mintSourceCode);
        req.addDONHostedSecrets(secretSlot, secretVersion);
        string[] memory args = new string[](3);
        args[0] = "TSLA";
        args[1] = amountUSDC.toString();
        args[2] = httpRequestNonce.toString();
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            i_subId,
            GAS_LIMIT,
            i_DON_ID
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
                .amountUsdcSent;
            userBalance[requester] -= usdcAmountSent;
            _mint(requester, uint256(bytes32(response)));
        }
    }

    function sendRedeemRequest() external {}

    function _redeemFulFillRequest() public {}

    function withdraw() external {
        uint256 amountToWithdraw = s_userToWithdrawAmount[msg.sender];
        s_userToWithdrawAmount[msg.sender] = 0;

        bool succ = ERC20(i_USDC).transfer(msg.sender, amountToWithdraw);
        if (!succ) {
            revert dSTOCK__transferFailed();
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

    function getRequest(
        bytes32 requestId
    ) public view returns (dStockRequest memory) {
        return s_requestIdToRequest[requestId];
    }

    function getWithdrawalAmount(address user) public view returns (uint256) {
        return s_userToWithdrawAmount[user];
    }
}
