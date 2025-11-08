// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TestToken.sol";

contract GenerateActivity is Script {
    // User addresses (Anvil default accounts)
    address public constant USER1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Anvil account #1
    address public constant USER2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Anvil account #2
    address public constant USER3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // Anvil account #3
    
    function run() external {
        // Deploy a new token for this activity
        vm.startBroadcast();
        TestToken token = new TestToken(1_000_000);
        vm.stopBroadcast();
        
        console.log("Deployed TestToken at:", address(token));
        console.log("Generating transfer activity...");
        
        // Get private keys for anvil accounts
        uint256 deployerKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        uint256 user1Key = vm.envOr("USER1_PRIVATE_KEY", uint256(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d));
        uint256 user2Key = vm.envOr("USER2_PRIVATE_KEY", uint256(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a));
        
        // Generate multiple transfers with different accounts
        console.log("Transfer 1: Deployer -> User1 (10,000 tokens)");
        vm.broadcast(deployerKey);
        token.transfer(USER1, 10_000 * 10**18);
        
        console.log("Transfer 2: Deployer -> User2 (15,000 tokens)"); 
        vm.broadcast(deployerKey);
        token.transfer(USER2, 15_000 * 10**18);
        
        console.log("Transfer 3: User1 -> User2 (5,000 tokens)");
        vm.broadcast(user1Key);
        token.transfer(USER2, 5_000 * 10**18);
        
        console.log("Transfer 4: User2 -> User1 (2,000 tokens)");
        vm.broadcast(user2Key);
        token.transfer(USER1, 2_000 * 10**18);
        
        console.log("Transfer 5: Deployer -> User3 (8,000 tokens)");
        vm.broadcast(deployerKey);
        token.transfer(USER3, 8_000 * 10**18);
        
        console.log("Transfer activity generation complete!");
        console.log("Token address:", address(token));
    }
}