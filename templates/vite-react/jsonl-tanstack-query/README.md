# {{projectName}}

A real-time portfolio tracking application built with Vite, React, TanStack Query, and AMP. Track ERC20 token balances and transfer tokens with MetaMask wallet integration, powered by the Amp data platform.

## Architecture

This application demonstrates a React web app built on the Amp blockchain data indexing architecture:

```
Anvil (Local Blockchain)
    |
    v
Amp Server (indexed blockchain data queryable through JSON Lines API)
    |
    v
TanStack Query (data fetching and caching)
    |
    v
React App (real-time UI updates)
```

### Key Components

**TanStack Query**

- Declarative data fetching with automatic caching and background refetching
- `useQuery` hook for fetching and caching transfer data
- Automatic polling with `refetchInterval` for real-time updates (every 2 seconds)
- `placeholderData` keeps previous data visible during background refetches
- Optimistic updates and cache invalidation on transfer success
- Built-in loading and error states for better UX

**JSON Lines API Integration**

- JSON Lines API provides streaming data transfer over HTTP
- SQL queries executed via JSON Lines endpoint against indexed blockchain data
- Newline-delimited JSON (NDJSON) for efficient streaming
- DataFusion SQL engine with support for complex queries
- Schema validation via custom TypeScript validators for type-safe data parsing

**Data Flow**

1. Amp server indexes ERC20 Transfer events from Anvil blockchain
2. Frontend queries transfer data via JSON Lines API using SQL
3. TanStack Query manages data fetching, caching, and polling
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
│   │   ├── api.ts           # JSON Lines API client
│   │   ├── schemas.ts       # Data schemas and validation
│   │   └── validation.ts    # Schema validation utilities
│   ├── hooks/
│   │   ├── useERC20Transfers.ts     # TanStack Query hook for transfers
│   │   └── usePortfolioBalances.ts  # Balance calculation with Wagmi
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

- Automatic polling every 2 seconds via TanStack Query `refetchInterval`
- Background refetching with `placeholderData` to prevent UI flicker
- Manual refetch on transfer success via `refetch()`
- Toast notifications for incoming transfers
- Instant balance updates through query cache invalidation

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
    -H "Content-Type: text/plain" \
    -d "SELECT * FROM portfolio_dapp.erc20_transfers LIMIT 1"
  ```
- Run seed script: `just seed-transfers`

**MetaMask issues:**

- Ensure Chain ID is 31337
- Reset account if transactions stuck (Settings → Advanced → Reset Account)
- Clear activity and nonce data if needed

**TanStack Query not refreshing:**

- Verify `queryKey` includes all dependencies (e.g., address)
- Check `refetchInterval` is set correctly (default: 2000ms)
- Ensure `enabled` option is true when data should be fetched
- Use React DevTools TanStack Query panel to inspect query state
- Check for `placeholderData` if UI is flickering during refetch

**JSON Lines API errors:**

- Check binary address format: use `decode('hex_string', 'hex')`
- Verify SQL syntax is valid DataFusion SQL
- Ensure newline-delimited JSON responses are parsed correctly
- Check Amp server is running: `just logs amp`

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS 4
- **Data Fetching:** TanStack Query 5 (server state management)
- **Data Layer:** JSON Lines API, Amp (blockchain indexing)
- **Validation:** Custom schema validation with TypeScript
- **Blockchain:** Foundry (Anvil local testnet), Solidity 0.8.30
- **Wallet Integration:** Wagmi 2, Viem 2
- **UI Components:** Radix UI, TanStack Table / Form
- **DevOps:** Docker Compose, Just (command runner)

## Learn More

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Amp Documentation](https://github.com/edgeandnode/amp)
- [Wagmi Documentation](https://wagmi.sh)
- [Foundry Book](https://book.getfoundry.sh)
