// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OracleRequest} from "./lib/OracleRequest.sol";
import {OracleClient} from "./OracleClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TesterContract is OracleClient {
    using OracleRequest for OracleRequest.Request;

    bytes public tester;
    uint256 public requestIdTester;

    constructor(
        address oracleRouterAddress
    ) OracleClient(oracleRouterAddress) {}

    function sendRequest() external {
        string memory url = "http://dummyAddress.com/";
        string memory formattedAddress = Strings.toHexString(
            uint160(msg.sender),
            20
        );
        string[] memory args = new string[](2);
        args[0] = formattedAddress;
        args[1] = "tester1";

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";

        req.setArgs(args);

        tester = req.encodeCBOR();

        uint256 requestId = _sendRequest(tester);

        requestIdTester = requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external override {}
}
