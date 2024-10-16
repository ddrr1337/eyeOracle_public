// SPDX-License-Identifier: MIT
// Example Contract
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

    bytes public exampleFulfillResponseBytes;
    uint256 public exampleFulfillResponseUint256;

    string public testerCustomBody;

    constructor(address oracleRouterAddress) OracleClient(oracleRouterAddress) {
        oracleRouter = oracleRouterAddress;
    }

    function exampleSendRequestPOST(
        uint256 fulfillGasUsed,
        string memory valueInput_1,
        string memory valueInput_2
    ) external payable nonReentrant {
        uint256 gasCost = gasCostFulfill(fulfillGasUsed);

        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://<your host>:<port>/sum/"; //<--- SETUP YOUR HOST HERE

        string memory requestBody = string(
            abi.encodePacked(
                '{"arg_1":"', //<--- We setted in server.js this key body so we pass it now
                valueInput_1,
                '","arg_2":"', //<--- We setted in server.js this key body so we pass it now
                valueInput_2,
                '"}'
            )
        );

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";
        req.slot = "0";
        req.jsonResponsePath = "data.result";
        req.requestBody = requestBody;
        req.bodyValuesDataTypes = '["uint256","uint256"]';

        bytes memory requestData = req.encodeCBOR();

        //this will emit a event on OracleRouter that nodes will caputure
        //msg.value is sent here
        uint256 requestId = _sendRequest(requestData, fulfillGasUsed);
    }

    function exampleSendRequestGET(
        uint256 fulfillGasUsed
    ) external payable nonReentrant {
        uint256 gasCost = gasCostFulfill(fulfillGasUsed);
        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://<your host>:<port>/api/data/";
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
    // oracle will call fulfill() on the OracleRouter address
    function fulfillRequest(
        uint256 requestId,
        bytes memory response
    ) internal override {
        exampleFulfillResponseBytes = response;
    }

    function decodeBytesToUint256() public view returns (uint256) {
        uint256 value = abi.decode(exampleFulfillResponseBytes, (uint256));
        return value;
    }

    function decodeBytesToString() public view returns (string memory) {
        string memory value = string(exampleFulfillResponseBytes);
        return value;
    }

    function decodeBytesToBool() public view returns (bool) {
        bool value = abi.decode(exampleFulfillResponseBytes, (bool));
        return value;
    }

    function gasCostFulfill(
        uint256 fulfillGasUsed
    ) public view returns (uint256) {
        uint256 gasPrice = tx.gasprice;
        return fulfillGasUsed * gasPrice;
    }
}
