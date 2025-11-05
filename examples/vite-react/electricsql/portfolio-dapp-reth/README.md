# Portfolio DApp (Reth + Porto Wallet Edition)

A real-time portfolio tracking application built with Vite, React, Electric SQL, and amp-sync. Track ERC20 token balances and transfer tokens with Porto wallet integration, powered by Reth local development node.

## Prerequisites

- Node.js v22+ and pnpm v10.19.0+
- Docker & Docker Compose
- Porto wallet (via EIP-6963 browser injection)
- Foundry (for smart contract deployment)
- GitHub token with `read:packages` permission

## What's Different in This Version

This example uses:
- **Reth** instead of Anvil as the local Ethereum node
- **Porto wallet** support via wagmi connectors
- **Electric SQL** for real-time data synchronization
- **amp-sync** for blockchain data indexing

### Why Reth?

Reth is a high-performance Ethereum execution client written in Rust. This example demonstrates:
- Running Reth in dev mode for local development
- Configuring Amp to index data from a Reth node
- Creating custom base datasets for Reth networks

### Why Porto Wallet?

Porto is a next-generation self-custody wallet that:
- Uses WebAuthn and Passkeys (no seed phrases)
- Works seamlessly with wagmi and viem
- Provides EIP-1193 compatibility
- Supports EIP-6963 injection for broad compatibility

