# Amp Effect Atom Portfolio (JSON Lines API) Example

A real-time portfolio tracking application built with Vite, React, Effect Atom, and Amp. Track ERC20 token balances and transfer tokens with MetaMask wallet integration, powered by the Amp data platform.

## Prerequisites

- Node.js v22+
- Docker & Docker Compose (for running services)
- Foundry (for smart contract deployment)
- Just task runner (recommended, `cargo install just`)
- MetaMask or other browser wallet extension

## Getting Started

### 1. Authenticate with GitHub Container Registry

The `amp` Docker image is hosted in a private GitHub's container registry. In order to access it, you'll have to login to ghcr.io with Docker. Create a new personal access token (classic) with the `read:packages` permission at https://github.com/settings/tokens. Now run the following command and insert the newly generated token as your password when prompted.

```bash
docker login ghcr.io --username <YOUR_GITHUB_USERNAME>
```

### 2. Install Dependencies

```bash
just install
```

This will install:

- `ampd` and `ampctl` required for working with amp core engine
- Npmjs packge dependencies

### 3. Setup and Start Infrastructure Services

```bash
just setup
```

This will start:

- Docker services for
  - PostgreSQL (ports 5432, 6434)
  - Amp server (ports 1603 JSON Lines API, 1610 Admin)
  - Anvil local blockchain (port 8545)
- Register and deploy `anvil` chain raw dataset with Amp server


### 4. Start Amp Dev Server and React App

```bash
just dev
```

This will run:
- Amp dev server with hot reloading
  - Any saved changes to `amp.config.ts` will be deployed to the local Amp engine automatically while indexing on anvil is running
