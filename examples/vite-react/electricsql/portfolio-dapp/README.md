# Portfolio DApp

A real-time portfolio tracking application built with Vite, React, Electric SQL, and amp-sync. Track ERC20 token balances and transfer tokens with MetaMask wallet integration.

## Prerequisites

- Node.js v22+
- pnpm v10.19.0+
- Docker & Docker Compose
- MetaMask browser extension
- Foundry (for smart contract deployment)
- GitHub token with `read:packages` permission

## Getting Started

### 1. Authenticate with GitHub Container Registry

The `amp` and `ampsync` Docker images are hosted in GitHub's container registry. Create a personal access token (classic) with `read:packages` permission at <https://github.com/settings/tokens>, then login:

```bash
docker login ghcr.io --username <YOUR_GITHUB_USERNAME>
```

Enter your personal access token as the password when prompted.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

Wait for all services to be healthy:

```bash
docker-compose ps
```

### 4. Deploy Smart Contracts

```bash
cd contracts
forge script script/InitializePortfolio.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 5. Run Development Servers

```bash
pnpm dev:all
```

This starts:

- Express proxy server on `http://localhost:3001`
- Vite dev server on `http://localhost:5173`

### 6. Connect MetaMask

Add Anvil network to MetaMask:

- Network Name: `Anvil Local`
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

Import test account:

- Account #1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Account #2: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

Navigate to `http://localhost:5173` and connect your wallet.

## Troubleshooting

**Services not starting:**

```bash
docker-compose logs -f [service-name]
```

**No transfers showing:**

- Verify contracts deployed
- Check ampsync: `docker-compose logs ampsync`
- Test Electric SQL: `curl http://localhost:3000/v1/shape?table=erc20_transfers`

**MetaMask issues:**

- Ensure Chain ID is 31337
- Reset account if needed (Settings → Advanced → Reset Account)
