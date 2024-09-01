// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleRequest} from "./oracle/lib/OracleRequest.sol";
import {OracleClient} from "./oracle/OracleClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ExampleContract is OracleClient, ReentrancyGuard {
    using OracleRequest for OracleRequest.Request;

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
        fulfillRequestGasUsed = _fulfillRequestGasUsed;
    }

    function sendRequest() external payable nonReentrant {
        uint256 gasCost = gasCostFulfill();
        require(
            msg.value > gasCost,
            "ETH sent is less than gas cost for the callback"
        );

        string memory url = "http://dummyAddress/api/";

        // example of args
        string[] memory args = new string[](3);
        args[0] = "arg1";
        args[1] = "arg2";
        args[2] = "arg3";

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";

        req.setArgs(args);

        bytes memory argsData = req.encodeCBOR();

        uint256 requestId = _sendRequest(argsData);

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
