# Claude Code Assistant Reference - AMP Templates Monorepo

## Overview

This is a TypeScript/JavaScript monorepo for AMP Templates, focused on scaffolding Amp-powered web applications. The project uses pnpm workspaces, modern TypeScript tooling, and provides templates for Next.js and Vite with various data layer options.

## Architecture

### Monorepo Structure

```text
amp-templates/
├── packages/                    # Package workspaces
│   └── create-amp/             # CLI tool for scaffolding projects
├── templates/                   # Template files
│   ├── nextjs/                 # Next.js template
│   ├── vite/                   # Vite template
│   ├── data-layer/             # Data layer templates
│   └── examples/                # Example templates
├── examples/                    # Example applications
└── scripts/                     # Build and utility scripts
```

### Package Manager & Workspaces

- **Package Manager**: pnpm v10.19.0+
- **Workspace Configuration**: `pnpm-workspace.yaml`
  - Packages: `packages/*`
- **Node Version**: v22+ (specified in engines field)

## Commands Reference

### Development Workflow

#### Quick Setup (Recommended)

```bash
# One-command setup (installs deps, builds packages)
pnpm run setup

# Then run CLI
cd packages/create-amp && pnpm dev my-app
```

#### Manual Setup

```bash
# Install dependencies
pnpm i

# Build packages
pnpm build

# Generate a project
cd packages/create-amp && pnpm dev my-app --framework nextjs --data-layer arrow-flight
```

### Build & Test

```bash
# Build entire monorepo
pnpm run build

# Run tests
pnpm test           # Run all tests with Vitest

# Type checking
pnpm run build      # Includes type checking

# Code quality
pnpm run lint       # ESLint check
pnpm run lint --fix # Auto-fix linting issues
pnpm run format     # Format code
```

### Template Generation

```bash
# Interactive project generation
cd packages/create-amp && pnpm dev [project-name]

# Generate with specific options
cd packages/create-amp && pnpm dev my-app --framework nextjs --data-layer arrow-flight

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

## Code Standards

### TypeScript Configuration

- **Base Config**: `tsconfig.base.jsonc`
  - Strict mode enabled
  - Target: ES2022
  - Module: ESNext with bundler resolution
  - Path aliases configured for packages
- **Build Config**: `tsconfig.build.json`
- **Composite projects** for better monorepo performance

### Code Style

- **Prettier Configuration** (`.prettierrc`):
  - Print width: 120
  - No semicolons
  - Double quotes
  - Tailwind CSS plugin enabled
- **ESLint**: TypeScript-ESLint with import and perfectionist plugins
- **File type**: ES modules (`"type": "module"` in package.json)

### Testing

- **Framework**: Vitest
- **Configuration**: `vitest.config.ts` + `vitest.shared.ts`
- **Coverage**: V8 coverage reporting
- Run with `pnpm test`

## Important Patterns

### Template Variable System

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

### Template Organization

#### Available Templates

**Next.js Template** (`templates/nextjs/`):

- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS setup
- Minimal dependencies

**Vite Template** (`templates/vite/`):

- Vite with React
- TypeScript configuration
- Tailwind CSS setup
- Minimal dependencies

**Data Layer Templates**:

- `templates/data-layer/arrow-flight/` - Apache Arrow Flight integration
- `templates/data-layer/amp-sync/` - Electric SQL with Drizzle ORM

**Example Templates**:

- `templates/examples/wallet/` - Complete wallet integration example

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

- **Runtime**: Node.js v22+, TypeScript 5.9+
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
