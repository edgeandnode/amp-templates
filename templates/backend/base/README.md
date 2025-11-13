# {{projectName}}

A backend server that provides real-time data access and API endpoints for Amp-powered applications.

## Features

// [Additions](fastify):features
// [Additions](express):features

- **Arrow Flight**: Real-time data streaming from Amp
- **ElectricSQL Proxy**: Proxies requests to ElectricSQL for real-time sync
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10.19.0+
- Running Amp server (localhost:1602)
- Running ElectricSQL server (localhost:3000)

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

The server will start on http://localhost:3001

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### ElectricSQL Shape Proxy

```
GET /api/shape-proxy
```

Proxies shape requests to ElectricSQL for real-time data synchronization.

### Execute Query

```
POST /api/queries/execute
Content-Type: application/json

{
  "query": "SELECT * FROM dataset_name.table_name LIMIT 10"
}
```

Executes custom SQL queries against Amp via Arrow Flight.

## Configuration

Environment variables:

- `PORT`: Server port (default: 3001)
- `AMP_FLIGHT_URL`: Amp Flight server URL (default: http://localhost:1602)
- `ELECTRIC_URL`: ElectricSQL server URL (default: http://localhost:3000)
- `DATASET_NAME`: Dataset name for queries (default: {{projectName}}\_data)

## Development

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors

## Architecture

The backend serves as a bridge between:

1. **Client Applications**: Provides REST API and real-time data
2. **Amp Server**: Queries processed blockchain data via Arrow Flight
3. **ElectricSQL**: Proxies real-time sync requests

### Data Flow

1. Clients make API requests to backend
2. Backend queries Amp via Arrow Flight for historical data
3. Backend proxies ElectricSQL requests for real-time updates
4. Real-time changes flow through ElectricSQL shape streams

## Deployment

For production deployment:

1. Build the application:

   ```bash
   pnpm build
   ```

2. Start the production server:

   ```bash
   pnpm start
   ```

3. Configure environment variables for production URLs

## Troubleshooting

### Common Issues

1. **Connection errors**: Ensure Amp and ElectricSQL servers are running
2. **CORS issues**: Backend allows all origins in development
3. **Query errors**: Check dataset names and table schemas in Amp

### Logs

// [Additions](fastify):logs
// [Additions](express):logs
