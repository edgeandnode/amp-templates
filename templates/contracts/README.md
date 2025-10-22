# Smart Contracts

This directory contains Solidity smart contracts for {{projectName}}.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Getting Started

### Install Dependencies

```bash
forge install
```

### Compile Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy to Anvil

Make sure Anvil is running via docker-compose, then:

```bash
forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545
```

The deployed contract address will be shown in the output.

## Project Structure

```
contracts/
├── src/              # Solidity source files
├── script/           # Deployment scripts
├── test/             # Contract tests
├── lib/              # Dependencies (via forge install)
└── foundry.toml      # Foundry configuration
```

## Learn More

- [Foundry Book](https://book.getfoundry.sh/)
- [Solidity Documentation](https://docs.soliditylang.org/)
