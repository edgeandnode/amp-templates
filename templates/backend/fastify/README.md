# Simple Fastify Backend with Direct Anvil RPC

A clean, simple backend example built with Fastify that queries Anvil blockchain directly via RPC - no complex dependencies or setup required.

## Features

- **Fastify Backend**: High-performance Node.js web framework
- **Direct RPC Integration**: Queries Anvil blockchain directly
- **Real-time Data**: Live blockchain data from local Anvil testnet
- **REST API**: Clean endpoints for blocks and transfers
- **Simple Setup**: Minimal infrastructure - just Anvil blockchain needed
- **Smart Contracts**: ERC20 token for generating test transfer data
- **Zero Configuration**: Works out of the box with no dataset setup

## Quick Start

```bash
# Clone and navigate to fastify example
cd examples/backend/fastify

# Install dependencies
pnpm install

# One command setup (requires 'just' CLI)
just setup

# Manual setup (alternative)
just start                    # Start Anvil blockchain
just generate-activity        # Deploy contracts & generate blockchain activity
just dev                     # Start Fastify backend locally
just test-api               # Test all endpoints
```

**That's it!** Everything runs with real blockchain data and live API endpoints.

## API Endpoints

| Endpoint         | Method | Description           |
| ---------------- | ------ | --------------------- |
| `/health`        | GET    | Health check          |
| `/`              | GET    | API documentation     |
| `/api/blocks`    | GET    | Get blockchain blocks |
| `/api/transfers` | GET    | Get ERC20 transfers   |
| `/api/rpc/info`  | GET    | Available RPC methods |

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

# RPC information
curl "http://localhost:3001/api/rpc/info"
```

## Architecture

```
Smart Contracts → Anvil → Direct RPC → Backend → REST API
      📝            🐳         📡         🐳        📡
```

Simple architecture:

1. **Anvil**: Local Ethereum testnet with deployed test contracts
2. **Fastify Backend**: REST API server querying Anvil directly via RPC
3. **TestToken Contract**: ERC20 token for generating transfer events

## Development Setup

### Prerequisites

- Docker (for Anvil blockchain)
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
# 1. Start Anvil blockchain
# 2. Deploy ERC20 test contracts
# 3. Generate transfer activity (6 transfers)
# 4. Start backend server
# 5. Test all API endpoints
```

### Manual Setup

```bash
# 1. Start Anvil blockchain
just start                    # Starts docker-compose with Anvil

# 2. Deploy contracts and generate activity
just generate-activity

# 3. Start backend server
just dev

# 4. Test the API
just test-api
```

### Available Tasks

```bash
just --list               # Show all tasks
just start                # Start Anvil blockchain
just stop                 # Stop services
just status               # Check service status
just logs                 # View logs
just generate-activity    # Deploy contracts & generate test transactions
just dev                 # Start backend server
just test-api            # Test all endpoints
just clean               # Clean up everything
```

## Configuration

### Environment Variables

| Variable        | Default               | Description         |
| --------------- | --------------------- | ------------------- |
| `PORT`          | 3001                  | Backend server port |
| `ANVIL_RPC_URL` | http://localhost:8545 | Anvil RPC endpoint  |

### Docker Services

| Service | Port | Description            |
| ------- | ---- | ---------------------- |
| `anvil` | 8545 | Local Ethereum testnet |

_Note: Other services (amp, db, proxy) from docker-compose.yml are optional and not used by the simplified backend._

## Project Structure

```
├── src/
│   └── server.ts           # Main backend server (simplified)
├── contracts/              # Smart contracts
│   ├── src/               # Contract source code
│   └── script/            # Deployment scripts
├── justfile               # Task automation
├── docker-compose.yml     # Anvil blockchain + optional services
├── package.json          # Minimal dependencies
└── README.md            # This file
```

## How It Works

### Smart Contracts

- **TestToken.sol**: Simple ERC20 token for generating transfer events
- **Deploy.s.sol**: Deploys the test token with 1M supply
- **GenerateActivity.s.sol**: Creates 6 transfer transactions for testing

