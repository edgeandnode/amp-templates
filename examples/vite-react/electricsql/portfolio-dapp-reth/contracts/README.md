# ERC20 Token Smart Contract

## Overview

This folder implements standard ERC20 token smart contract on a local Ethereum development environment (Anvil) for testing the Portfolio dapp. The implementation uses Foundry/Forge for smart contract development and testing.

## Objectives

1. Create a ERC20 token contract leveraging OpenZeppelin's basic ERC20 implementation
2. Deploy 5 different ERC20 tokens representing a diversified crypto portfolio
3. Distribute tokens to 2 user addresses to simulate realistic portfolio holdings
4. Send each ERC20 token between both users several times to simulate transactions

## Architecture

### Components

1. **ERC20Token.sol**: An ERC20 token contract extending OpenZeppelin's ERC20 implementation
2. **InitializePortfolio.s.sol**: Foundry script for automated deployment and distribution
3. **ERC20Token.t.sol**: Test suite

### Token Portfolio

The following tokens will be deployed to simulate a realistic crypto portfolio:

| Token | Symbol | Decimals | Total Supply | User 1 Holdings | User 2 Holdings |
|-------|--------|----------|--------------|-----------------|-----------------|
| Wrapped Bitcoin | WBTC | 8 | 21M | 50 | 125 |
| Wrapped Ether | WETH | 18 | 120M | 1,000 | 500 |
| USD Coin | USDC | 6 | 50B | 100,000 | 250,000 |
| Tether USD | USDT | 6 | 50B | 75,000 | 150,000 |
| USDS Stablecoin | USDS | 6 | 10B | 50,000 | 100,000 |

### Token Contract Addresses on Anvil
- **WBTC**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **WETH**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **USDC**: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- **USDT**: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- **USDS**: `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0`

### User Addresses (Anvil Default Accounts)

- **User 1**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Anvil Account #1)
- **User 2**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Anvil Account #2)
- **Deployer**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Anvil Account #0)

## Step-by-Step Instructions

### 1. Create env file

```bash
# Copy example env file to .env
cp .env.example .env

```

### 2. Start Anvil Local Network

```bash
# Start Anvil with default configuration
anvil

```

Anvil will display 10 accounts with their private keys. Note the first three accounts:
- Account #0: Deployer
- Account #1: User 1
- Account #2: User 2

### 3. Compile Smart Contracts

```bash
# Build all contracts
forge build

```

Expected output:
```
[⠢] Compiling...
[⠆] Compiling 3 files with 0.8.30
[⠰] Solc 0.8.30 finished in X.XXs
Compiler run successful
```

### 4. Deploy Token Portfolio

