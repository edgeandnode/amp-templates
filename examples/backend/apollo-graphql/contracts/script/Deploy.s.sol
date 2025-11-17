// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TestToken.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        
        // Deploy test token with 1 million supply
        TestToken token = new TestToken(1_000_000);
        
        console.log("TestToken deployed at:", address(token));
        console.log("Total supply:", token.totalSupply());
        
        vm.stopBroadcast();
    }
}