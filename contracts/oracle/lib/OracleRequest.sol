// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CBOR} from "./CBOR.sol";

library OracleRequest {
    using CBOR for CBOR.CBORBuffer;

    error EmptyArgs();
    error MissingUrl();
    error MissingMethod();

    uint256 internal constant DEFAULT_BUFFER_SIZE = 256;

    struct Request {
        string url;
        string method;
        string slot;
        string jsonResponsePath;
        string requestBody;
        string bodyValuesDataTypes;
        bool allowFloatResponse;
    }

    function encodeCBOR(
        Request memory self
    ) internal pure returns (bytes memory) {
        if (bytes(self.url).length == 0) revert MissingUrl(); // Revert if 'url' is missing
        if (bytes(self.method).length == 0) revert MissingMethod(); // Revert if 'method' is missing

        CBOR.CBORBuffer memory cbor = CBOR.create(DEFAULT_BUFFER_SIZE);

        // Start a map
        cbor.startMap();

        if (bytes(self.slot).length > 0) {
            cbor.writeKVString("slot", self.slot);
        }

        // Add key-value pairs
        cbor.writeKVString("url", self.url);
        cbor.writeKVString("method", self.method);
        cbor.writeKVString("jsonResponsePath", self.jsonResponsePath);

        if (bytes(self.requestBody).length > 0) {
            cbor.writeKVString("requestBody", self.requestBody);
        }
        if (bytes(self.bodyValuesDataTypes).length > 0) {
            cbor.writeKVString("bodyValuesDataTypes", self.bodyValuesDataTypes);
        }
        if (self.allowFloatResponse) {
            cbor.writeKVBool("allowFloatResponse", self.allowFloatResponse);
        }

        // End the map
        cbor.endSequence();

        // Return the encoded data
        return cbor.data();
    }
}
