# Transfer Events Dashboard

A React application that displays real-time Token transfer events from blockchain data using the AMP Gateway

## Overview

This application demonstrates how to:

- Query blockchain data using AMP Gateway
- Display token transfers in a live-updating table with clickable blockchain explorer links
- Use TanStack Query for efficient data fetching with automatic polling
- Validate API responses with Zod schemas
- Work with Ethereum addresses and transaction hashes using viem

## Tech Stack

- **Framework**: React 19 with Vite
- **Data Fetching**: TanStack Query v5
- **Schema Validation**: Zod
- **Ethereum Types**: viem
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v22 or higher
- pnpm v10.19.0 or higher

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
pnpm amp auth token --duration=1d       # run again to regenerate token when expired
```

Edit `.env` and update the values:

```env
# AMP Query Gateway URL
VITE_AMP_JSONL_URL=https://gateway.amp.staging.thegraph.com/

VITE_AMP_ACCESS_TOKEN={Amp-gateway-token}

# Optional: Polling interval in milliseconds (default: 2000)
VITE_POLLING_INTERVAL=2000

# Optional: Request timeout in milliseconds (default: 30000)
VITE_REQUEST_TIMEOUT=30000
```

### 3. Start Development Servers

Run React app:

```bash
just dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

```
jsonl-transfers/
├── src/
│   ├── components/
│   │   └── Table.tsx           # ERC20 transfers table component
│   ├── hooks/
│   │   └── useERC20Transfers.ts # TanStack Query hook for fetching transfers
│   ├── lib/
│   │   ├── api.ts              # API client with JSONL parsing
│   │   ├── schemas.ts          # Zod schemas for data validation
│   │   └── utils.ts            # Utility functions for formatting
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── .env.example                # Environment variables template
├── package.json                # Project dependencies
├── vite.config.ts              # Vite configuration
└── tsconfig.json               # TypeScript configuration
```

## How It Works

### Data Flow

1. **Query Execution**: The app sends a SQL query to the AMP JSONLines API
2. **Response Parsing**: Each line of the JSONL response is parsed and validated
3. **Schema Validation**: Zod schemas ensure data integrity and type safety
4. **Data Transformation**: Snake_case API fields are transformed to camelCase
5. **UI Rendering**: React components display the data in a table
6. **Auto-refresh**: TanStack Query polls for new data every 2 seconds

### Key Features

#### Real-time Updates

The application automatically refreshes data every 2 seconds (configurable via `VITE_POLLING_INTERVAL`).

#### Type-safe API Client

The `src/lib/api.ts` file provides a robust API client with:

- Request timeout handling
- Abort signal support for cancellation
- Custom error types (ApiError, ValidationError, TimeoutError)
- Authentication token management

#### Schema Validation

All API responses are validated using Zod schemas defined in `src/lib/schemas.ts`:

- **Address validation**: Ensures valid Ethereum addresses with checksum
- **Timestamp parsing**: Converts ISO timestamps to Unix timestamps
- **BigInt support**: Handles large token amounts correctly
- **Field transformation**: Converts snake_case to camelCase

## Customizing the Query

Visit the Amp playground [https://playground.amp.thegraph.com/](https://playground.amp.edgeandnode.com/) to explore other available datasets and replace reference below to start using other datasets

To modify what data is fetched, edit the query in `src/lib/api.ts`:

```typescript
// Example: Increase result limit
const result_limit = 20

// Example: Filter by block range
const starting_block = 100

// Example: Retrieve events from Ethereum mainnet logs dataset
const dataset_ref = "edgeandnode/ethereum_mainnet@0.0.1"
const dataset_table = "logs"
```

## Error Handling

The application handles several error scenarios:

- **Network errors**: Displays error message in the UI
- **Authentication failures**: Logs missing token warnings
- **Validation errors**: Shows which data failed validation
- **Timeouts**: Configurable request timeout (default 30 seconds)

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
pnpm amp auth token --duration=1d
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
```

## Learn More

- [AMP Documentation](https://docs.edgeandnode.com/amp)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vite Documentation](https://vite.dev)
- [Zod Documentation](https://zod.dev)
- [viem Documentation](https://viem.sh)

## License

See the main repository LICENSE file for details.
