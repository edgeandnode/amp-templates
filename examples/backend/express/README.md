# Express Backend with AMP Arrow Flight

A backend example built with Express that queries blockchain data via AMP's Arrow Flight interface for lightning-fast data access.

## Features

- **Express Backend**: Popular Node.js web framework
- **AMP Integration**: Advanced blockchain data indexing and querying via Arrow Flight
- **Real-time Data**: Live blockchain data from local Anvil testnet
- **REST API**: Clean endpoints for blocks and transfers
- **Smart Contracts**: ERC20 token for generating test transfer data
- **Apache Arrow**: Columnar data format for ultra-fast analytics
- **TypeScript**: Full type safety with Effect-TS for functional programming

## Quick Start

```bash
# Clone and navigate to express example
cd examples/backend/express

# Install dependencies
pnpm install

# One command setup (requires 'just' CLI)
just setup

# Manual setup (alternative)
just start                    # Start all services (Anvil, AMP, DB, Proxy)
just generate-activity        # Deploy contracts & generate blockchain activity
just start-amp-dev            # Register datasets with AMP
just start-backend            # Start Express backend
just test-api                # Test all endpoints
```

**That's it!** Everything runs with real blockchain data and blazing-fast Arrow Flight queries.

## API Endpoints

| Endpoint               | Method | Description                |
| ---------------------- | ------ | -------------------------- |
| `/health`              | GET    | Health check               |
| `/`                    | GET    | API documentation          |
| `/api/blocks`          | GET    | Get blockchain blocks      |
| `/api/transfers`       | GET    | Get ERC20 transfers        |
| `/api/queries/execute` | POST   | Execute custom SQL queries |

### Example Requests

```bash
# Health check
curl "http://localhost:3001/health"

# API documentation
curl "http://localhost:3001/"

# Get recent blocks
curl "http://localhost:3001/api/blocks?limit=5"

# Get ERC20 transfers
curl "http://localhost:3001/api/transfers?limit=10&offset=0"

# Custom SQL query
curl -X POST "http://localhost:3001/api/queries/execute" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT block_num, timestamp FROM anvil.blocks LIMIT 3"}'
```

## Architecture

```
Smart Contracts → Anvil → AMP Indexer → Arrow Flight → Backend → REST API
      📝            🐳        📊           ⚡          🐳        📡
```

Modern data architecture:

1. **Anvil**: Local Ethereum testnet with deployed test contracts
2. **AMP**: Advanced blockchain indexing and data processing
3. **Arrow Flight**: High-performance columnar data transfer protocol
4. **Express Backend**: REST API server with Arrow Flight client
5. **TestToken Contract**: ERC20 token for generating transfer events

## Development Setup

### Prerequisites

- Docker (for Anvil, AMP, and PostgreSQL)
- Node.js 22+ (for backend)
- pnpm 10.19.0+ (for package management)
- Foundry (for contract deployment)
- just (task runner, optional but recommended)

### Complete Setup (Recommended)

```bash
# Install just task runner (if not installed)
# macOS: brew install just
# Linux: https://github.com/casey/just#installation

# One command setup
just setup

# This will:
# 1. Start all Docker services (Anvil, AMP, DB, Proxy)
# 2. Deploy ERC20 test contracts
# 3. Generate transfer activity (6 transfers)
# 4. Register datasets with AMP
# 5. Start backend server with Arrow Flight
# 6. Test all API endpoints
```

### Manual Setup

```bash
# 1. Start all services
just start                    # Starts docker-compose with Anvil, AMP, DB, Proxy

# 2. Deploy contracts and generate activity
just generate-activity

# 3. Register datasets with AMP
just start-amp-dev

# 4. Start backend server
just start-backend

# 5. Test the API
just test-api
```

### Available Tasks

```bash
just --list               # Show all tasks
just start                # Start all Docker services
just stop                 # Stop services
just status               # Check service status
just logs [service]       # View logs
just generate-activity    # Deploy contracts & generate test transactions
just start-amp-dev        # Start AMP dev mode for dataset registration
just start-backend        # Start backend server with Arrow Flight
just dev                  # Start backend in development mode
just test-api            # Test all endpoints
just datasets             # List registered AMP datasets
just clean               # Clean up everything
```

## Configuration

### Environment Variables

| Variable         | Default               | Description                 |
| ---------------- | --------------------- | --------------------------- |
| `PORT`           | 3001                  | Backend server port         |
| `AMP_FLIGHT_URL` | http://localhost:3002 | Arrow Flight proxy endpoint |

### Docker Services

| Service     | Port            | Description                        |
| ----------- | --------------- | ---------------------------------- |
| `anvil`     | 8545            | Local Ethereum testnet             |
| `amp`       | 1602-1603, 1610 | AMP indexer and query engine       |
| `amp-proxy` | 3002            | Arrow Flight proxy for web clients |
| `db`        | 5432            | PostgreSQL database for AMP        |

## Project Structure

