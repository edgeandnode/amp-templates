# {{projectName}}

**_Different README.md versions exist in each application varient subfolder_**

A modern Vite + React application powered by Amp for real-time data querying and blockchain interactions.

## Features

- **Vite + React**: Fast development with hot module reloading
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern utility-first CSS framework
- **Wagmi + Viem**: Ethereum interactions and wallet connectivity

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10.19.0+

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development environment:

   ```bash
   pnpm dev
   ```

   This will start:
   - Local blockchain (Anvil)
   - Amp server
   - Vite development server

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

### Available Scripts

- `pnpm dev` - Start the complete development environment
- `pnpm dev:vite` - Start only the Vite development server
- `pnpm build` - Build the application for production
- `pnpm preview` - Preview the production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run all checks (typecheck, lint, prettier)

### Smart Contracts

The project includes example ERC20 token contracts located in the `contracts/` directory:

- **Deploy contracts**: `just deploy-contracts`
- **Initialize portfolio**: `just init-portfolio`
- **Run transfers**: `just do-transfers`

See the [contracts README](./contracts/README.md) for more details.

## Architecture

This application demonstrates real-time portfolio tracking with:

- **Wallet Integration**: Connect MetaMask or other Web3 wallets
- **Real-time Updates**: Live balance and transaction updates via Amp
- **Token Management**: View and transfer ERC20 tokens
- **Transaction History**: Complete transaction tracking with real-time notifications

### Data Flow

1. Smart contracts emit events on the local blockchain (Anvil)
2. Amp captures and processes these events in real-time
3. The React frontend queries Amp for live data updates
4. UI updates automatically when new transactions occur

## Configuration

### Environment Setup

The application uses a local development environment with:

- **Anvil**: Local Ethereum blockchain on port 8545
- **Amp**: Data processing server configured via `amp.config.ts`
- **PostgreSQL**: Database for storing processed data

### Wagmi Configuration

Wallet connectivity is configured in `src/config/wagmi.ts` with support for:

- MetaMask
- WalletConnect
- Coinbase Wallet
- Other injected wallets

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5173, 8545, and 5432 are available
2. **Wallet connection**: Make sure your wallet is connected to the local network (Chain ID: 31337)
3. **Contract deployment**: Run `just deploy-contracts` if contracts aren't deployed

### Logs

- **Amp logs**: Check the Amp server output for data processing issues
- **Anvil logs**: Monitor blockchain activity and transactions
- **Browser console**: Check for frontend errors and transaction status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm check` to ensure code quality
5. Submit a pull request

## License

This project is licensed under the MIT License.
