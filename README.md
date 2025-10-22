# Amp Templates

Monorepo containing Amp example apps, templates, and the Create Amp CLI utility for generating Amp-powered applications.

## Structure

```
amp-templates/
├── packages/
│   └── create-amp/          # CLI utility for generating Amp applications
├── templates/               # Templates used by Create Amp CLI
│   ├── amp/                # Amp configuration templates
│   ├── common/             # Shared frontend files
│   ├── contracts/          # Smart contract templates
│   ├── data-layer/         # Data layer templates (Arrow Flight, Amp Sync)
│   ├── docker-compose/     # Docker Compose configurations
│   ├── examples/           # Example-specific templates
│   ├── nextjs/             # Next.js framework templates
│   └── vite/               # Vite framework templates
└── examples/
    └── nextjs-electricsql/  # Next.js with Electric SQL integration
```

## Quick Start

### Using Create Amp

Generate a new Amp-powered application:

```bash
# Using npx
npx @edgeandnode/create-amp my-app

# Or with pnpm
pnpm create @edgeandnode/amp my-app

# Or with npm
npm create @edgeandnode/amp my-app
```

See the [Create Amp README](./packages/create-amp/README.md) for detailed usage instructions.

## Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run Create Amp in development mode
cd packages/create-amp
pnpm dev
```

### Package Scripts

From the repository root:

```bash
# Build all packages
pnpm build

# Clean all build artifacts
pnpm clean

# Format code
pnpm format

# Lint code
pnpm lint
```

## Packages

### [@edgeandnode/create-amp](./packages/create-amp)

CLI tool to scaffold Amp-powered web applications with various technology stacks and examples.

**Features:**
- 🚀 Multiple Frameworks: Next.js or React (Vite)
- 📊 Data Layer Options: Arrow Flight or Amp Sync
- 🗄️ Database ORMs: ElectricSQL or Drizzle (when using Amp Sync)
- ⚡ State Management: Effect-based patterns
- 🎨 Modern UI: Tailwind CSS & shadcn/ui components
- 🔗 Blockchain Integration: Anvil local testnet setup

## Templates

Templates are used by the Create Amp CLI to generate new projects. They are organized by:

- **Framework**: Next.js, Vite
- **Data Layer**: Arrow Flight (direct queries), Amp Sync (PostgreSQL sync)
- **Examples**: Wallet app, blank starter

## Examples

Full-featured example applications demonstrating different Amp integration patterns.

### [nextjs-electricsql](./examples/nextjs-electricsql)

Demonstrates the usage of the `ampsync` crate to sync data to PostgreSQL, then using [Electric SQL](https://electric-sql.com/docs/intro) to reactively sync the amp dataset data and make it available in a Next.js UI.

**Tech Stack:**
- Docker (PostgreSQL, Anvil, Amp, Ampsync, Electric SQL)
- Next.js app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Learn More

- [Amp Documentation](https://github.com/edgeandnode/amp-private/tree/main/docs)
- [Effect Documentation](https://effect.website)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vite.dev)

## License

UNLICENSED
