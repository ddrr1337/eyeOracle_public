// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleRequest} from "./oracle/lib/OracleRequest.sol";
import {OracleClient} from "./oracle/OracleClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; //not sure if this is needed

contract ExampleContract is OracleClient, ReentrancyGuard {
    using OracleRequest for OracleRequest.Request;

    address public oracleRouter;

    struct RequestData {
        uint256 exampleUint256;
        address exampleAddress;
    }

    mapping(uint256 requestId => RequestData request)
        public s_requestIdToRequest;

    uint256 public fulfillRequestGasUsed;

    constructor(
        address oracleRouterAddress,
        uint256 _fulfillRequestGasUsed // calculate this off-chain and re-deploy with accurate gas units, first deploy pass any unit256
    ) OracleClient(oracleRouterAddress) {
        oracleRouter = oracleRouterAddress;
        fulfillRequestGasUsed = _fulfillRequestGasUsed;
    }

    function exampleSendRequestPOST() external payable nonReentrant {
        // comment this requirement on fist  deploy to check first how much gas cost your fulfill callback
        // then pass _fulfillRequestGasUsed to constructor with the real gas used in a second deploy
        // not proud of this!
        uint256 gasCost = gasCostFulfill();
        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://85.53.91.64:8001/api/test-request/";

        // example of args
        string[] memory args = new string[](3);
        args[0] = "arg0";
        args[1] = "arg1";
        args[2] = "arg2";

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";

        req.setArgs(args);

        bytes memory requestData = req.encodeCBOR();

        uint256 requestId = _sendRequest(requestData); //this will emit a event on OracleRouter that nodes will caputure

        // pay the fees for the oracle callback
        (bool success, ) = address(i_router).call{value: msg.value}("");

        require(success, "ETH transfer to OracleRouter failed");

        // Dummy data to show how to save the requestId of this request, for later build your code
        // inside fulfillRequest() based on the same requestId
        uint256 dummyUint256 = 11;
        address dummyAddress = address(0);

        s_requestIdToRequest[requestId] = RequestData(
            dummyUint256,
            dummyAddress
        );
    }

    function exampleSendRequestGET() external payable nonReentrant {
        // comment this requirement on fist  deploy to check first how much gas cost your fulfill callback
        // then pass _fulfillRequestGasUsed to constructor with the real gas used in a second deploy
        // not proud of this!
        uint256 gasCost = gasCostFulfill();
        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://85.53.91.64:8001/api/test-request/";
        OracleRequest.Request memory req;

        req.url = url;
        req.method = "GET";

        bytes memory requestData = req.encodeCBOR();

        uint256 requestId = _sendRequest(requestData); //this will emit a event on OracleRouter that nodes will caputure

        // pay the fees for the oracle callback
        (bool success, ) = address(i_router).call{value: msg.value}("");

        require(success, "ETH transfer to OracleRouter failed");

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
        //build here your logic for the oracle callback
    }

    function gasCostFulfill() public view returns (uint256) {
        uint256 gasPrice = tx.gasprice;
        return fulfillRequestGasUsed * gasPrice;
    }
}
