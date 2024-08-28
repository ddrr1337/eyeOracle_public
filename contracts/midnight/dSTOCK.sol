// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IdStockStorage} from "./interfaces/IdStockStorage.sol";
import {CompoundSimpleRewards} from "./CompoundSimpleRewards.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {OracleClient} from "../oracle/OracleClient.sol";
import {OracleRequest} from "../oracle/lib/OracleRequest.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract dSTOCK is ConfirmedOwner, OracleClient, ERC20, ReentrancyGuard {
    using OracleRequest for OracleRequest.Request;
    using Strings for uint256;

    uint256 public httpRequestNonce;
    uint256 public requestIdTester;
    uint256 public fulfillRequestGasUsed = 29239;
    address public compoundSimpleRewardsAddress;

    // TESTING
    uint256 public testRequestID;
    uint256 public testingRate;
    uint256 public testGasPrice;
    bytes public dataMintRequestTest;
    uint256 public oracleResponse;
    uint256 public testerResponseRequestId;
    uint256 public deploy = 7;

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

    address public immutable oracleRouter;
    address public immutable i_USDC;
    uint256 public constant USDC_DECIMALS = 10 ** 6;

    address public immutable storeAddress;

    mapping(uint256 requestId => dStockRequest request)
        public s_requestIdToRequest;

    constructor(
        address _oracleRouter,
        address USDC,
        string memory stockName,
        address uniswapFactoryAddress,
        address _storeAddress,
        address MMToken,
        uint256 rateOfInterest
    )
        ConfirmedOwner(msg.sender)
        OracleClient(_oracleRouter)
        ERC20(stockName, string(abi.encodePacked("d", stockName)))
    {
        oracleRouter = _oracleRouter;
        i_USDC = USDC;

        storeAddress = _storeAddress;
        testingRate = rateOfInterest;

        address pairAddress = IUniswapV2Factory(uniswapFactoryAddress)
            .createPair(address(this), USDC);

        // Desplegar un nuevo contrato CompoundSimpleRewards y almacenar su dirección
        uint256 startRewardsAt = block.timestamp;
        CompoundSimpleRewards compoundSimpleRewards = new CompoundSimpleRewards(
            pairAddress,
            MMToken,
            startRewardsAt,
            0,
            rateOfInterest
        );
        compoundSimpleRewardsAddress = address(compoundSimpleRewards);

        IdStockStorage(_storeAddress).addStock(
            string(abi.encodePacked("d", stockName)),
            address(this),
            address(compoundSimpleRewards)
        );
    }

    modifier onlyAllowedStocks() {
        require(
            IdStockStorage(storeAddress).allowedContract(address(this)),
            "This Contract is not Allowed"
        );
        _;
    }

    //imput in eth units
    function sendMintRequest(
        uint256 quantity
    ) external nonReentrant returns (uint256) {
        testGasPrice = gasCostFulfill();

        string memory url = "http://85.53.91.64:8001/api/tester-response/";
        string memory formattedAddress = Strings.toHexString(
            uint160(msg.sender),
            20
        );

        string[] memory args = new string[](4);
        args[0] = this.name();
        args[1] = quantity.toString();
        args[2] = "buy";
        args[3] = formattedAddress;

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";

        req.setArgs(args);

        dataMintRequestTest = req.encodeCBOR();

        uint256 requestId = _sendRequest(dataMintRequestTest, address(this));
        require(
            s_requestIdToRequest[requestId].amountTokenSent == 0,
            "Request ID already in use"
        );

        s_requestIdToRequest[requestId] = dStockRequest(
            quantity * USDC_DECIMALS,
            msg.sender,
            MintOrRedeem.mint
        );

        requestIdTester = requestId;

        return requestId;
    }

    function _mintFulfillRequest(uint256 requestId, uint256 response) internal {
        address requester = s_requestIdToRequest[requestId].requester;
        if (response != 0) {
            // substract amountUSDC used

            uint256 usdcAmountSent = s_requestIdToRequest[requestId]
                .amountTokenSent;

            /*             IdStockStorage(storeAddress).substractAmount(
                requester,
                usdcAmountSent
            ); */

            _mint(requester, response);
        }
    }

    function fulfillRequest(
        uint256 requestId,
        uint256 response
    ) external override {
        testerResponseRequestId = requestId;
        oracleResponse = response;
        if (s_requestIdToRequest[requestId].mintOrRedeem == MintOrRedeem.mint) {
            _mintFulfillRequest(requestId, response);
        }
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW AND PURE
    //////////////////////////////////////////////////////////////*/

    function getRequest(
        uint256 requestId
    ) public view returns (dStockRequest memory) {
        return s_requestIdToRequest[requestId];
    }

    function changeNonce(uint256 nonce) public {
        httpRequestNonce = nonce;
    }

    //////////////// TESTING ////////////////

    function tester() public view returns (string memory) {
        string memory testName = this.name();
        return testName;
    }

    function gasCostFulfill() public view returns (uint256) {
        uint256 gasPrice = tx.gasprice; // Gas price en wei por unidad de gas
        return fulfillRequestGasUsed * gasPrice; // Costo total de gas en wei
    }
}
