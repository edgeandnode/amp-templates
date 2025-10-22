# create-amp

A CLI tool to scaffold Amp-powered web applications with various technology stacks and examples.

## Quick Start

```bash
# Using npx
npx @edgeandnode/create-amp my-app

# Or with pnpm
pnpm create @edgeandnode/amp my-app

# Or with npm
npm create @edgeandnode/amp my-app
```

## Features

- 🚀 **Multiple Frameworks**: Choose between Next.js or React (Vite)
- 📊 **Data Layer Options**: Arrow Flight or Amp Sync
- 🗄️ **Database ORMs**: ElectricSQL or Drizzle (when using Amp Sync)
- ⚡ **State Management**: Effect-based patterns
- 🎨 **Modern UI**: Tailwind CSS & shadcn/ui components
- 🔗 **Blockchain Integration**: Anvil local testnet setup
- 📝 **Smart Contracts**: Example ERC20 contracts with deployment scripts
- 🎯 **Example Applications**: Pre-built wallet app template

## Configuration Options

### Framework
- **Next.js**: Server-side rendering, API routes, and full-stack capabilities
- **React (Vite)**: Fast development with instant HMR

### Data Layer
- **Arrow Flight**: High-performance binary protocol for direct Amp queries
- **Amp Sync**: PostgreSQL synchronization for traditional database workflows

### Database/ORM (when using Amp Sync)
- **ElectricSQL**: Real-time sync with offline-first capabilities
- **Drizzle**: Type-safe SQL query builder

### Examples
- **Wallet App**: ERC20 token wallet with balance tracking and transfers
- **Blank**: Start from scratch with just the infrastructure

### Local Setup
- **Anvil + Amp**: Complete local blockchain and Amp server setup
- **Public Dataset**: Connect to public Amp datasets
- **Both**: Local development with public dataset fallback

## Generated Project Structure

```
my-app/
├── frontend/                 # Your web application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── amp.ts       # Amp client configuration
│   │   │   └── runtime.ts   # Effect runtime setup
│   │   ├── components/      # UI components
│   │   └── app/             # Pages (Next.js) or routes (Vite)
│   ├── package.json
│   └── [framework-specific files]
├── contracts/                # Smart contracts (if Anvil enabled)
│   ├── src/
│   │   └── ERC20Token.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   ├── foundry.toml
│   └── README.md
├── amp/                      # Amp configuration
│   ├── datasets/
│   │   └── amp.config.ts
│   ├── providers/
│   │   └── anvil.toml
│   └── config.toml
├── docker-compose.yml        # Infrastructure services
└── README.md
```

## Technology Stack

The generated application includes:

- **Frontend**: Next.js 15+ or React 19+
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Effect System**: Effect-TS for functional programming
- **Blockchain**: Viem for Ethereum interactions
- **Local Testing**: Anvil (Foundry)
- **Database**: PostgreSQL (when using Amp Sync)

## Usage

### Interactive Mode

Simply run the command and follow the prompts:

```bash
npx @edgeandnode/create-amp my-app
```

### CLI Flags

```bash
npx @edgeandnode/create-amp my-app \
  --framework nextjs \
  --data-layer arrow-flight \
  --example wallet \
  --local-setup both
```

#### Available Flags

- `--framework <type>`: `nextjs` or `vite`
- `--data-layer <type>`: `arrow-flight` or `amp-sync`
- `--orm <type>`: `electric` or `drizzle` (only with amp-sync)
- `--example <type>`: `wallet` or `blank`
- `--local-setup <type>`: `anvil`, `public`, or `both`
- `--skip-install`: Skip package installation
- `--skip-git`: Skip git initialization

## Examples

### Next.js + Arrow Flight + Wallet Example

```bash
npx @edgeandnode/create-amp my-wallet \
  --framework nextjs \
  --data-layer arrow-flight \
  --example wallet
```

### Vite + Amp Sync + Drizzle

```bash
npx @edgeandnode/create-amp my-app \
  --framework vite \
  --data-layer amp-sync \
  --orm drizzle
```

## Development

After creating your project:

```bash
cd my-app

# Start local infrastructure (PostgreSQL, Amp, Anvil)
docker-compose up -d

# Deploy contracts (if using Anvil)
cd contracts
forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545

# Start Amp development server
cd ../amp
pnpm amp dev

# Start frontend development server
cd ../frontend
pnpm dev
```

Visit `http://localhost:3000` (Next.js) or `http://localhost:5173` (Vite)

## Learn More

- [Amp Documentation](https://github.com/edgeandnode/amp-private/tree/main/docs)
- [Effect Documentation](https://effect.website)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vite.dev)

## License

UNLICENSED

