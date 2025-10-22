# AMP Templates Development Commands

# Default recipe - show available commands
default:
    @just --list

## Workspace management

# PNPM install (pnpm install)
pnpm-install:
    pnpm install

## Code formatting and linting

alias fmt := fmt-ts
alias fmt-check := fmt-ts-check

# Format TypeScript code (pnpm format)
fmt-ts:
    pnpm format

# Check TypeScript code format (pnpm lint)
fmt-ts-check:
    pnpm lint

# Format specific TypeScript file (pnpm lint --fix <file>)
fmt-ts-file FILE:
    pnpm lint --fix "{{FILE}}"

## Check

alias check := check-ts

# Check TypeScript code
check-ts:
    pnpm run build

# Lint TypeScript code
lint:
    pnpm lint

# Lint and fix TypeScript code
lint-fix:
    pnpm lint --fix

## Testing

# Run TypeScript tests (pnpm test)
test *EXTRA_FLAGS:
    pnpm test {{EXTRA_FLAGS}}

# Run tests with coverage
test-coverage:
    pnpm test:coverage

## Build

# Build all packages
build:
    pnpm build

# Clean build artifacts
clean:
    pnpm clean

## Template Development

# Test template generation
test-template NAME="my-app":
    cd packages/create-amp-ref && pnpm dev "{{NAME}}" --framework nextjs --data-layer arrow-flight

# Generate example project
generate-example NAME="example-app":
    cd packages/create-amp-ref && pnpm dev "{{NAME}}" --framework nextjs --data-layer arrow-flight --example wallet