For more information, see the [Porto SDK documentation](https://porto.sh/sdk) and [Porto Relay documentation](https://porto.sh/relay).

## Getting Started

### Quick Overview

For a quick start, follow these steps:

1. Authenticate with GitHub Container Registry: `docker login ghcr.io --username <YOUR_GITHUB_USERNAME>`
2. Install dependencies: `pnpm install`
3. Start infrastructure (without ElectricSQL): `just up`
4. Compile datasets: `pnpm amp dev --admin-url http://localhost:1610 --rpc-url http://localhost:8545`
5. Trigger base dataset sync: `pnpm amp dump reth`
6. Deploy contracts: `just deploy-contracts`
7. Seed transfers: `just seed-transfers`
8. Verify data synced: `docker compose exec db psql -U postgres -d portfolio_dapp -c "SELECT COUNT(*) FROM erc20_transfers;"`
9. Start ElectricSQL (after data exists): `docker compose --profile electric up -d electric`
10. Start dev server: `just dev`

### Step-by-Step Guide

#### Step 1: Authenticate with GitHub Container Registry

The `amp` and `ampsync` Docker images are hosted in GitHub's container registry. Create a personal access token (classic) with `read:packages` permission at <https://github.com/settings/tokens>, then login:

```bash
docker login ghcr.io --username <YOUR_GITHUB_USERNAME>
```

Enter your personal access token as the password when prompted.

#### Step 2: Install Dependencies

```bash
pnpm install
```

#### Step 3: Start Infrastructure Services (Without ElectricSQL)

Start Docker services (PostgreSQL, Amp, Reth, Ampsync). ElectricSQL will be started later after data is synced:

```bash
just up
```

This will start:
- **PostgreSQL** (ports 5432, 6434) - Database for amp-sync and ElectricSQL
- **Amp server** (ports 1602, 1603, 1610) - Data indexing and querying
- **Reth** (port 8545) - Local Ethereum node in dev mode with 1s block time
- **Ampsync** - Syncs blockchain data from Amp to PostgreSQL

**Note:** ElectricSQL is not started automatically. It will be started in Step 11 after data is synced to ensure it creates shapes with existing data.

Wait for all services to be healthy. You can check status with:

```bash
docker compose ps
```

#### Step 4: Compile Datasets

The datasets need to be compiled from TypeScript to JSON manifests. The reth base dataset manifest is already included, but you'll need to compile the main portfolio_dapp dataset:

**Important:** Wait for Reth to be fully ready before running this command. Check that Reth is responding:

```bash
# Verify Reth is ready (should return a block number)
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Then compile the datasets:

```bash
pnpm amp dev --admin-url http://localhost:1610 --rpc-url http://localhost:8545
```

This will:
- Connect to the Amp server running in Docker (port 1610)
- Connect to the Reth RPC endpoint (port 8545) for blockchain data
- Watch `amp.config.ts` for changes
- Compile TypeScript datasets to JSON manifests
- Register datasets with the Amp server

**Note:** 
- Both the Amp server (via `just up`) and Reth must be running before running this command
- The first time you run this, it will compile the `portfolio_dapp` dataset which depends on the `reth` base dataset
- The `reth` base dataset manifest (`infra/amp/datasets/reth__0_1_0.json`) is already included in the repository
- **You may see "Failed to connect to chain" warnings initially** - these are normal during connection validation and the compilation will succeed despite them

Leave this running in a terminal, or run it in the background. The dataset will be automatically reloaded when you make changes.

#### Step 5: Verify Dataset Registration

Check that both datasets are registered:

```bash
curl http://localhost:1610/datasets
```

You should see both `reth` (version 0.1.0) and `portfolio_dapp` (version 0.1.0-*) listed.

#### Step 6: Trigger Base Dataset Sync (Required)

**Important**: Before ampsync can sync `portfolio_dapp`, Amp needs to index the base `reth` dataset tables. Run:

```bash
# Trigger sync for base dataset (queries RPC and creates parquet files)
pnpm amp dump reth
```

This will:
1. Query the Reth RPC provider for blocks, transactions, and logs
2. Create physical parquet files for `reth.blocks`, `reth.logs`, `reth.transactions`
3. Register them in Amp's metadata database
4. Allow `portfolio_dapp` to query `reth.*` tables

Wait for the dump to complete (may take a minute). You'll see "Dump scheduled for dataset reth" and then it will process blocks.

#### Step 7: Verify Ampsync is Syncing

Check that ampsync has successfully created the database tables:

```bash
docker compose exec db psql -U postgres -d portfolio_dapp -c "\dt"
```

You should see tables:
- `blocks`
- `erc20_transfers`
- `_ampsync_checkpoints` (internal)

**Note:** If the tables don't appear immediately, wait a few moments for ampsync to initialize. You can check ampsync logs:

```bash
docker compose logs ampsync --tail 20
```

Ampsync will start syncing automatically once the base dataset is dumped (Step 6).

#### Step 8: Deploy Smart Contracts

Deploy the ERC20 tokens and initialize the portfolio:

```bash
just deploy-contracts
```

This will:
- Install Foundry dependencies if needed
- Deploy ERC20 tokens (USDC, DAI, WETH)
- Distribute tokens to test accounts

**Note:** The script uses Reth's default dev accounts. Make sure Reth is running and accessible on port 8545.

#### Step 9: Seed Transfer Transactions (Optional)

To generate some initial transfer history, run:

```bash
just seed-transfers
```

This will create several ERC20 transfer transactions between Wallet #1 and Wallet #2.

#### Step 10: Verify Data in Database

Check that transfers are being synced:

```bash
# Check transfer count
docker compose exec db psql -U postgres -d portfolio_dapp -c "SELECT COUNT(*) FROM erc20_transfers;"

# Check a few transfers
docker compose exec db psql -U postgres -d portfolio_dapp -c "SELECT tx_hash, contract_address, from_address, to_address, amount_raw FROM erc20_transfers LIMIT 5;"

# Check blocks synced
docker compose exec db psql -U postgres -d portfolio_dapp -c "SELECT COUNT(*) FROM blocks;"
```

**Expected results:**
- Transfer count should be > 0 (includes contract deployments and seeded transfers)
- Blocks count should be > 0 (synced from Reth)

**Note:** If you see 0 transfers/blocks immediately after deployment, wait 10-30 seconds for ampsync to sync the data. Ampsync continuously syncs new blocks and transactions from Amp to PostgreSQL. You can check ampsync progress:

```bash
docker compose logs ampsync --tail 20
```

#### Step 11: Start ElectricSQL

**Important:** ElectricSQL uses PostgreSQL logical replication with snapshots. To ensure ElectricSQL creates shapes with existing data, start it only after ampsync has synced data:

```bash
# Verify data is synced (should show > 0 transfers)
docker compose exec db psql -U postgres -d portfolio_dapp -c "SELECT COUNT(*) FROM erc20_transfers;"

# Start ElectricSQL now that data exists
docker compose --profile electric up -d electric

# Wait for ElectricSQL to start and create shapes
sleep 5
```

ElectricSQL will now create shapes with the existing data, so the frontend can query it immediately.

#### Step 12: Start Development Servers

Start both the frontend and Amp dev server:

```bash
just dev
```

This runs in parallel:
- **Vite dev server** - Frontend app on `http://localhost:5173`
- **Amp dev watcher** - Compiles and watches dataset changes

Alternatively, you can run them separately:

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Amp dev server (compiles datasets)
pnpm amp dev --admin-url http://localhost:1610 --rpc-url http://localhost:8545

# Terminal 3: ElectricSQL shape proxy (if not using the one in docker-compose)
tsx server.ts
```

#### Step 12: Connect Your Wallet

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Connect Porto Wallet:**

Porto wallet will be available automatically when you visit the app thanks to wagmi's porto connector and EIP-6963 support. Simply:

1. Click "Connect Porto Wallet"
2. Follow the WebAuthn/Passkey prompts to create your wallet

Porto wallets are self-custodial and use your device's secure enclave (no seed phrases needed). The Reth chain (chain ID 1337) will be automatically configured.

## Development Workflow

### Modify the Dataset Configuration

Edit [amp.config.ts](./amp.config.ts) to change what data is synced. The Amp dev server will automatically detect changes and recompile.

**Important:** When you make changes to `amp.config.ts`, bump the version each time. This helps ampsync find the dataset schema and keeps each version ↔ schema unique.

Example:
```typescript
export default defineDataset(() => ({
  name: "portfolio_dapp",
  version: "0.1.1", // Increment version
  // ...
}))
```

**Connect MetaMask**

Add Reth network to MetaMask:

- Network Name: `Reth Local`
- RPC URL: `http://localhost:8545`
- Chain ID: `1337`
- Currency Symbol: `ETH`

Import test account:

- Account #1 Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Account #2 Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

Navigate to `http://localhost:5173` and connect your wallet.

### View Logs

```bash
# All services
just logs

# Specific service
just logs ampsync
just logs electric
just logs amp
just logs reth
```

### Clean Shutdown

Stop all services and remove volumes:

```bash
just down
```

This will:
- Stop all Docker containers
- Remove Docker volumes
- Clean up local data directories

## Dataset Structure

This project uses a two-tier dataset structure:

1. **Reth Base Dataset** (`infra/amp/datasets/reth/amp.config.ts`)
   - Provides raw blockchain data (blocks, transactions, logs)
   - Queries directly from the Reth RPC provider
   - Manifest: `infra/amp/datasets/reth__0_1_0.json`

2. **Portfolio DApp Dataset** (`amp.config.ts`)
   - Depends on the reth base dataset
   - Decodes ERC20 Transfer events
   - Provides `erc20_transfers` and `blocks` tables

## Troubleshooting

Common issues:
- Services not starting
- Dataset not found
- Ampsync not syncing
- No transfers showing
- Wallet connection issues
- Dataset compilation errors

## Project Structure

```
.
├── amp.config.ts                    # Main portfolio_dapp dataset
├── infra/
│   ├── amp/
│   │   ├── config.toml              # Amp server configuration
│   │   ├── datasets/
│   │   │   ├── reth/
│   │   │   │   └── amp.config.ts    # Reth base dataset
│   │   │   └── reth__0_1_0.json     # Compiled reth manifest
│   │   └── providers/
│   │       └── reth.toml            # Reth RPC provider config
│   └── postgres/
│       ├── init.sh                  # Database initialization
│       └── postgres.conf             # PostgreSQL config
├── contracts/                       # Foundry smart contracts
├── src/                             # Frontend React app
├── docker-compose.yml               # Docker services
├── justfile                         # Task runner commands
└── README.md                        # This file
```

## License

MIT