The deployment script requires private keys for three accounts:
- **Deployer** (Anvil Account #0): Deploys tokens and initial distribution
- **User1** (Anvil Account #1): Participates in inter-user transfers
- **User2** (Anvil Account #2): Participates in inter-user transfers

```bash
# Deploy using the script (Anvil must be running)
# Private keys default to Anvil accounts if not provided via environment variables
forge script contracts/script/InitializePortfolio.s.sol --rpc-url http://localhost:8545 --broadcast -vvvv

# Or using environment variables for all private keys
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
USER1_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
USER2_PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a \
forge script script/InitializePortfolio.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 5. Verify Deployment

After deployment, the script will output:

```
========================================
Starting Portfolio Token Deployment
========================================
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
User 1 address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
User 2 address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

Deployed WBTC at address: 0x...
  Total Supply: 21000000 WBTC
  Transferred 50 WBTC to User1
  Transferred 125 WBTC to User2

[Additional token deployments...]

==========================================
Portfolio ERC20 Tokens Deployment Complete
==========================================

Token Addresses:
  WBTC: 0x...
  WETH: 0x...
  USDC: 0x...
  USDT: 0x...
  USDS: 0x...

  User1 Portfolio ( 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 ):
    WBTC: 50
    WETH: 1000
    ...
  
  User2 Portfolio ( 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC ):
    WBTC: 125
    ...
  
  Deployer Remaining Balances ( 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 ):
    WBTC: 20999825
    WETH: 119998500
    USDC: 49999650000
    ...
```

### 6. Running Test Transfers (DoTransfers Script)

After deploying tokens, you can run test transactions between users at any time using the `DoTransfers` script. This script executes predefined transfers between User1 and User2 for all tokens.

**Prerequisites:**
- Anvil must be running
- Tokens must be deployed (run `InitializePortfolio` first)
- Token addresses must be set in `.env` file in the portfolio-dapp root folder

```bash
# Run the DoTransfers script
forge script contracts/script/DoTransfers.s.sol --rpc-url http://localhost:8545 --broadcast -vvvv

# The script will:
# 1. Load token addresses from environment variables
# 2. Display balances before transfers
# 3. Execute transfers between users
# 4. Display balances after transfers
```

**Transfers executed by the script:**

| Token | From → To | Amount |
|-------|-----------|---------|
| WBTC  | User1 → User2 | 10 WBTC |
| WBTC  | User2 → User1 | 5 WBTC |
| WETH  | User2 → User1 | 100 WETH |
| WETH  | User1 → User2 | 200 WETH |
| USDC  | User1 → User2 | 25,000 USDC |
| USDT  | User2 → User1 | 30,000 USDT |
| USDT  | User1 → User2 | 10,000 USDT |
| USDS  | User1 → User2 | 15,000 USDS |
| USDS  | User2 → User1 | 20,000 USDS |

You can run this script multiple times to generate additional test transactions.

### 7. Interact with Deployed Tokens

Use cast commands to interact with the deployed tokens:

```bash
# Check token balance
cast call <TOKEN_ADDRESS> "balanceOf(address)" <USER_ADDRESS> --rpc-url http://localhost:8545

# Transfer tokens (requires private key)
cast send <TOKEN_ADDRESS> "transfer(address,uint256)" <TO_ADDRESS> <AMOUNT> \
  --private-key <PRIVATE_KEY> --rpc-url http://localhost:8545

# Approve spending
cast send <TOKEN_ADDRESS> "approve(address,uint256)" <SPENDER_ADDRESS> <AMOUNT> \
  --private-key <PRIVATE_KEY> --rpc-url http://localhost:8545

# Check allowance
cast call <TOKEN_ADDRESS> "allowance(address,address)" <OWNER> <SPENDER> \
  --rpc-url http://localhost:8545
```

## Testing

### Running Test Suite

```bash
# Run all tests
forge test -vv

```

Expected test results:
- All tests should pass
- Gas usage should be optimized
- Coverage should be near 100%


## Troubleshooting

### Common Issues and Solutions

1. **Anvil Not Running**
   ```
   Error: Failed to connect to RPC
   Solution: Ensure Anvil is running with `anvil`
   ```

2. **Compilation Errors**
   ```
   Error: Source file not found
   Solution: Ensure all imports are correct and run `forge build`
   ```

3. **Insufficient Balance**
   ```
   Error: Insufficient funds for gas
   Solution: Anvil accounts have 10000 ETH by default; check you're using the correct account
   ```

4. **Script Fails**
   ```
   Error: Script failed
   Solution: Add -vvvv flag for detailed output and check gas limits
   ```

5. **Missing Private Keys**
   ```
   Error: Failed to parse private key
   Solution: Ensure DEPLOYER_PRIVATE_KEY, USER1_PRIVATE_KEY, and USER2_PRIVATE_KEY
   are set in your .env file or the script will use default Anvil account keys.
   For Anvil local development, the default keys work out of the box.
   ```

6. **Stale Artifacts Warning**
   ```
   Warning: Detected artifacts built from source files that no longer exist
   Solution: Run `forge clean` to remove stale artifacts
   ```

## References

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [EIP-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
