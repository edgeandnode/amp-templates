# Fastify Gateway Backend

A REST API server for querying blockchain data using Fastify and AMP Gateway.

## Overview

This backend provides a REST API that queries remote AMP datasets via the AMP Gateway. No local AMP setup or dataset is required.

## Features

- **Fastify** for high-performance HTTP server
- **Remote AMP Gateway** integration (no local setup needed)
- **Authentication** via AMP CLI token
- **REST API** endpoints for blocks, transactions, and logs
- **TypeScript** with full type safety
- **Query validation** and security measures

## Quick Start

### Prerequisites

- Node.js v22+
- pnpm v10.19.0+
- AMP CLI auth token

### 1. Get AMP Auth Token

First, authenticate with AMP CLI to get your auth token:

```bash
# Install AMP CLI if not already installed
pnpm install -g @edgeandnode/amp

# Login to AMP
amp auth login

# Get your token (copy this value)
amp auth token
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
# Required: AMP Gateway URL
AMP_GATEWAY_URL=https://gateway.amp.staging.edgeandnode.com

# Required: Your AMP authentication token
AMP_AUTH_TOKEN=your_token_here

# Optional: Server configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Optional: Dataset name (default: edgeandnode/arbitrum_one@0.0.1)
DATASET_NAME=edgeandnode/arbitrum_one@0.0.1
```

### 3. Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The server will be available at:
- **REST API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## API Endpoints

### Health Check

```bash
GET /health
```

Returns the health status of the server and AMP Gateway connection.

### Get Blocks

```bash
GET /api/blocks?limit=10&offset=0
```

Query parameters:
- `limit` (optional): Number of blocks to return (default: 10, max: 100)
- `offset` (optional): Number of blocks to skip (default: 0)

### Get Transactions

```bash
GET /api/transactions?limit=10&offset=0
```

Query parameters:
- `limit` (optional): Number of transactions to return (default: 10, max: 100)
- `offset` (optional): Number of transactions to skip (default: 0)

### Get Logs

```bash
GET /api/logs?limit=10&offset=0&contractAddress=0x...&topics=topic0,topic1
```

Query parameters:
- `limit` (optional): Number of logs to return (default: 10, max: 100)
- `offset` (optional): Number of logs to skip (default: 0)
- `contractAddress` (optional): Filter by contract address
- `topics` (optional): Comma-separated list of topic filters

### Execute Custom Query

```bash
POST /api/queries/execute
Content-Type: application/json

{
  "query": "SELECT * FROM \"edgeandnode/arbitrum_one@0.0.1\".blocks LIMIT 5"
}
```

**Note**: Only SELECT statements are allowed. Dangerous keywords (DROP, DELETE, INSERT, UPDATE, ALTER, CREATE, TRUNCATE) are blocked.

## Example Requests

```bash
# Health check
curl http://localhost:3001/health

# Get recent blocks
curl "http://localhost:3001/api/blocks?limit=5"

# Get recent transactions
curl "http://localhost:3001/api/transactions?limit=5"

# Get logs for a specific contract
curl "http://localhost:3001/api/logs?limit=10&contractAddress=0x..."

# Execute custom query
curl -X POST http://localhost:3001/api/queries/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT block_num, timestamp, hash FROM \"edgeandnode/arbitrum_one@0.0.1\".blocks LIMIT 3"}'
```

## Development

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `AMP_GATEWAY_URL` | https://gateway.amp.staging.edgeandnode.com | AMP Gateway URL |
| `AMP_AUTH_TOKEN` | - | AMP authentication token (required) |
| `DATASET_NAME` | edgeandnode/arbitrum_one@0.0.1 | Dataset name to query |
| `NODE_ENV` | development | Node environment |

## Project Structure

```
├── src/
│   ├── server.ts          # Main server file
│   ├── amp-client.ts      # AMP Gateway client
│   └── types/
│       └── amp-data.ts    # TypeScript interfaces
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "AMP Gateway error: 401 Unauthorized"

Make sure you have set the `AMP_AUTH_TOKEN` environment variable with a valid token from `amp auth token`.

### "AMP Gateway error: 404 Not Found"

Check that the `DATASET_NAME` environment variable matches an available dataset on the AMP Gateway.

### Connection errors

Verify that `AMP_GATEWAY_URL` is correct and accessible from your network.

## Learn More

- [AMP Documentation](https://github.com/edgeandnode/amp)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [AMP Gateway](https://gateway.amp.staging.edgeandnode.com)

