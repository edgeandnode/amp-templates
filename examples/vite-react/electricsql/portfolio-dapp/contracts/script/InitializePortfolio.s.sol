// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

/**
 * @title InitializePortfolio
 * @author Portfolio Tracker
 * @notice Script to deploy and initialize a portfolio of ERC20 tokens
 * @dev Deploys 5 different tokens and distributes them to 2 user addresses
 */
contract InitializePortfolio is Script {
    // Token deployment configuration
    struct TokenConfig {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        uint256 user1Amount;
        uint256 user2Amount;
    }

    // Deployed token addresses
    ERC20Token public bitcoin;
    ERC20Token public ethereum;
    ERC20Token public usdc;
    ERC20Token public tether;
    ERC20Token public usds;

    // User addresses (Anvil default accounts)
    address public constant USER1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Anvil account #1
    address public constant USER2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Anvil account #2

    /**
     * @notice Helper function to get decimal divisor
     * @param decimals Number of decimals
     * @return uint256 The divisor (10^decimals)
     */
    function getDecimalDivisor(uint8 decimals) internal pure returns (uint256) {
        return 10 ** decimals;
    }

    /**
     * @notice Main script execution function
     */
    function run() public {
        // Define token configurations with varied distributions
        TokenConfig[5] memory tokens = [
            TokenConfig({
                name: "Wrapped Bitcoin",
                symbol: "WBTC",
                decimals: 8,
                totalSupply: 21_000_000 * 1e8,
                user1Amount: 50 * 1e8,         // User1 gets 50 WBTC
                user2Amount: 125 * 1e8         // User2 gets 125 WBTC
            }),
            TokenConfig({
                name: "Wrapped Ether",
                symbol: "WETH",
                decimals: 18,
                totalSupply: 120_000_000 * 1e18,
                user1Amount: 1_000 * 1e18,     // User1 gets 1,000 WETH
                user2Amount: 500 * 1e18        // User2 gets 500 WETH
            }),
            TokenConfig({
                name: "USD Coin",
                symbol: "USDC",
                decimals: 6,
                totalSupply: 50_000_000_000 * 1e6,
                user1Amount: 100_000 * 1e6,    // User1 gets 100,000 USDC
                user2Amount: 250_000 * 1e6     // User2 gets 250,000 USDC
            }),
            TokenConfig({
                name: "Tether USD",
                symbol: "USDT",
                decimals: 6,
                totalSupply: 50_000_000_000 * 1e6,
                user1Amount: 75_000 * 1e6,     // User1 gets 75,000 USDT
                user2Amount: 150_000 * 1e6     // User2 gets 150,000 USDT
            }),
            TokenConfig({
                name: "USDS Stablecoin",
                symbol: "USDS",
                decimals: 6,
                totalSupply: 10_000_000_000 * 1e6,
                user1Amount: 50_000 * 1e6,     // User1 gets 50,000 USDS
                user2Amount: 100_000 * 1e6     // User2 gets 100,000 USDS
            })
        ];

        // Get private keys from environment (Anvil accounts #0, #1, #2)
        uint256 deployerPrivateKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        uint256 user1PrivateKey = vm.envOr("USER1_PRIVATE_KEY", uint256(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d));
        uint256 user2PrivateKey = vm.envOr("USER2_PRIVATE_KEY", uint256(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a));

        address deployer = vm.addr(deployerPrivateKey);

        console.log("==========================================");
        console.log("Starting Portfolio ERC20 Tokens Deployment");
        console.log("==========================================");
        console.log("Deployer address:", deployer);
        console.log("User 1 address:", USER1);
        console.log("User 2 address:", USER2);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy and distribute all tokens
        // WBTC
        bitcoin = new ERC20Token(tokens[0].name, tokens[0].symbol, tokens[0].decimals, tokens[0].totalSupply, deployer);
        console.log("Deployed WBTC at address:", address(bitcoin));
        console.log("  Total Supply:", tokens[0].totalSupply / getDecimalDivisor(tokens[0].decimals), "WBTC");
        if (tokens[0].user1Amount > 0) {
            bitcoin.transfer(USER1, tokens[0].user1Amount);
            console.log("  Transferred", tokens[0].user1Amount / getDecimalDivisor(tokens[0].decimals), "WBTC to User1");
        }
        if (tokens[0].user2Amount > 0) {
            bitcoin.transfer(USER2, tokens[0].user2Amount);
            console.log("  Transferred", tokens[0].user2Amount / getDecimalDivisor(tokens[0].decimals), "WBTC to User2");
        }

        // WETH
        ethereum = new ERC20Token(tokens[1].name, tokens[1].symbol, tokens[1].decimals, tokens[1].totalSupply, deployer);
        console.log("Deployed WETH at address:", address(ethereum));
        console.log("  Total Supply:", tokens[1].totalSupply / getDecimalDivisor(tokens[1].decimals), "WETH");
        if (tokens[1].user1Amount > 0) {
            ethereum.transfer(USER1, tokens[1].user1Amount);
            console.log("  Transferred", tokens[1].user1Amount / getDecimalDivisor(tokens[1].decimals), "WETH to User1");
        }
        if (tokens[1].user2Amount > 0) {
            ethereum.transfer(USER2, tokens[1].user2Amount);
            console.log("  Transferred", tokens[1].user2Amount / getDecimalDivisor(tokens[1].decimals), "WETH to User2");
        }

        // USDC
        usdc = new ERC20Token(tokens[2].name, tokens[2].symbol, tokens[2].decimals, tokens[2].totalSupply, deployer);
        console.log("Deployed USDC at address:", address(usdc));
        console.log("  Total Supply:", tokens[2].totalSupply / getDecimalDivisor(tokens[2].decimals), "USDC");
        if (tokens[2].user1Amount > 0) {
            usdc.transfer(USER1, tokens[2].user1Amount);
            console.log("  Transferred", tokens[2].user1Amount / getDecimalDivisor(tokens[2].decimals), "USDC to User1");
        }
        if (tokens[2].user2Amount > 0) {
            usdc.transfer(USER2, tokens[2].user2Amount);
            console.log("  Transferred", tokens[2].user2Amount / getDecimalDivisor(tokens[2].decimals), "USDC to User2");
        }

        // USDT
        tether = new ERC20Token(tokens[3].name, tokens[3].symbol, tokens[3].decimals, tokens[3].totalSupply, deployer);
        console.log("Deployed USDT at address:", address(tether));
        console.log("  Total Supply:", tokens[3].totalSupply / getDecimalDivisor(tokens[3].decimals), "USDT");
        if (tokens[3].user1Amount > 0) {
            tether.transfer(USER1, tokens[3].user1Amount);
            console.log("  Transferred", tokens[3].user1Amount / getDecimalDivisor(tokens[3].decimals), "USDT to User1");
        }
        if (tokens[3].user2Amount > 0) {
            tether.transfer(USER2, tokens[3].user2Amount);
            console.log("  Transferred", tokens[3].user2Amount / getDecimalDivisor(tokens[3].decimals), "USDT to User2");
        }

        // USDS
        usds = new ERC20Token(tokens[4].name, tokens[4].symbol, tokens[4].decimals, tokens[4].totalSupply, deployer);
        console.log("Deployed USDS at address:", address(usds));
        console.log("  Total Supply:", tokens[4].totalSupply / getDecimalDivisor(tokens[4].decimals), "USDS");
        if (tokens[4].user1Amount > 0) {
            usds.transfer(USER1, tokens[4].user1Amount);
            console.log("  Transferred", tokens[4].user1Amount / getDecimalDivisor(tokens[4].decimals), "USDS to User1");
        }
        if (tokens[4].user2Amount > 0) {
            usds.transfer(USER2, tokens[4].user2Amount);
            console.log("  Transferred", tokens[4].user2Amount / getDecimalDivisor(tokens[4].decimals), "USDS to User2");
        }

        vm.stopBroadcast();

        // Perform inter-user transfers to demonstrate token functionality
        // Note: These use actual private keys and are broadcasted to the chain
        console.log("");
        console.log("========================================");
        console.log("Executing Inter-User Transfers");
        console.log("========================================");
        console.log("");

        // WBTC: User1 sends 10 WBTC to User2, User2 sends 5 WBTC back to User1
        console.log("WBTC Transfers:");
        vm.broadcast(user1PrivateKey);
        bitcoin.transfer(USER2, 10 * 1e8);
        console.log("  User1 -> User2:", 10, "WBTC");

        vm.broadcast(user2PrivateKey);
        bitcoin.transfer(USER1, 5 * 1e8);
        console.log("  User2 -> User1:", 5, "WBTC");

        // WETH: User2 sends 100 WETH to User1, User1 sends 200 WETH back to User2
        console.log("WETH Transfers:");
        vm.broadcast(user2PrivateKey);
        ethereum.transfer(USER1, 100 * 1e18);
        console.log("  User2 -> User1:", 100, "WETH");

        vm.broadcast(user1PrivateKey);
        ethereum.transfer(USER2, 200 * 1e18);
        console.log("  User1 -> User2:", 200, "WETH");

        // USDC: User1 sends 25,000 USDC to User2
        console.log("USDC Transfers:");
        vm.broadcast(user1PrivateKey);
        usdc.transfer(USER2, 25_000 * 1e6);
        console.log("  User1 -> User2:", 25_000, "USDC");

        // USDT: User2 sends 30,000 USDT to User1, User1 sends 10,000 USDT back to User2
        console.log("USDT Transfers:");
        vm.broadcast(user2PrivateKey);
        tether.transfer(USER1, 30_000 * 1e6);
        console.log("  User2 -> User1:", 30_000, "USDT");

        vm.broadcast(user1PrivateKey);
        tether.transfer(USER2, 10_000 * 1e6);
        console.log("  User1 -> User2:", 10_000, "USDT");

        // USDS: User1 sends 15,000 USDS to User2, User2 sends 20,000 USDS back to User1
        console.log("USDS Transfers:");
        vm.broadcast(user1PrivateKey);
        usds.transfer(USER2, 15_000 * 1e6);
        console.log("  User1 -> User2:", 15_000, "USDS");

        vm.broadcast(user2PrivateKey);
        usds.transfer(USER1, 20_000 * 1e6);
        console.log("  User2 -> User1:", 20_000, "USDS");

        // Log final portfolio summary
        logPortfolioSummary();
    }

    /**
     * @notice Log the final portfolio summary
     */
    function logPortfolioSummary() internal view {
        console.log("");
        console.log("==========================================");
        console.log("Portfolio ERC20 Tokens Deployment Complete");
        console.log("==========================================");
        console.log("");

        console.log("Token Addresses:");
        console.log("  WBTC:", address(bitcoin));
        console.log("  WETH:", address(ethereum));
        console.log("  USDC:", address(usdc));
        console.log("  USDT:", address(tether));
        console.log("  USDS:", address(usds));
        console.log("");

        console.log("User1 Portfolio (", USER1, "):");
        console.log("  WBTC:", bitcoin.balanceOf(USER1) / getDecimalDivisor(bitcoin.decimals()));
        console.log("  WETH:", ethereum.balanceOf(USER1) / getDecimalDivisor(ethereum.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER1) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", tether.balanceOf(USER1) / getDecimalDivisor(tether.decimals()));
        console.log("  USDS:", usds.balanceOf(USER1) / getDecimalDivisor(usds.decimals()));
        console.log("");

        console.log("User2 Portfolio (", USER2, "):");
        console.log("  WBTC:", bitcoin.balanceOf(USER2) / getDecimalDivisor(bitcoin.decimals()));
        console.log("  WETH:", ethereum.balanceOf(USER2) / getDecimalDivisor(ethereum.decimals()));
        console.log("  USDC:", usdc.balanceOf(USER2) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", tether.balanceOf(USER2) / getDecimalDivisor(tether.decimals()));
        console.log("  USDS:", usds.balanceOf(USER2) / getDecimalDivisor(usds.decimals()));
        console.log("");

        address deployer = vm.addr(vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)));
        console.log("Deployer Remaining Balances (", deployer, "):");
        console.log("  WBTC:", bitcoin.balanceOf(deployer) / getDecimalDivisor(bitcoin.decimals()));
        console.log("  WETH:", ethereum.balanceOf(deployer) / getDecimalDivisor(ethereum.decimals()));
        console.log("  USDC:", usdc.balanceOf(deployer) / getDecimalDivisor(usdc.decimals()));
        console.log("  USDT:", tether.balanceOf(deployer) / getDecimalDivisor(tether.decimals()));
        console.log("  USDS:", usds.balanceOf(deployer) / getDecimalDivisor(usds.decimals()));
        console.log("");

        console.log("========================================");
    }
}