```
├── src/
│   └── server.ts           # Main backend server with Arrow Flight
├── contracts/              # Smart contracts
│   ├── src/               # Contract source code
│   └── script/            # Deployment scripts
├── amp.config.ts          # AMP dataset configuration
├── justfile               # Task automation
├── docker-compose.yml     # All services (Anvil, AMP, DB, Proxy)
├── package.json          # Dependencies (AMP, Arrow, Effect-TS)
└── README.md            # This file
```

## How It Works

### AMP Dataset Configuration

```typescript
// amp.config.ts
export default defineDataset(() => ({
  name: "express_backend",
  network: "anvil",
  version: "1.0.0",
  dependencies: {
    anvil: {
      owner: "graphprotocol",
      name: "anvil",
      version: "0.1.0",
    },
  },
  tables: {
    blocks: {
      sql: `SELECT block_num, timestamp, hash FROM anvil.blocks`,
    },
    logs: {
      sql: `SELECT * FROM anvil.logs`,
    },
  },
}))
```

### Arrow Flight Integration

1. Smart contracts deployed to Anvil generate Transfer events
2. AMP indexes blockchain data into columnar format
3. Backend queries via Arrow Flight for ultra-fast analytics
4. Data is streamed as Apache Arrow batches for efficiency
5. REST API serves structured JSON responses

High-performance pipeline optimized for analytical workloads!

## API Response Format

### Blocks Response

```json
{
  "data": [
    {
      "block_num": "6",
      "timestamp": 1762578711000,
      "hash": "0xae18f1744dd9280dcb0dbeec9c122bf830d72464b8ce62e50492c389a8f82d18"
    }
  ],
  "row_count": 1,
  "limit": 3,
  "offset": 0
}
```

### Transfers Response

```json
{
  "data": [
    {
      "block_hash": "0xae18f1744dd9280dcb0dbeec9c122bf830d72464b8ce62e50492c389a8f82d18",
      "tx_hash": "0x39947b9326c5ce33c9146f7566cea768b3ca7af0461a67d192c8fcd1b0963a2b",
      "log_index": 0,
      "contract_address": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      "block_num": "6",
      "tx_timestamp": 1762578711000,
      "decoded_event": {
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
        "value": "8000000000000000000000"
      }
    }
  ],
  "row_count": 1,
  "limit": 3,
  "offset": 0
}
```

## Troubleshooting

### Check Status

```bash
# View all services
just status

# Check specific service logs
just logs amp
just logs anvil
just logs amp-proxy

# Test API
just test-api
```

### Common Issues

**"Failed to get flight info" errors:**

```bash
# Check if AMP services are running
docker-compose ps

# Restart AMP dev mode
just start-amp-dev

# Check dataset registration
just datasets
```

**No transfer data:**

```bash
# Generate blockchain activity
just generate-activity

# Check if datasets are registered
just datasets

# Restart AMP dev mode
just start-amp-dev
```

**Backend server issues:**

```bash
# Check backend logs
just logs express-backend

# Restart backend
just start-backend
```

### Development Tips

- Use `just setup` for complete fresh installation
- AMP datasets need to be registered after contracts are deployed
- Backend has hot-reload enabled for development
- Use `just test-api` to verify everything is working
- Arrow Flight provides sub-second query response times

## Data Examples

After running `just setup`, you'll have:

- **7 blocks** (genesis + 6 transaction blocks) indexed by AMP
- **6 ERC20 transfers** (token mint + 5 user transfers) decoded automatically
- **Ultra-fast queries** via Arrow Flight columnar data format
- **Real transaction data** with proper addresses, amounts, and timestamps

## Production Considerations

For production use:

1. **Security**: Add authentication, rate limiting, input validation
2. **Monitoring**: Add structured logging, metrics, alerts for AMP and backend
3. **Blockchain**: Use mainnet/testnet with AMP's production indexing
4. **Scaling**: Horizontal scaling of Arrow Flight endpoints
5. **Error Handling**: Robust Arrow Flight error handling and retries
6. **Contracts**: Deploy verified contracts with proper access controls
7. **AMP Configuration**: Optimize dataset schemas for your use case

## Performance Benefits

**AMP + Arrow Flight advantages:**

- **Sub-second queries** on large datasets
- **Columnar storage** optimized for analytics
- **Automatic indexing** of blockchain events
- **SQL interface** for complex queries
- **Streaming results** for memory efficiency
- **Type-safe queries** with Effect-TS

## Examples & Extensions

Build on this example:

- Add more complex analytical queries
- Implement WebSocket subscriptions via AMP streams
- Build React/Next.js frontend with Arrow Flight
- Add custom AMP dataset transformations
- Deploy to cloud with Arrow Flight at scale
- Create real-time dashboards

---

## ✅ Requirements for Success

To run this example successfully, you need:

1. **Docker** running (for Anvil, AMP, PostgreSQL, Proxy)
2. **pnpm** installed for package management
3. **Foundry** for smart contract deployment
4. **Just** task runner (recommended) or manual command execution
5. **8GB+ RAM** for AMP and PostgreSQL services

**All endpoints verified working with real blockchain data via AMP Arrow Flight!**

