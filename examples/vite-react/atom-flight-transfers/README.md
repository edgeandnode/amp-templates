# Transfer Events Dashboard

A React application that displays real-time Token transfer event blockchain data from the Amp Gateway through Arrow Flight and Effect Atom

## Overview

This application demonstrates how to:

- Query blockchain data from Amp gateway using Arrow Flight protocol
- Display token transfers in a table with clickable blockchain explorer links
- Use Effect and effect-atom for type-safe state management
- Validate and transform data with Effect Schema
- Use viem for Ethereum address and transaction hash types

## Tech Stack

- **Framework**: React 19 with Vite
- **Data Fetching**: Arrow Flight (@edgeandnode/amp)
- **State Management**: effect-atom (@effect-atom/atom-react)
- **Schema Validation**: Effect Schema
- **Data Format**: Apache Arrow
- **Ethereum Types**: viem
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v22 or higher

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Login to Amp and get gateway access token:

```bash
pnpm amp auth login
pnpm amp auth token "7 days"       # run again to regenerate token when expired
```

Edit `.env` and update the values:

```env
# Amp Gateway Query URL
VITE_AMP_QUERY_URL=https://gateway.amp.staging.thegraph.com/

# Access token for AMP authentication
VITE_AMP_ACCESS_TOKEN={your-amp-gateway-token}

# Optional: Request timeout in milliseconds (default: 30000)
VITE_REQUEST_TIMEOUT=30000

# Optional: Auto-refresh polling interval in milliseconds (default: 10000)
VITE_REFRESH_INTERVAL=10000
```

### 3. Start Development Server

Run the React app:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

```
atom-flight-transfers/
├── src/
│   ├── components/
│   │   └── Table.tsx           # Transfers table component
│   ├── config/
│   │   └── env.ts              # Environment configuration helpers
│   ├── hooks/
│   │   └── useAutoRefresh.ts   # Auto-refresh hook for polling transfers
│   ├── lib/
│   │   ├── query.ts            # Arrow Flight query execution helper
│   │   ├── runtime.ts          # Global Effect runtime with ArrowFlight layer
│   │   ├── schemas.ts          # Effect Schema definitions for Transfer
│   │   ├── transfers.ts        # SQL queries and effect-atom state definitions
│   │   ├── transform.ts        # Transform Transfer schema to UI types
│   │   └── utils.ts            # Utility functions for formatting
│   ├── types/
│   │   ├── transfer.ts         # UI Transfer type definition
│   │   └── index.ts            # Type exports
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── .env.example                # Environment variables template
├── package.json                # Project dependencies
├── vite.config.ts              # Vite configuration
└── tsconfig.json               # TypeScript configuration
```

## How It Works

### Data Flow

1. **Global Runtime**: Creates Effect runtime with ArrowFlight layer and Connect transport
2. **Atom Definition**: Defines transfersAtom that executes Arrow Flight query
3. **Query Execution**: Sends SQL query to Arrow Flight service using non-streaming mode
4. **Arrow Processing**: Receives RecordBatch data in Apache Arrow format
5. **Schema Pipeline**:
   - Encodes Arrow data using generated Arrow schema
   - Decodes to domain Transfer schema with Effect Schema validation
6. **Data Transformation**: Converts snake_case fields to camelCase with viem types
7. **UI Rendering**: React component renders transfers in a table
8. **State Persistence**: effect-atom's keepAlive maintains state across remounts

### Key Features

- **Arrow Flight** for binary data transfer using Apache Arrow format with Connect RPC for type-safe service communication
- **Remote Amp Gateway** integration providing blockchain data from
- **Authentication** via AMP CLI token
- **Effect Schema** for Type-Safe Schema Validation

### SQL Query Language configuration

Visit the Amp playground [https://playground.amp.thegraph.com/](https://playground.amp.thegraph.com/) to explore other available datasets. Modify dataset reference and configuration in the query definition to start using other datasets in this application

Modify the query in `src/lib/transfers.ts`:

```typescript
// Amp SQL Query configuration
const dataset_ref = "edgeandnode/ethereum_mainnet@0.0.1" // Replace with Amp dataset name
const dataset_table = "logs" // Replace with Amp table name
const transfer_event = "Transfer(address indexed from, address indexed to, uint256 value)" // Replace with Event signature
const starting_block = 23837000 // Replace with earliest block_num needed
const limit_number = 50 // Replace with earliest block_num needed
```

## Development

### Code Quality

Before committing changes:

```bash
pnpm check
```

This runs type checking, linting, and formatting checks.

## Troubleshooting

### "Authentication required / Token Expired" error

Check/update `VITE_AMP_ACCESS_TOKEN` in your `.env` file if the AMP server responds with authentication error.

```bash
# Regenerate expired gateway access token
pnpm amp auth token "7 days"
```

### Polling too fast/slow

Adjust `VITE_POLLING_INTERVAL` in `.env`:

```env
# Poll every 5 seconds
VITE_POLLING_INTERVAL=5000
```

### Request timeout

Increase `VITE_REQUEST_TIMEOUT` if queries take longer:

```env
# 60 second timeout
VITE_REQUEST_TIMEOUT=60000

### Schema decode errors

Check console logs for detailed error information about which fields failed validation and their actual types from Arrow.

## Learn More

- [AMP Documentation](https://github.com/edgeandnode/amp)
- [Effect Documentation](https://effect.website)
- [Effect-atom Documentation](https://github.com/tim-smart/effect-atom)
- [Apache Arrow](https://arrow.apache.org/)
- [Vite Documentation](https://vite.dev)
- [Viem Documentation](https://viem.sh)

## License

See the main repository LICENSE file for details.
```
