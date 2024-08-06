// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

interface IChainlinkConsumer {
    function addConsumer(uint64 subscriptionId, address consumer) external;
}
