// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleRequest} from "./oracle/lib/OracleRequest.sol";
import {OracleClient} from "./oracle/OracleClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; //not sure if this is needed

contract ExampleContract is OracleClient, ReentrancyGuard {
    using OracleRequest for OracleRequest.Request;

    uint256 public gasSent;
    uint256 public gasPriceTest;

    address public oracleRouter;

    struct RequestData {
        uint256 exampleUint256;
        address exampleAddress;
    }

    mapping(uint256 requestId => RequestData request)
        public s_requestIdToRequest;

    mapping(uint256 => uint256) public exampleFulfillResponse;

    constructor(address oracleRouterAddress) OracleClient(oracleRouterAddress) {
        oracleRouter = oracleRouterAddress;
    }

    function exampleSendRequestPOST(
        uint256 fulfillGasUsed
    ) external payable nonReentrant {
        uint256 gasCost = gasCostFulfill(fulfillGasUsed);
        gasSent = msg.value;
        gasPriceTest = tx.gasprice;

        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://85.55.18.40:8001/api/test-request/";

        // example of args
        string[] memory args = new string[](3);
        args[0] = "arg0";
        args[1] = "arg1";
        args[2] = "arg2";

        OracleRequest.Request memory req;

        req.url = url; //requiered
        req.method = "POST"; //required

        //req.slot = "4";

        req.setArgs(args);

        bytes memory requestData = req.encodeCBOR();

        //this will emit a event on OracleRouter that nodes will caputure
        //msg.value is sent here
        uint256 requestId = _sendRequest(requestData, fulfillGasUsed);

        // Dummy data to show how to save the requestId of this request, for later build your code
        // inside fulfillRequest() based on the same requestId
        uint256 dummyUint256 = 11;
        address dummyAddress = address(0);

        s_requestIdToRequest[requestId] = RequestData(
            dummyUint256,
            dummyAddress
        );
    }

    function exampleSendRequestGET(
        uint256 fulfillGasUsed
    ) external payable nonReentrant {
        // comment this requirement on fist  deploy to check first how much gas cost your fulfill callback
        // then pass _fulfillRequestGasUsed to constructor with the real gas used in a second deploy
        // not proud of this!
        uint256 gasCost = gasCostFulfill(fulfillGasUsed);
        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://85.55.18.40:8001/api/test-request/";
        OracleRequest.Request memory req;

        req.url = url;
        req.method = "GET";
        req.jsonResponsePath = "data.clientId[3]";

        bytes memory requestData = req.encodeCBOR();

        uint256 requestId = _sendRequest(requestData, fulfillGasUsed); //this will emit a event on OracleRouter that nodes will caputure

        uint256 dummyUint256 = 11;
        address dummyAddress = address(0);

        s_requestIdToRequest[requestId] = RequestData(
            dummyUint256,
            dummyAddress
        );
    }

    // THIS FUNCTION IS CALLED BY THE ORACLE
    // First calculate the gas units for the callback off-chain
    // oracle will call fulfill() on the OracleRouter address, you can see there the transactions of
    // fulfill() to know the gas units spent of oracle callback
    // then re-deploy this contract and set in the constructor the gas units in _fulfillRequestGasUsed
    function fulfillRequest(
        uint256 requestId,
        uint256 response
    ) internal override {
        exampleFulfillResponse[requestId] = response;
    }

    function gasCostFulfill(
        uint256 fulfillGasUsed
    ) public view returns (uint256) {
        uint256 gasPrice = tx.gasprice;
        return fulfillGasUsed * gasPrice;
    }
}
