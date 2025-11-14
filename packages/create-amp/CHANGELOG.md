# create-amp

## 0.0.1

### Patch Changes

- Initial release of create-amp CLI tool

**Features:**

- Scaffold Amp-enabled applications with interactive CLI prompts
- Support for multiple framework templates:
  - **Backend**: Express, Fastify, Apollo GraphQL (with local and gateway variants)
  - **Frontend**: Next.js, React + Vite
- Multiple query protocols:
  - Arrow Flight (gRPC-based streaming)
  - JSON Lines (HTTP streaming)
  - AmSync + Electric SQL (PostgreSQL sync with real-time updates)
- Two template categories:
  - **Build Dataset Templates**: Includes Docker Compose with Anvil, Ampd, and smart contract templates for local development
  - **Existing Dataset Templates**: Connect to Amp Gateway for querying existing datasets (no local infrastructure needed)
- State management options: effect-atom, TanStack Query, Electric SQL
- Built with Effect-TS for type-safe, functional CLI implementation
- Automatic git initialization with initial commit (optional)
- Package manager selection (pnpm, npm, yarn, bun)
- Templates include modern tooling: TypeScript, Tailwind CSS, shadcn/ui components, Foundry

**Available Templates:**

- `backend-express` - Express REST API with Arrow Flight (local)
- `backend-fastify` - Fastify REST API with Arrow Flight (local)
- `backend-apollo-graphql` - Apollo GraphQL API with Arrow Flight (local)
- `backend-express-gateway` - Express REST API with Amp Gateway (remote)
- `backend-fastify-gateway` - Fastify REST API with Amp Gateway (remote)
- `backend-apollo-graphql-gateway` - Apollo GraphQL API with Amp Gateway (remote)
- `nextjs` - Next.js fullstack application (local)
- `react-ampsync-electricsql` - React + Vite with AmSync and Electric SQL (local)
- `react-arrowflight-effect-atom` - React + Vite with Arrow Flight and effect-atom (local)
- `react-jsonlines-effect-atom` - React + Vite with JSON Lines and effect-atom (local)
- `react-jsonlines-react-query` - React + Vite with JSON Lines and TanStack Query (local)
- `react-jsonlines-transfers` - React + Vite querying Arbitrum One transfers dataset (remote)

**Usage:**

```bash
# Interactive mode (recommended)
pnpm create amp@latest

# With specific template
pnpm create amp@latest my-app --template backend-express --package-manager pnpm

# Skip optional steps
pnpm create amp@latest my-app --skip-install-deps --skip-initialize-git
```

**Requirements:**

- Node.js >= 22.0.0
- Docker and Docker Compose (for build dataset templates)

**Resources:**

- Amp Playground: https://playground.amp.edgeandnode.com
- Repository: https://github.com/edgeandnode/amp-templates
- llms.txt included for AI agent discoverability