- Vite dev server for the React app [http://localhost:5173](http://localhost:5173). See [application notes](#application-notes)

### 5. Deploy Smart Contracts

```bash
just deploy-contracts
```

This will run:

- Forge smart contract dependencies installation
- Deploying of test ERC20 tokens and distributing initial balances on local anvil chain

### 6. Seed Transfer Transactions

```bash
just seed-transfers
```

- This creates sample transfer transactions of deployed tokens for testing
- Token holdings and transactions will now be visible in the app

### 7. Run Amp Local Dev Studio

```bash
pnpm amp studio
```

- Opens the amp dataset studio visualization tool that can be used to test dataset queries


### 8. View Logs

```bash
# All services
just logs

# Specific service
just logs amp
just logs db
just logs anvil
```

### 9. Stop Infrastructure Services

```bash
just down
```

This stops all running services and remove volumes

### 10. Cleanup Services

```bash
just clean
```

## Application Notes

**Note: Token holdings and transfer history will show when you connect with Wallets shown below so you need to make sure to configure your wallet client to connect to Anvil local chain and import wallet #1 and/or wallet #2 as described**

Step through the features in the application by following the steps below:

#### 1. Add Anvil network to MetaMask (or other browser wallet extensions):

- **Network Name:** `Anvil Local`
- **RPC URL:** `http://localhost:8545`
- **Chain ID:** `31337`
- **Currency Symbol:** `ETH`

#### 2. Import test account (Anvil default wallet #1 & #2 private keys):

- **Wallet #1 address:** `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`
  - **Private key:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Wallet #2 address:** `0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc`
  - **Private key:** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

#### 3. Navigate to `http://localhost:5173` and click `Connect` button to view blockchain data

- Select either wallet and make sure the connected network is `Anvil`
- Page will load with several token holders shown
- Toggle between `Portfolio` and `Transaction History` to view chain data from Amp

#### 4. Make transfers using `Transfer` button on `Portfolio` tab.

- With Wallet #1, select any token and hit `Transfer`, then input Wallet #2's address as recipient and a positive token amount
- Have another browser open with Wallet #2 connected
- Click `Submit` on the Wallet #1 window and see the holdings or transfer history table update, along with toast notification message with received token details

### Features

**Real-time Updates**

- Automatic polling every 2 seconds for new transfers
- Immediate refresh on transfer success
- Toast notifications for incoming transfers
- Instant balance updates

**Balance Calculation**

- Fetched via Wagmi from token contracts for efficiency
- Can also be calculated client-side from efficient aggregation of received/sent transfers

**Token Metadata**

- Fetched via Wagmi multicall for efficiency
- Cached in component state
- Used for proper decimal formatting

## Troubleshooting

**Services not starting:**

```bash
# Check Docker logs
just logs [service-name]

# Verify GitHub Container Registry auth
docker login ghcr.io

# Ensure ports are available
lsof -i :5173,1603,8545
```

**No transfers showing:**

- Verify contracts deployed: `just deploy-contracts`
- Check Amp logs: `just logs amp`
- Test JSON Lines API query:
  ```bash
  curl -X POST http://localhost:1603 \
    -H 'Content-Type: text/plain' \
    -d 'SELECT * FROM "_/portfolio_dapp@dev"."erc20_transfers" LIMIT 5'
  ```
- Run seed script: `just seed-transfers`

**MetaMask issues:**

- Ensure Chain ID is 31337
- Reset account if transactions stuck (Settings → Advanced → Reset Account)
- Clear activity and nonce data if needed

## Project Structure

```
portfolio-dapp/
├── src/
│   ├── lib/
│   │   ├── atoms.ts         # Effect Atom definitions
│   │   ├── query.ts         # JSON Lines query helper
│   │   ├── runtime.ts       # Effect runtime configuration
│   │   └── schemas.ts       # Data schemas
│   ├── hooks/
│   │   ├── useAutoRefresh.ts        # Auto-refresh polling for transfer updates
│   │   ├── useERC20Transfers.ts     # Transfer data hook with Result type
│   │   ├── usePortfolioBalances.ts  # Token balances via Wagmi with metadata
│   │   └── usePortfolioQuery.ts     # User-specific transfer queries
│   ├── components/
│   │   ├── PortfolioSection.tsx     # Portfolio container with loading states
│   │   ├── PortfolioTable.tsx       # Token holdings display
│   │   ├── TransactionHistory.tsx   # Transaction container with loading states
│   │   ├── TransactionTable.tsx     # Sortable transfer history table
│   │   ├── TransferModal.tsx        # Token transfer UI
│   │   └── WalletConnect.tsx        # Wallet connection button
│   ├── config/
│   │   └── wagmi.ts                 # Wagmi configuration
│   ├── types/
│   │   └── portfolio.ts             # TypeScript type definitions
│   ├── App.tsx                      # Main application
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── contracts/                      # Solidity smart contracts
├── amp.config.ts                   # Amp dataset configuration
├── docker-compose.yml              # Infrastructure services
└── justfile                        # Command runner tasks
```

## Architecture

This application demonstrates a React web app built on the Amp blockchain data indexing architecture:

```
Anvil (Local Blockchain)
    |
    v
Amp Server (indexed blockchain data queryable through JSON Lines API)
    |
    v
Effect Atom Runtime (reactive state management)
    |
    v
React App (real-time UI updates)
```

### Key Components

**Data Flow**

1. Amp server indexes ERC20 Transfer events from Anvil blockchain
2. Frontend queries transfer data via JSON Lines API using SQL
3. Effect Atom manages reactive state and polling
4. Wagmi multicall fetches token metadata (symbol, decimals, name) and balances

**Effect Atom**

- Reactive state management with automatic refresh capabilities
- `Atom.family()` creates separate atom instances for each user address
- Polling mechanism refreshes transfer data every 2 seconds (configurable)
- Manual refresh triggers for immediate UI updates

**JSON Lines API Integration**

- SQL queries executed via API endpoint against indexed blockchain data by Amp
- DataFusion SQL engine with support for complex queries
- Schema validation via custom TypeScript validators for type-safe data parsing
- Provides data transfer over HTTP in Newline-delimited JSON (NDJSON) for efficient streaming

## Learn More

- [Amp](https://github.com/edgeandnode/amp)
- [Effect Atom Documentation](https://github.com/effect-ts/atom)
- [Foundry Book](https://book.getfoundry.sh)
- [Just Command Runner](https://just.systems/)
- [Wagmi Documentation](https://wagmi.sh)
