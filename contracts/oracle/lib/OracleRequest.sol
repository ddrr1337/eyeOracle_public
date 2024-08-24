// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CBOR} from "./CBOR.sol";

library OracleRequest {
    using CBOR for CBOR.CBORBuffer;

    error EmptyArgs();
    error EmptyUrl();
    error EmptyRequester();

    uint256 internal constant DEFAULT_BUFFER_SIZE = 256;

    struct Request {
        string url;
        string method;
        string[] args;
    }

    function encodeCBOR(
        Request memory self
    ) internal pure returns (bytes memory) {
        CBOR.CBORBuffer memory cbor = CBOR.create(256);

        // Start a map
        cbor.startMap();

        // Add key-value pairs
        cbor.writeKVString("url", self.url);
        cbor.writeKVString("method", self.method);

        if (self.args.length > 0) {
            cbor.writeString("args");
            cbor.startArray();
            for (uint256 i = 0; i < self.args.length; ++i) {
                cbor.writeString(self.args[i]);
            }
            cbor.endSequence();
        }

        // End the map
        cbor.endSequence();

        // Return the encoded data
        return cbor.data();
    }

    function setArgs(Request memory self, string[] memory args) internal pure {
        if (args.length == 0) revert EmptyArgs();

        self.args = args;
    }
}
