// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OracleRequest} from "./lib/OracleRequest.sol";
import {OracleClient} from "./OracleClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TesterContract is OracleClient {
    using OracleRequest for OracleRequest.Request;
    using Strings for uint256;

    bytes public tester;
    uint256 public requestIdTester;
    uint256 public testerResponse;
    uint256 public testerResponseRequestId;
    uint256 public fulfillRequestGasUsed = 29239;
    uint256 public testGasPrice;

    constructor(
        address oracleRouterAddress
    ) OracleClient(oracleRouterAddress) {}

    function sendRequest(string memory ticker, uint256 quantity) external {
        testGasPrice = gasCostFulfill();

        string memory url = "http://85.53.91.64:8001/api/tester-response/";
        string memory formattedAddress = Strings.toHexString(
            uint160(msg.sender),
            20
        );

        string[] memory args = new string[](4);
        args[0] = ticker;
        args[1] = quantity.toString();
        args[2] = "buy";
        args[3] = formattedAddress;

        OracleRequest.Request memory req;

        req.url = url;
        req.method = "POST";

        req.setArgs(args);

        tester = req.encodeCBOR();

        uint256 requestId = _sendRequest(tester, address(this));

        requestIdTester = requestId;
    }

    function fulfillRequest(
        uint256 requestId,
        uint256 response
    ) external override {
        testerResponseRequestId = requestId;
        testerResponse = response;
    }

    function gasCostFulfill() public view returns (uint256) {
        uint256 gasPrice = tx.gasprice; // Gas price en wei por unidad de gas
        return fulfillRequestGasUsed * gasPrice; // Costo total de gas en wei
    }

    receive() external payable {}
}
