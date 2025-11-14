# create-amp

Scaffold Amp-enabled applications with pre-configured templates for querying blockchain data.

## What is Amp?

Amp is the first blockchain-native database built by Edge & Node. It enables developers to query blockchain data with the performance and developer experience of a traditional database, without running your own node or complex indexing infrastructure.

## Quick Start

```bash
pnpm create amp@latest
# or
npm create amp@latest
# or
npx create-amp@latest
```

Follow the interactive prompts to:
1. Name your application
2. Choose between building your own dataset or using an existing one
3. Select a template (backend or frontend)
4. Pick your package manager

## Usage

### Interactive Mode (Recommended)

```bash
pnpm create amp@latest
```

### With Options

```bash
pnpm create amp@latest my-app --template backend-express --package-manager pnpm
```

### Available Options

- `--template <name>` - Template to scaffold (see templates below)
- `--package-manager <pm>` - Package manager to use (`pnpm`, `npm`, `yarn`, `bun`)
- `--skip-install-deps` - Skip installing dependencies
- `--skip-initialize-git` - Skip git initialization

## Available Templates

### Build Dataset Templates
For creating custom datasets from your own smart contracts (includes Docker Compose with Anvil + Ampd):

**Backend:**
- `backend-express` - Express REST API with Arrow Flight
- `backend-fastify` - Fastify REST API with Arrow Flight
- `backend-apollo-graphql` - Apollo GraphQL API with Arrow Flight

**Frontend:**
- `nextjs` - Next.js fullstack application
- `react-arrowflight-effect-atom` - React + Vite with Arrow Flight streaming
- `react-jsonlines-effect-atom` - React + Vite with JSON Lines queries
- `react-jsonlines-react-query` - React + Vite with TanStack Query
- `react-ampsync-electricsql` - React + Vite with PostgreSQL sync and real-time updates

### Existing Dataset Templates
For querying existing datasets via Amp Gateway (no local infrastructure):

**Backend:**
- `backend-express-gateway` - Express REST API with Amp Gateway
- `backend-fastify-gateway` - Fastify REST API with Amp Gateway
- `backend-apollo-graphql-gateway` - Apollo GraphQL API with Amp Gateway

**Frontend:**
- `react-jsonlines-transfers` - React + Vite querying Arbitrum One transfers dataset

## After Scaffolding

### For Existing Dataset Templates

```bash
cd my-app
pnpm run dev
```

### For Build Dataset Templates

```bash
cd my-app

# Start infrastructure (Anvil, Ampd, etc.)
just infra-up
# or: docker compose up -d

# Deploy contracts to local testnet
just deploy-contracts

# Start development server
pnpm run dev
```

## Explore Existing Datasets

Visit [playground.amp.edgeandnode.com](https://playground.amp.edgeandnode.com) to:
- Browse available public datasets
- Run queries and see examples
- Find datasets for your application

## Requirements

- Node.js >= 22.0.0
- Docker and Docker Compose (for build dataset templates)

## Resources

- **Repository**: https://github.com/edgeandnode/amp-templates
- **Playground**: https://playground.amp.edgeandnode.com
- **License**: MIT

## Examples

```bash
# Backend GraphQL API
pnpm create amp@latest my-api --template backend-apollo-graphql

# React app with real-time sync
pnpm create amp@latest my-app --template react-ampsync-electricsql

# Quick prototype with existing dataset
pnpm create amp@latest explorer --template react-jsonlines-transfers
```