### Direct RPC Integration

1. Smart contracts deployed to Anvil generate Transfer events
2. Backend queries Anvil directly via `eth_getLogs` and `eth_getBlockByNumber`
3. Events are decoded and formatted on-the-fly
4. REST API serves structured JSON responses

No external indexing or data processing services required!

## API Response Format

### Blocks Response

```json
{
  "data": [
    {
      "block_num": 6,
      "timestamp": 1762575974000,
      "hash": "0x...",
      "parent_hash": "0x...",
      "gas_used": 52386,
      "gas_limit": 30000000,
      "transaction_count": 1
    }
  ],
  "row_count": 1,
  "limit": 100,
  "offset": 0,
  "latest_block": 6,
  "note": "Data retrieved directly from Anvil RPC"
}
```

### Transfers Response

```json
{
  "data": [
    {
      "block_hash": "0x...",
      "tx_hash": "0x...",
      "log_index": 0,
      "contract_address": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      "block_num": 1,
      "tx_timestamp": 1762575974000,
      "from_address": "0x0000000000000000000000000000000000000000",
      "to_address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "amount_raw": "1000000000000000000000000",
      "transfer_type": "ERC20 Transfer"
    }
  ],
  "row_count": 1,
  "limit": 100,
  "offset": 0,
  "total_available": 6
}
```

### Error Response

```json
{
  "error": "Failed to fetch blocks",
  "message": "Detailed error description"
}
```

## Troubleshooting

### Check Status

```bash
# View all services
just status

# Check anvil logs
just logs anvil

# Test API
just test-api
```

### Common Issues

**"Connection refused" errors:**

```bash
# Check if Anvil is running
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**No transfer data:**

```bash
# Generate blockchain activity
just generate-activity

# Check if contracts are deployed
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"fromBlock":"0x0","toBlock":"latest","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]}],"id":1}'
```

**Backend server issues:**

```bash
# Check backend logs
just logs

# Restart backend
just dev
```

### Development Tips

- Use `just setup` for complete fresh installation
- Anvil blockchain resets on restart - run `just generate-activity` after restart
- Backend has hot-reload enabled for development
- Use `just test-api` to verify everything is working
- No external dependencies or complex setup required

## Data Examples

After running `just setup`, you'll have:

- **7 blocks** (genesis + 6 transaction blocks)
- **6 ERC20 transfers** (token mint + 5 user transfers)
- **Real transaction data** with proper addresses, amounts, and timestamps

## Production Considerations

For production use:

1. **Security**: Add authentication, rate limiting, input validation
2. **Monitoring**: Add structured logging, metrics, alerts
3. **Blockchain**: Use mainnet/testnet with real RPC providers (Infura, Alchemy)
4. **Scaling**: Load balancers, horizontal scaling, caching
5. **Error Handling**: Robust RPC error handling and retries
6. **Contracts**: Deploy verified contracts with proper access controls

## Examples & Extensions

Build on this example:

- Add more complex contract interactions
- Implement WebSocket subscriptions for real-time updates
- Add caching layer with Redis
- Build React/Next.js frontend
- Add NFT or DeFi contract examples
- Deploy to cloud with Docker

---

## ✅ Current Status

**Everything is working!**

- **Blocks API**: ✅ Returns blocks with real blockchain data
- **Transfers API**: ✅ Returns ERC20 transfers with decoded events
- **Health Check**: ✅ Server responds with healthy status
- **RPC Info**: ✅ Shows available RPC methods
- **Smart Contracts**: ✅ ERC20 token deployed and generating activity
- **Direct RPC**: ✅ Fast, reliable blockchain queries

**Verified Working Commands:**

```bash
curl "http://localhost:3001/health"                    # ✅ Health check
curl "http://localhost:3001/api/blocks?limit=5"        # ✅ Real blocks
curl "http://localhost:3001/api/transfers?limit=5"     # ✅ Real transfers
curl "http://localhost:3001/"                          # ✅ API documentation
```

**Updated**: November 8, 2024 - Simplified architecture, all endpoints verified working
