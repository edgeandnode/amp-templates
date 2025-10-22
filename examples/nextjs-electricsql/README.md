# Nextjs with ElectricSQL | Ampsync Example

This example demonstrates using `ampsync` to sync Amp datasets to PostgreSQL, with ElectricSQL providing real-time sync to a Next.js frontend.

## Architecture

```
Anvil (Local Blockchain)
    ↓
Amp Server - indexes blockchain data
    ↓
Ampsync - syncs to PostgreSQL
    ↓
ElectricSQL - syncs to frontend
    ↓
Next.js App - displays real-time data
```

## Quick Start

### 1. Start infrastructure services

```bash
just up
```

This will:

- Start all services:
  - PostgreSQL (ports 5432, 6434)
  - Amp server (ports 1602, 1603, 1610)
  - Anvil local blockchain (port 8545)
  - Ampsync sync service
  - ElectricSQL sync engine (port 3000)

### 2. Start development server

```bash
just dev
```

This runs in parallel:

- Next.js app (http://localhost:3001)
- Amp dev watcher

### 3. View the app

Open [http://localhost:3001](http://localhost:3001) to see real-time blockchain data.

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

This removes all containers and volumes.

## ElectricSQL integration

There is a hook: [useAnvilBlockStream](./hooks/useAnvilBlocksStream.tsx) which uses the electric-sql `useShape` hook. The url specified connects to an internal nextjs api proxy endpoint which then forwards the request to the electric-sql endpoint (:3000, defined in the [docker-compose](./docker-compose.yml)). The proxy is defined in [this route](./app/api/shape-proxy/route.ts).
**Note** it hard-codes the `blocks` table when making the request to the electric-sql endpoint. This can be updated to dynamically pass in the table via a dynamic route param, or individual routes can be created for the tables defined in your [amp config](./amp.config.ts).
When a message is received, we transform/parse it into a `AnvilBlock` instance.

## Dataset Configuration

The example syncs Anvil blockchain data:

- `anvil_blocks` - Block headers
- `anvil_transactions` - Transaction data
- `anvil_logs` - Event logs

See `amp.config.ts` for the full configuration.

## Troubleshooting

### "Dataset not found in admin-api"

This is normal on first start. Wait for Amp to index some blocks from Anvil.

### Database connection errors

Ensure PostgreSQL is healthy:

```bash
docker compose ps db
```

## Tech Stack

- **Blockchain**: [Foundry Anvil](https://book.getfoundry.sh/anvil/)
- **Indexing**: [Amp](https://github.com/edgeandnode/amp)
- **Sync**: [Ampsync](../../)
- **Real-time Sync**: [ElectricSQL](https://electric-sql.com/)
- **Frontend**: [Next.js](https://nextjs.org/)

## Learn More

- [ElectricSQL Documentation](https://electric-sql.com/docs)
