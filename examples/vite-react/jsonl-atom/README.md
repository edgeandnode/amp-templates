# Portfolio Example

A real-time portfolio tracking application built with Vite, React, Effect Atom, and AMP. Track ERC20 token balances and transfer tokens with MetaMask wallet integration, powered by the Amp data platform.

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

**Effect Atom**

- Reactive state management with automatic refresh capabilities
- `Atom.family()` creates separate atom instances for each user address
- Polling mechanism refreshes transfer data every 2 seconds (configurable)
- Manual refresh triggers for immediate UI updates

**JSON Lines API Integration**

- JSON Lines API provides streaming data transfer over HTTP
- SQL queries executed via JSON Lines endpoint against indexed blockchain data
- Newline-delimited JSON (NDJSON) for efficient streaming
- DataFusion SQL engine with support for complex queries
- Schema validation via Effect Schema for type-safe data parsing

**Data Flow**

1. Amp server indexes ERC20 Transfer events from Anvil blockchain
2. Frontend queries transfer data via JSON Lines API using SQL
3. Effect Atom manages reactive state and polling
4. Wagmi multicall fetches token metadata (symbol, decimals, name) and balances

## Prerequisites

- Node.js v22+
- pnpm v10.19.0+
- Docker & Docker Compose
- MetaMask browser extension
- Foundry (for smart contract deployment)
- GitHub token with `read:packages` permission

## Getting Started

### 1. Authenticate with GitHub Container Registry

The `amp` Docker image is hosted in GitHub's container registry. Create a personal access token (classic) with `read:packages` permission at https://github.com/settings/tokens, then login:

```bash
docker login ghcr.io --username <YOUR_GITHUB_USERNAME>
```

Enter your personal access token as the password when prompted.

### 2. Install Dependencies

```bash
just install
```

### 3. Quick Start

#### Start infrastructure services

```bash
just up
```

This will start:

- PostgreSQL (ports 5432, 6434)
- Amp server (ports 1603 JSON Lines API, 1610 Admin)
- Anvil local blockchain (port 8545)

#### Start development servers

```bash
just dev
```

This runs in parallel:

- Amp dev service
- Vite dev server (http://localhost:5173)

#### Deploy smart contracts

```bash
just deploy-contracts
```

This deploys test ERC20 tokens and distributes initial balances.

#### Seed transfer transactions

```bash
just seed-transfers
```

This creates sample transfer transactions for testing.

#### View the app

Open [http://localhost:5173](http://localhost:5173) to see real-time blockchain data.

### View logs

```bash
# All services
just logs

# Specific service
just logs amp
just logs db
```

### Clean shutdown

```bash
just down
```

This stops all services and removes volumes.

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
│   │   ├── useAutoRefresh.ts        # Polling mechanism
│   │   ├── usePortfolioBalances.ts  # Balance calculation
│   │   └── usePortfolioQuery.ts     # Transfer data queries
│   ├── components/
│   │   ├── PortfolioTable.tsx       # Token holdings display
│   │   ├── TransactionHistory.tsx   # Transfer history
│   │   └── TransferModal.tsx        # Token transfer UI
│   └── App.tsx              # Main application
├── contracts/               # Solidity smart contracts
├── amp.config.ts           # Amp dataset configuration
├── docker-compose.yml      # Infrastructure services
└── justfile               # Command runner tasks
```

## Connect MetaMask

Add Anvil network to MetaMask:

- **Network Name:** `Anvil Local`
- **RPC URL:** `http://localhost:8545`
- **Chain ID:** `31337`
- **Currency Symbol:** `ETH`

Import test account (Anvil defaul wallet 1 & 2 private keys):

- **Account #1:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Account #2:** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

Navigate to `http://localhost:5173` and connect your wallet.

## Key Features

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
  curl -X POST http://localhost:1603/query \
    -H "Content-Type: text/plain" \
    -d "SELECT * FROM portfolio_dapp.erc20_transfers LIMIT 1"
  ```
- Run seed script: `just seed-transfers`

**MetaMask issues:**

- Ensure Chain ID is 31337
- Reset account if transactions stuck (Settings → Advanced → Reset Account)
- Clear activity and nonce data if needed

**Effect Atom not refreshing:**

- Check that `useAutoRefresh` receives the correct address
- Verify atom family parameters match between definition and usage
- Ensure `keepAlive` is set to prevent atom disposal

**JSON Lines API errors:**

- Check binary address format: use `decode('hex_string', 'hex')`
- Verify SQL syntax is valid DataFusion SQL
- Ensure newline-delimited JSON responses are parsed correctly
- Check Amp server is running: `just logs amp`

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS 4
- **State Management:** Effect Atom (reactive state with polling)
- **Data Layer:** JSON Lines API, Amp (blockchain indexing), Effect Schema
- **Blockchain:** Foundry (Anvil local testnet), Solidity 0.8.30
- **Wallet Integration:** Wagmi 2, Viem 2
- **UI Components:** Radix UI, TanStack Table / Form
- **DevOps:** Docker Compose, Just (command runner)

## Learn More

- [Effect Atom Documentation](https://github.com/effect-ts/atom)
- [Amp Documentation](https://github.com/edgeandnode/amp)
- [Wagmi Documentation](https://wagmi.sh)
- [Foundry Book](https://book.getfoundry.sh)
