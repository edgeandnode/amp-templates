# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The AMP Templates monorepo for scaffolding Amp-powered web applications. It includes templates for Next.js and Vite with TypeScript, Tailwind CSS, and various data layer options.

## Architecture

### Monorepo Structure

- **packages/create-amp** - CLI tool for scaffolding Amp-powered applications
- **templates/** - Template files for different frameworks and configurations
- **examples/** - Example applications demonstrating Amp integration

### Tech Stack

- **CLI Framework**: @clack/prompts for interactive CLI
- **Templates**: Next.js 15 and Vite with React, TypeScript, Tailwind CSS
- **Data Layers**: Apache Arrow Flight, Electric SQL (amp-sync)
- **Package Manager**: pnpm with workspaces
- **Node Version**: >=20 (uses .nvmrc)
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier, TypeScript

## Development Commands

### Initial Setup

#### Quick Setup (Recommended)

```bash
# One-command setup that handles everything
pnpm run setup
```

This automated setup will:

- Install all dependencies
- Build all packages
- Verify Node.js version compatibility

#### Manual Setup (Alternative)

```bash
# Install dependencies for all packages
pnpm install

# Build packages
pnpm build
```

### Common Development Tasks

```bash
# Build entire monorepo
pnpm build

# Run tests across all packages
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm run build  # Includes type checking

# Linting
pnpm lint
pnpm lint --fix

# Code formatting
pnpm format

# Clean build artifacts
pnpm clean

# Generate a new project
cd packages/create-amp && pnpm dev my-app --framework nextjs --data-layer arrow-flight
```

### Working with Templates

```bash
# Generate Next.js project
cd packages/create-amp && pnpm dev my-nextjs-app --framework nextjs --data-layer arrow-flight

# Generate Vite project
cd packages/create-amp && pnpm dev my-vite-app --framework vite --data-layer amp-sync

# Generate with example
cd packages/create-amp && pnpm dev my-app --framework nextjs --example wallet

# List all available options
cd packages/create-amp && pnpm dev --help
```

## Template Structure

### Available Templates

#### Next.js Template
- **Location**: `templates/nextjs/`
- **Features**: Next.js 15, TypeScript, Tailwind CSS, App Router
- **Dependencies**: Minimal set for basic Next.js development

#### Vite Template
- **Location**: `templates/vite/`
- **Features**: Vite, React, TypeScript, Tailwind CSS
- **Dependencies**: Minimal set for basic Vite development

### Data Layer Templates

#### Arrow Flight
- **Location**: `templates/data-layer/arrow-flight/`
- **Features**: Apache Arrow Flight client integration
- **Use Case**: High-performance data querying

#### AMP Sync (Electric SQL)
- **Location**: `templates/data-layer/amp-sync/`
- **Features**: Electric SQL integration with Drizzle ORM
- **Use Case**: Real-time data synchronization

### Example Templates

#### Wallet Example
- **Location**: `templates/examples/wallet/`
- **Features**: Complete wallet integration example
- **Includes**: Smart contracts, frontend, AMP configuration

## Code Organization Patterns

### Template Variables

Templates use handlebars-style variable replacement:

- `{{projectName}}` - Project name from user input
- `{{framework}}` - Selected framework (nextjs/vite)
- `{{dataLayer}}` - Selected data layer (arrow-flight/amp-sync)
- `{{orm}}` - Selected ORM (electric/drizzle)
- `{{networkDisplayName}}` - Blockchain network name
- `{{rpcUrl}}` - RPC URL for blockchain connection

### CLI Structure

The CLI (`packages/create-amp`) provides project scaffolding:

- `/src/cli.ts` - Interactive CLI prompts and configuration
- `/src/generator.ts` - Template processing and file generation
- `/src/utils.ts` - Utility functions for file operations
- `/src/types.ts` - TypeScript type definitions

#### CLI Commands

```bash
# Generate project with interactive prompts
pnpm dev [project-name]

# Generate with specific options
pnpm dev my-app --framework nextjs --data-layer arrow-flight

# Available options:
--framework <type>    # Framework to use (nextjs|vite)
--data-layer <type>  # Data layer to use (arrow-flight|amp-sync)
--orm <type>         # ORM to use with amp-sync (electric|drizzle)
--example <type>     # Example to scaffold (wallet|blank)
--local-setup <type> # Local setup (anvil|public|both)
--network <type>     # Blockchain network (arbitrum|solana)
--network-env <type> # Network environment (testnet|mainnet)
--skip-install       # Skip package installation
--skip-git           # Skip git initialization
```

## Code Quality Standards

### TypeScript Configuration

- Strict mode enabled with exactOptionalPropertyTypes
- Target: ES2022
- Module: ESNext with bundler resolution
- Isolated modules for better tree-shaking
- No implicit any or unchecked indexed access

### ESLint Rules

- Import ordering enforced (builtin → external → parent → sibling)
- Perfectionist plugin for consistent exports
- TypeScript-specific rules for type imports
- Unused variables prefixed with underscore are allowed

### Prettier Configuration

- Tailwind CSS class sorting enabled
- Consistent formatting across all packages
- 120 character line width
- No semicolons
- Double quotes

## Testing Strategy

Tests use Vitest with workspace configuration:

- Unit tests colocated with source files
- Integration tests in `/test` directories
- Run `pnpm test` to execute all tests
- Tests automatically discover in packages/

## Environment Variables

### CLI Environment

- `NODE_ENV` - Environment (development/production)
- Package manager detection via `npm_config_user_agent`

## Development Tips

### Before Making Changes

1. Always run `pnpm run build` to ensure code quality
2. Use existing patterns from similar files
3. Check imports - use relative imports within packages
4. Follow TypeScript strict patterns

### When Adding Features

1. For CLI features: Add to `packages/create-amp/src/`
2. For template changes: Update files in `templates/`
3. For new templates: Create new directories in `templates/`
4. For shared utilities: Add to `packages/create-amp/src/utils.ts`

### Testing Guidelines

- Write tests in `*.test.ts` or `*.spec.ts` files
- Use Vitest globals (configured)
- Tests run across all packages automatically

### Common Issues & Solutions

- **Template variable issues**: Check variable names match exactly
- **Module resolution errors**: Check `tsconfig.json` extends base config
- **Lint errors**: Run `pnpm lint --fix` for auto-fixes
- **Build errors**: Ensure all dependencies are installed

## Key Technologies

- **Runtime**: Node.js v20+, TypeScript 5.8+
- **CLI Framework**: @clack/prompts for interactive prompts
- **Templates**: Next.js 15, Vite, React, TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Package Management**: pnpm workspaces
- **Code Quality**: ESLint, Prettier
- **Build Tools**: TypeScript compiler
- **Development**: tsx (TypeScript execute)

## Repository Conventions

- Use workspace protocol for internal dependencies
- Follow existing file naming patterns
- Maintain strict TypeScript settings
- No semicolons (Prettier enforced)
- 120 character line width
- Use consistent template variable naming
