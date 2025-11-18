# Portfolio DApp

A real-time portfolio tracking application built with Vite, React, Electric SQL, and amp-sync. Track ERC20 token balances and transfer tokens with MetaMask wallet integration.

## Prerequisites

- Node.js v22+
- Docker & Docker Compose (for running services)
- Foundry (for smart contract deployment)
- Just task runner (recommended, `cargo install just`)
- MetaMask or other browser wallet extension

## Getting Started

### 1. Authenticate with GitHub Container Registry

The `amp` and `ampsync` Docker images are hosted in a private GitHub's container registry. In order to access it, you'll have to login to ghcr.io with Docker. Create a new personal access token (classic) with the `read:packages` permission at https://github.com/settings/tokens. Now run the following command and insert the newly generated token as your password when prompted.

```bash
docker login ghcr.io --username <YOUR_GITHUB_USERNAME>
```

Enter your personal access token as the password when prompted.

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
  - Amp server (ports 1602 Arrow Flight API, 1603 JSON Lines API, 1610 Admin)
  - Anvil local blockchain (port 8545)
- Register and deploy `anvil` chain raw dataset with Amp server
- Amp dev server with hot reloading
  - Any saved changes to `amp.config.ts` will be deployed to the local Amp engine automatically 

### 4. Start development server

```bash
just dev
```

This runs in parallel:

- Vite dev server for the React app [http://localhost:5173](http://localhost:5173). See [application notes](#application-notes)
- Electric SQL Shape proxy server [http://localhost:3001](http://localhost:3001)


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
pnpm amp studio --open
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

Cleans docker images

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


## Development Workflow

### Modify the dataset configuration

Edit [amp.config.ts](./amp.config.ts) to change what data is synced. Ampsync will automatically detect changes and reload.

**Note** it is best when you make changes to the `amp.config.ts`, that you bump the version each time. This helps ampsync find the dataset schema and keeps each version <-> schema unique.

### View logs

```bash
# All services
just logs

# Specific service
just logs ampsync
just logs electric
```

### Clean shutdown

```bash
just down
```

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
