# Amp Apollo GraphQL Server

A GraphQL API server for querying Arbitrum One blockchain data using Apollo Server and Amp Gateway.

## Overview

This backend provides a GraphQL API that queries live blockchain dataset via the remote AMP Gateway. No local AMP setup or dataset is required.

## Features

- **Apollo Server 4** with latest GraphQL features
- **Remote AMP Gateway** integration (no local setup needed)
- **Authentication** via AMP CLI auth token header
- **GraphQL Playground** for development

## Quick Start

### Prerequisites

- Node.js v22+


### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Login to Amp and get Amp gateway access token:

```bash
pnpm amp auth login
pnpm amp auth token
```

Edit `.env` and update the values:

```env
# Required: AMP Gateway URL
AMP_GATEWAY_URL=https://gateway.amp.staging.thegraph.com/

# Required: Your AMP authentication token
AMP_AUTH_TOKEN=your_token_here

# Optional: Server configuration
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
```

### 3. Start/Run Server

```bash
# Start development server
pnpm dev
```

The server will be available at:
- **GraphQL API**: http://localhost:4000/graphql
- **GraphQL Playground**: http://localhost:4000/graphql (development only)
- **Health Check**: http://localhost:4000/health

## API Documentation

### Available Queries

#### Health Status
```graphql
query {
  health {
    status
    service
    timestamp
    gateway
  }
}
```

#### Latest Blocks
```graphql
query {
  blocks(limit: 10) {
    data {
      number
      hash
      timestamp
      miner
      gasUsed
      transactionCount
    }
    totalCount
    hasNextPage
  }
}
```

#### Latest Transactions
```graphql
query {
  transactions(limit: 5) {
    data {
      hash
      from
      to
      value
      gasPrice
      blockNumber
    }
    totalCount
    hasNextPage
  }
}
```

#### Transaction Receipts
```graphql
query {
  transactionReceipts(limit: 5) {
    data {
      transactionHash
      status
      gasUsed
      effectiveGasPrice
      contractAddress
    }
  }
}
```

#### Event Logs
```graphql
query {
  logs(limit: 10, contractAddress: "0x...") {
    data {
      address
      topics
      data
      blockNumber
      transactionHash
      logIndex
    }
  }
}
```

#### Custom SQL Query
```graphql
query {
  executeQuery(query: "SELECT block_num, hash, miner FROM \"edgeandnode/arbitrum_one@0.0.1\".blocks ORDER BY block_num DESC LIMIT 5") {
    data
    rowCount
    executionTime
  }
}
```

### Query Parameters

- `limit` (Int): Number of results to return (max 100, default 10)
- `offset` (Int): Number of results to skip (default 0)
- `contractAddress` (String): Filter logs by contract address
- `topics` ([String]): Filter logs by topics

## Dataset Information

This server queries the `**edgeandnode/arbitrum_one@0.0.1**` dataset, which includes:

- **Blocks**: Arbitrum One block data
- **Transactions**: Transaction details and metadata
- **Transaction Receipts**: Execution results and gas usage
- **Logs**: Event logs and contract interactions

Visit the Amp playground [https://playground.amp.thegraph.com/](https://playground.amp.edgeandnode.com/) to explore other available datasets and replace the dataset reference in the application to start using it

### Available Tables

- `"edgeandnode/arbitrum_one@0.0.1".blocks`
- `"edgeandnode/arbitrum_one@0.0.1".transactions`
- `"edgeandnode/arbitrum_one@0.0.1".logs`

## Development

### Scripts

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Generate GraphQL types (if configured)
pnpm codegen
```

### GraphQL Playground

In development mode, visit http://localhost:4000/graphql to access the GraphQL Playground where you can:

- Explore the schema documentation
- Write and test queries
- View query results in real-time
- Access auto-completion and validation

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
AMP_GATEWAY_URL=https://gateway.amp.staging.thegraph.com/
AMP_AUTH_TOKEN=your_production_token
PORT=4000
NODE_ENV=production
```

### Build & Deploy

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Security

- Only `SELECT` statements are allowed in custom queries
- Dangerous SQL keywords are blocked
- Query result limits are enforced (max 100 rows)
- Authentication required via AMP token
- Input validation on all parameters

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. Verify your AMP token: `amp auth token`
2. Check token in environment: `echo $AMP_AUTH_TOKEN`
3. Re-authenticate: `amp auth login`

### Connection Issues

If you can't connect to the AMP Gateway:

1. Check the gateway URL is correct
2. Verify network connectivity
3. Check the health endpoint: `GET /health`

### Query Issues

If queries fail:

1. Test with simple queries first
2. Check the GraphQL Playground for errors
3. Verify the dataset name and table names
4. Review query syntax and SQL validity

## API Examples

### cURL Examples

```bash
# Health check
curl http://localhost:4000/health

# GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status service } }"}'

# Get latest blocks
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ blocks(limit: 5) { data { number hash timestamp } } }"}'
```

## License

MIT