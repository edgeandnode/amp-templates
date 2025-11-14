// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

/**
 * @title DoTransfers
 * @author Portfolio Tracker
 * @notice Script to execute inter-user token transfers for testing
 * @dev Performs transfers between User1 and User2 for all deployed tokens
 */
contract DoTransfers is Script {
    // User addresses (Anvil default accounts)
    address public constant USER1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Anvil account #1
    address public constant USER2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Anvil account #2

    // Token addresses - should be set via environment variables or constructor
    address public wbtcAddress;
    address public wethAddress;
    address public usdcAddress;
    address public usdtAddress;
    address public usdsAddress;

    /**
     * @notice Helper function to get decimal divisor
     * @param decimals Number of decimals
     * @return uint256 The divisor (10^decimals)
     */
    function getDecimalDivisor(uint8 decimals) internal pure returns (uint256) {
        return 10 ** decimals;
    }

    /**
     * @notice Load token addresses from environment variables
     */
    function loadTokenAddresses() internal {
        wbtcAddress = vm.envAddress("WBTC_ADDRESS");
        wethAddress = vm.envAddress("WETH_ADDRESS");
        usdcAddress = vm.envAddress("USDC_ADDRESS");
        usdtAddress = vm.envAddress("USDT_ADDRESS");
        usdsAddress = vm.envAddress("USDS_ADDRESS");

        console.log("==========================================");
        console.log("Loaded Token Addresses:");
        console.log("==========================================");
        console.log("WBTC:", wbtcAddress);
        console.log("WETH:", wethAddress);
        console.log("USDC:", usdcAddress);
        console.log("USDT:", usdtAddress);
        console.log("USDS:", usdsAddress);
        console.log("");
    }

    /**
     * @notice Log portfolio balances before transfers
     */
    function logBalancesBefore() internal view {
        ERC20Token wbtc = ERC20Token(wbtcAddress);
        ERC20Token weth = ERC20Token(wethAddress);
        ERC20Token usdc = ERC20Token(usdcAddress);
        ERC20Token usdt = ERC20Token(usdtAddress);
        ERC20Token usds = ERC20Token(usdsAddress);

        console.log("==========================================");
        console.log("Balances Before Transfers");
        console.log("==========================================");
        console.log("");

        console.log("User1 Portfolio (", USER1, "):");
        console.log("  WBTC:", wbtc.balanceOf(USER1) / getDecimalDivisor(wbtc.decimals()));
        console.log("  WETH:", weth.balanceOf(USER1) / getDecimalDivisor(weth.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER1) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", usdt.balanceOf(USER1) / getDecimalDivisor(usdt.decimals()));
        console.log("  USDS:", usds.balanceOf(USER1) / getDecimalDivisor(usds.decimals()));
        console.log("");

        console.log("User2 Portfolio (", USER2, "):");
        console.log("  WBTC:", wbtc.balanceOf(USER2) / getDecimalDivisor(wbtc.decimals()));
        console.log("  WETH:", weth.balanceOf(USER2) / getDecimalDivisor(weth.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER2) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", usdt.balanceOf(USER2) / getDecimalDivisor(usdt.decimals()));
        console.log("  USDS:", usds.balanceOf(USER2) / getDecimalDivisor(usds.decimals()));
        console.log("");
    }

    /**
     * @notice Log portfolio balances after transfers
     */
    function logBalancesAfter() internal view {
        ERC20Token wbtc = ERC20Token(wbtcAddress);
        ERC20Token weth = ERC20Token(wethAddress);
        ERC20Token usdc = ERC20Token(usdcAddress);
        ERC20Token usdt = ERC20Token(usdtAddress);
        ERC20Token usds = ERC20Token(usdsAddress);

        console.log("");
        console.log("==========================================");
        console.log("Balances After Transfers");
        console.log("==========================================");
        console.log("");

        console.log("User1 Portfolio (", USER1, "):");
        console.log("  WBTC:", wbtc.balanceOf(USER1) / getDecimalDivisor(wbtc.decimals()));
        console.log("  WETH:", weth.balanceOf(USER1) / getDecimalDivisor(weth.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER1) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", usdt.balanceOf(USER1) / getDecimalDivisor(usdt.decimals()));
        console.log("  USDS:", usds.balanceOf(USER1) / getDecimalDivisor(usds.decimals()));
        console.log("");

        console.log("User2 Portfolio (", USER2, "):");
        console.log("  WBTC:", wbtc.balanceOf(USER2) / getDecimalDivisor(wbtc.decimals()));
        console.log("  WETH:", weth.balanceOf(USER2) / getDecimalDivisor(weth.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER2) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", usdt.balanceOf(USER2) / getDecimalDivisor(usdt.decimals()));
        console.log("  USDS:", usds.balanceOf(USER2) / getDecimalDivisor(usds.decimals()));
        console.log("");

        console.log("========================================");
    }

    /**
     * @notice Main script execution function
     */
    function run() public {
        // Load token addresses from environment
        loadTokenAddresses();

        // Get token instances
        ERC20Token wbtc = ERC20Token(wbtcAddress);
        ERC20Token weth = ERC20Token(wethAddress);
        ERC20Token usdc = ERC20Token(usdcAddress);
        ERC20Token usdt = ERC20Token(usdtAddress);
        ERC20Token usds = ERC20Token(usdsAddress);

        // Get private keys from environment (Anvil accounts #1, #2)
        uint256 user1PrivateKey = vm.envOr("USER1_PRIVATE_KEY", uint256(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d));
        uint256 user2PrivateKey = vm.envOr("USER2_PRIVATE_KEY", uint256(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a));

        console.log("User 1 address:", USER1);
        console.log("User 2 address:", USER2);
        console.log("");

        // Log balances before transfers
        logBalancesBefore();

        // Perform inter-user transfers to demonstrate token functionality
        // Note: These use actual private keys and are broadcasted to the chain
        console.log("========================================");
        console.log("Executing Inter-User Transfers");
        console.log("========================================");
        console.log("");

        // WBTC: User1 sends 10 WBTC to User2, User2 sends 5 WBTC back to User1
        console.log("WBTC Transfers:");
        vm.broadcast(user1PrivateKey);
        wbtc.transfer(USER2, 10 * 1e8);
        console.log("  User1 -> User2:", 10, "WBTC");

        vm.broadcast(user2PrivateKey);
        wbtc.transfer(USER1, 5 * 1e8);
        console.log("  User2 -> User1:", 5, "WBTC");

        // WETH: User2 sends 100 WETH to User1, User1 sends 200 WETH back to User2
        console.log("WETH Transfers:");
        vm.broadcast(user2PrivateKey);
        weth.transfer(USER1, 100 * 1e18);
        console.log("  User2 -> User1:", 100, "WETH");

        vm.broadcast(user1PrivateKey);
        weth.transfer(USER2, 200 * 1e18);
        console.log("  User1 -> User2:", 200, "WETH");

        // USDC: User1 sends 25,000 USDC to User2
        console.log("USDC Transfers:");
        vm.broadcast(user1PrivateKey);
        usdc.transfer(USER2, 25_000 * 1e6);
        console.log("  User1 -> User2:", 25_000, "USDC");

        // USDT: User2 sends 30,000 USDT to User1, User1 sends 10,000 USDT back to User2
        console.log("USDT Transfers:");
        vm.broadcast(user2PrivateKey);
        usdt.transfer(USER1, 30_000 * 1e6);
        console.log("  User2 -> User1:", 30_000, "USDT");

        vm.broadcast(user1PrivateKey);
        usdt.transfer(USER2, 10_000 * 1e6);
        console.log("  User1 -> User2:", 10_000, "USDT");

        // USDS: User1 sends 15,000 USDS to User2, User2 sends 20,000 USDS back to User1
        console.log("USDS Transfers:");
        vm.broadcast(user1PrivateKey);
        usds.transfer(USER2, 15_000 * 1e6);
        console.log("  User1 -> User2:", 15_000, "USDS");

        vm.broadcast(user2PrivateKey);
        usds.transfer(USER1, 20_000 * 1e6);
        console.log("  User2 -> User1:", 20_000, "USDS");

        // Log balances after transfers
        logBalancesAfter();

        console.log("Inter-User Transfers Complete");
        console.log("========================================");
    }
}
