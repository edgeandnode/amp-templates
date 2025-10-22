/**
 * Template generator - orchestrates project scaffolding
 */

import { execa } from 'execa';
import * as fs from 'fs-extra';
import * as fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import type { ProjectConfig, TemplateData } from './types';
import { createGitignore, detectPackageManager, getInstallCommand } from './utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get network configuration based on selection
 */
function getNetworkConfig(
  network?: string,
  networkEnv?: string
): {
  networkDisplayName: string;
  rpcUrl: string;
  chainId: string;
} {
  if (!network || !networkEnv) {
    return {
      networkDisplayName: 'Anvil (Local)',
      rpcUrl: 'http://localhost:8545',
      chainId: '31337',
    };
  }

  const configs: Record<string, Record<string, { name: string; rpc: string; chainId: string }>> = {
    arbitrum: {
      testnet: {
        name: 'Arbitrum Sepolia',
        rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
        chainId: '421614',
      },
      mainnet: {
        name: 'Arbitrum One',
        rpc: 'https://arb1.arbitrum.io/rpc',
        chainId: '42161',
      },
    },
    solana: {
      testnet: {
        name: 'Solana Devnet',
        rpc: 'https://api.devnet.solana.com',
        chainId: 'devnet',
      },
      mainnet: {
        name: 'Solana Mainnet',
        rpc: 'https://api.mainnet-beta.solana.com',
        chainId: 'mainnet-beta',
      },
    },
  };

  const config = configs[network]?.[networkEnv];
  return {
    networkDisplayName: config?.name || 'Unknown Network',
    rpcUrl: config?.rpc || '',
    chainId: config?.chainId || '',
  };
}

/**
 * Generate project from configuration
 */
export async function generateProject(config: ProjectConfig): Promise<void> {
  const { chainId, networkDisplayName, rpcUrl } = getNetworkConfig(
    config.network,
    config.networkEnv
  );

  const templateData: TemplateData = {
    ...config,
    packageManager: detectPackageManager(),
    includeAnvil: config.localSetup === 'anvil' || config.localSetup === 'both',
    includePublic: config.localSetup === 'public' || config.localSetup === 'both',
    isWalletExample: config.example === 'wallet',
    useAmpSync: config.dataLayer === 'amp-sync',
    useArrowFlight: config.dataLayer === 'arrow-flight',
    networkDisplayName,
    rpcUrl,
    chainId,
  };

  // Create project directory
  const spinner = ora('Creating project directory...').start();
  await fs.ensureDir(config.path);
  spinner.succeed('Project directory created');

  // Generate base structure
  await generateBaseStructure(config, templateData);

  // Generate frontend
  await generateFrontend(config, templateData);

  // Generate Amp configuration
  await generateAmpConfig(config, templateData);

  // Generate contracts (if needed)
  if (templateData.includeAnvil) {
    await generateContracts(config, templateData);
  }

  // Generate Docker Compose
  await generateDockerCompose(config, templateData);

  // Generate root files
  await generateRootFiles(config, templateData);

  // Initialize git
  if (!config.skipGit) {
    const gitSpinner = ora('Initializing git repository...').start();
    try {
      await execa('git', ['init'], { cwd: config.path });
      await execa('git', ['add', '.'], { cwd: config.path });
      await execa('git', ['commit', '-m', 'Initial commit from create-amp'], {
        cwd: config.path,
      });
      gitSpinner.succeed('Git repository initialized');
    } catch {
      gitSpinner.warn('Git initialization failed (skipping)');
    }
  }

  // Install dependencies
  if (!config.skipInstall) {
    const installSpinner = ora(
      `Installing dependencies with ${templateData.packageManager}...`
    ).start();
    try {
      const installCmd = getInstallCommand(templateData.packageManager);
      const [cmd, ...args] = installCmd.split(' ');
      await execa(cmd, args, { cwd: path.join(config.path, 'frontend') });
      installSpinner.succeed('Dependencies installed');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      throw error;
    }
  }
}

/**
 * Generate base project structure
 */
async function generateBaseStructure(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora('Creating base structure...').start();

  await fs.ensureDir(path.join(config.path, 'frontend'));
  await fs.ensureDir(path.join(config.path, 'amp'));
  await fs.ensureDir(path.join(config.path, 'amp', 'datasets'));
  await fs.ensureDir(path.join(config.path, 'amp', 'providers'));

  if (data.includeAnvil) {
    await fs.ensureDir(path.join(config.path, 'contracts'));
    await fs.ensureDir(path.join(config.path, 'contracts', 'src'));
    await fs.ensureDir(path.join(config.path, 'contracts', 'script'));
  }

  spinner.succeed('Base structure created');
}

/**
 * Generate frontend application
 */
async function generateFrontend(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora(`Generating ${config.framework} frontend...`).start();

  // In monorepo: packages/create-amp/dist -> ../../.. to root, then templates/
  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates');

  // Copy common files
  await copyTemplateDir(
    path.join(templatesDir, 'common', 'frontend'),
    path.join(config.path, 'frontend'),
    data
  );

  // Copy framework-specific files
  await copyTemplateDir(
    path.join(templatesDir, config.framework),
    path.join(config.path, 'frontend'),
    data
  );

  // Copy data-layer specific files
  await copyTemplateDir(
    path.join(templatesDir, 'data-layer', config.dataLayer),
    path.join(config.path, 'frontend'),
    data
  );

  // Copy example-specific files if wallet example
  if (data.isWalletExample) {
    await copyTemplateDir(
      path.join(templatesDir, 'examples', 'wallet', 'frontend'),
      path.join(config.path, 'frontend'),
      data
    );
  }

  spinner.succeed('Frontend generated');
}

/**
 * Generate Amp configuration
 */
async function generateAmpConfig(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora('Generating Amp configuration...').start();

  // In monorepo: packages/create-amp/dist -> ../../.. to root, then templates/
  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates');

  // Copy amp config files
  await copyTemplateDir(path.join(templatesDir, 'amp'), path.join(config.path, 'amp'), data);

  // Copy example-specific amp config if wallet example
  if (data.isWalletExample) {
    await copyTemplateDir(
      path.join(templatesDir, 'examples', 'wallet', 'amp'),
      path.join(config.path, 'amp'),
      data
    );
  }

  spinner.succeed('Amp configuration generated');
}

/**
 * Generate smart contracts
 */
async function generateContracts(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora('Generating smart contracts...').start();

  // In monorepo: packages/create-amp/dist -> ../../.. to root, then templates/
  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates');

  // Copy contract files
  await copyTemplateDir(
    path.join(templatesDir, 'contracts'),
    path.join(config.path, 'contracts'),
    data
  );

  // Copy example-specific contracts if wallet example
  if (data.isWalletExample) {
    await copyTemplateDir(
      path.join(templatesDir, 'examples', 'wallet', 'contracts'),
      path.join(config.path, 'contracts'),
      data
    );
  }

  spinner.succeed('Smart contracts generated');
}

/**
 * Generate Docker Compose configuration
 */
async function generateDockerCompose(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora('Generating Docker Compose configuration...').start();

  // In monorepo: packages/create-amp/dist -> ../../.. to root, then templates/
  const templatesDir = path.join(__dirname, '..', '..', '..', 'templates');
  const dockerComposeTemplate = path.join(
    templatesDir,
    'docker-compose',
    `docker-compose.${data.dataLayer}.yml`
  );

  let dockerCompose = await fsPromises.readFile(dockerComposeTemplate, 'utf-8');

  // Process template variables
  dockerCompose = dockerCompose.replace(/\{\{projectName\}\}/g, data.name);

  await fsPromises.writeFile(path.join(config.path, 'docker-compose.yml'), dockerCompose);

  spinner.succeed('Docker Compose configuration generated');
}

/**
 * Generate root files (README, .gitignore, etc.)
 */
async function generateRootFiles(config: ProjectConfig, data: TemplateData): Promise<void> {
  const spinner = ora('Generating root files...').start();

  // Create .gitignore
  await createGitignore(config.path);

  // Create README
  const readme = generateReadme(data);
  await fsPromises.writeFile(path.join(config.path, 'README.md'), readme);

  spinner.succeed('Root files generated');
}

/**
 * Helper to copy template directory with processing
 */
async function copyTemplateDir(srcDir: string, destDir: string, data: TemplateData): Promise<void> {
  if (!(await fs.pathExists(srcDir))) {
    return;
  }

  await copyDirRecursiveInternal(srcDir, destDir, srcDir, data);
}

/**
 * Internal recursive copy helper
 */
async function copyDirRecursiveInternal(
  srcDir: string,
  destDir: string,
  rootSrcDir: string,
  data: TemplateData
): Promise<void> {
  const entries = await fsPromises.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyDirRecursiveInternal(srcPath, destPath, rootSrcDir, data);
    } else if (entry.isFile()) {
      const relativePath = path.relative(rootSrcDir, srcPath);

      // Skip files based on configuration
      if (shouldSkipFile(relativePath, data)) continue;

      // Read file content
      let content = await fsPromises.readFile(srcPath, 'utf-8');

      // Process template variables
      content = processTemplate(content, data);

      // Write processed content
      await fsPromises.writeFile(destPath, content);
    }
  }
}

/**
 * Check if a file should be skipped based on configuration
 */
function shouldSkipFile(filePath: string, data: TemplateData): boolean {
  // Skip ORM-specific files if not using that ORM
  if (filePath.includes('electric') && data.orm !== 'electric') return true;
  if (filePath.includes('drizzle') && data.orm !== 'drizzle') return true;

  return false;
}

/**
 * Process template string by replacing variables
 */
function processTemplate(template: string, data: TemplateData): string {
  return template
    .replace(/\{\{\s*projectName\s*\}\}/g, data.name)
    .replace(/\{\{\s*packageManager\s*\}\}/g, data.packageManager)
    .replace(/\{\{\s*framework\s*\}\}/g, data.framework)
    .replace(/\{\{\s*dataLayer\s*\}\}/g, data.dataLayer)
    .replace(/\{\{\s*orm\s*\}\}/g, data.orm || '')
    .replace(/\{\{\s*networkDisplayName\s*\}\}/g, data.networkDisplayName)
    .replace(/\{\{\s*rpcUrl\s*\}\}/g, data.rpcUrl)
    .replace(/\{\{\s*chainId\s*\}\}/g, data.chainId);
}

/**
 * Generate README content
 */
function generateReadme(data: TemplateData): string {
  const { dataLayer, framework, includeAnvil, isWalletExample, name, orm } = data;

  const readme = `# ${name}

${isWalletExample ? 'An ERC20 token wallet application' : 'An Amp-powered web application'} built with ${
    framework === 'nextjs' ? 'Next.js' : 'React (Vite)'
  }.

## 🚀 Quick Start

Follow these steps to run your application:

### 1. Install Frontend Dependencies

\`\`\`bash
cd frontend
pnpm install
cd ..
\`\`\`

### 2. Start Infrastructure

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
${dataLayer === 'amp-sync' ? '- **PostgreSQL** (port 5432) - Database for Amp Sync\n' : ''}${dataLayer === 'amp-sync' && orm === 'electric' ? '- **ElectricSQL** (port 3000) - Real-time sync service\n' : ''}- **Amp Server**:
  - Port 1602: Arrow Flight gRPC
  - Port 1603: JSON Lines HTTP
  - Port 1610: Admin API
${includeAnvil ? '- **Anvil** (port 8545) - Local Ethereum testnet\n' : ''}

### 3. ${includeAnvil ? 'Deploy Smart Contracts\n\n' : 'Start Amp Development Server\n\n'}${
    includeAnvil
      ? `Set up your private key for Anvil deployments:

\`\`\`bash
# Use one of Anvil's default private keys (DO NOT use in production!)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
\`\`\`

Deploy the contracts:

\`\`\`bash
cd contracts
forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545
cd ..
\`\`\`

### 4. Start Amp Development Server

`
      : ''
  }\`\`\`bash
cd amp
pnpm amp dev
\`\`\`

This will:
- Load your dataset configuration from \`datasets/amp.config.ts\`
- Connect to the configured data sources
- Start serving queries via Arrow Flight and HTTP

### ${includeAnvil ? '5' : '4'}. Start Frontend Development Server

\`\`\`bash
cd frontend
pnpm dev
\`\`\`

### ${includeAnvil ? '6' : '5'}. Open Your Browser

Visit **${framework === 'nextjs' ? 'http://localhost:3001' : 'http://localhost:5173'}** to see your application!

${
  isWalletExample
    ? `

## 💰 Using the Wallet Example

1. **Connect MetaMask**: Configure MetaMask to use the local Anvil network:
   - Network Name: Anvil
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Anvil Account**: Import one of Anvil's test accounts using a private key:
   - Example: \`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80\`
   - This account has 10,000 ETH by default

3. **View Your Balance**: The app will automatically query your token balance

4. **Make Transfers**: Use the UI to transfer tokens between addresses

`
    : ''
}

## 📁 Project Structure

\`\`\`
${name}/
├── frontend/           # ${framework === 'nextjs' ? 'Next.js' : 'React (Vite)'} application
│   ├── src/
│   │   ├── lib/       # Amp client & runtime setup${
    dataLayer === 'arrow-flight'
      ? `
│   │   │   ├── runtime.ts    # Effect runtime with Arrow Flight
│   │   │   └── queries.ts    # Example queries`
      : `
│   │   │   ├── ${orm === 'electric' ? 'electric' : 'drizzle'}.ts  # ${orm === 'electric' ? 'ElectricSQL' : 'Drizzle'} setup
│   │   │   └── schema.ts     # Database schema`
  }
│   │   ├── components/       # React components
│   │   └── ${framework === 'nextjs' ? 'app' : 'src'}/           # ${framework === 'nextjs' ? 'Pages & API routes' : 'Application code'}
│   └── package.json
├── amp/                      # Amp configuration
│   ├── datasets/
│   │   └── amp.config.ts    # Dataset definitions${
    isWalletExample
      ? `
│   │                        # - Defines token event tables
│   │                        # - Tracks Transfer & Approval events`
      : ''
  }
│   ├── providers/           # Data source configs
│   └── config.toml          # Amp server settings
${
  includeAnvil
    ? `├── contracts/              # Foundry smart contracts
│   ├── src/
${isWalletExample ? '│   │   └── SimpleToken.sol # ERC20 token contract' : '│   │   └── *.sol           # Your contracts'}
│   ├── script/
│   │   └── Deploy.s.sol     # Deployment script
│   ├── test/                # Contract tests
│   └── foundry.toml         # Foundry configuration
`
    : ''
}├── docker-compose.yml       # Infrastructure services
└── README.md
\`\`\`

## 🛠️ Technology Stack

- **Frontend**: ${framework === 'nextjs' ? 'Next.js 15+' : 'React 19+ with Vite'}
- **Data Layer**: ${
    dataLayer === 'arrow-flight'
      ? 'Arrow Flight (high-performance binary protocol)'
      : 'Amp Sync (PostgreSQL synchronization)'
  }
${dataLayer === 'amp-sync' ? `- **ORM**: ${orm === 'electric' ? 'ElectricSQL (real-time sync)' : 'Drizzle (type-safe queries)'}\n` : ''}
- **Styling**: Tailwind CSS 4+
- **Type Safety**: TypeScript 5.9+
- **State Management**: Effect-TS with Effect Atom
${includeAnvil ? '- **Blockchain**: Anvil (Foundry) + Viem\n' : ''}
${dataLayer === 'amp-sync' ? '- **Database**: PostgreSQL 16+\n' : ''}

## 📜 Available Scripts

### Frontend (\`frontend/\`)

\`\`\`bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm start       # Start production server (Next.js only)
pnpm lint        # Run ESLint
pnpm check       # Run TypeScript type checking
\`\`\`

### Amp (\`amp/\`)

\`\`\`bash
pnpm amp dev                          # Start with hot reloading
pnpm amp server                       # Start production server
pnpm amp dump --dataset <name>        # Extract dataset to Parquet
pnpm amp query "SELECT * FROM ..."    # Run SQL query
pnpm amp studio                       # Open Amp Studio UI
\`\`\`

${
  includeAnvil
    ? `### Smart Contracts (\`contracts/\`)

\`\`\`bash
forge build                           # Compile contracts
forge test                            # Run tests
forge test -vvv                       # Run tests with detailed output
forge script script/Deploy.s.sol \\    # Deploy contracts
  --broadcast \\
  --rpc-url http://localhost:8545
forge fmt                             # Format Solidity code
\`\`\`

`
    : ''
}

## 🐛 Troubleshooting

### Port Already in Use

If you see errors about ports being in use:

\`\`\`bash
# Check what's using the port
lsof -i :1602  # or :5432, :8545, etc.

# Stop Docker services
docker-compose down

# Restart
docker-compose up -d
\`\`\`

### Database Connection Issues

${
  dataLayer === 'amp-sync'
    ? `Ensure PostgreSQL is running:

\`\`\`bash
docker-compose ps
docker-compose logs postgres
\`\`\`

Reset the database if needed:

\`\`\`bash
docker-compose down -v  # ⚠️  This deletes all data!
docker-compose up -d
\`\`\`

`
    : ''
}### Amp Server Not Starting

Check the logs:

\`\`\`bash
cd amp
pnpm amp dev
# Look for error messages
\`\`\`

Common issues:
- Missing dataset configuration in \`datasets/amp.config.ts\`
- Invalid provider configuration in \`providers/\`
- Database not accessible

${
  includeAnvil
    ? `

### Contract Deployment Fails

Make sure:
1. Anvil is running (\`docker-compose ps\`)
2. You've exported the \`PRIVATE_KEY\` environment variable
3. The RPC URL is correct (\`http://localhost:8545\`)

Check Anvil logs:

\`\`\`bash
docker-compose logs anvil
\`\`\`

`
    : ''
}

### Frontend Build Errors

Clear cache and reinstall:

\`\`\`bash
cd frontend
rm -rf node_modules .next  # or dist/ for Vite
pnpm install
pnpm dev
\`\`\`

## 📚 Learn More

### Documentation

- [Amp Documentation](https://github.com/edgeandnode/amp-private/tree/main/docs)
- [Effect Documentation](https://effect.website)
- [${framework === 'nextjs' ? 'Next.js' : 'Vite'} Documentation](${
    framework === 'nextjs' ? 'https://nextjs.org/docs' : 'https://vite.dev'
  })
${
  dataLayer === 'amp-sync'
    ? `- [${orm === 'electric' ? 'ElectricSQL' : 'Drizzle'} Documentation](${
        orm === 'electric' ? 'https://electric-sql.com' : 'https://orm.drizzle.team'
      })\n`
    : ''
}${includeAnvil ? '- [Foundry Documentation](https://book.getfoundry.sh)\n- [Viem Documentation](https://viem.sh)\n' : ''}

### Key Concepts

${
  dataLayer === 'arrow-flight'
    ? `**Arrow Flight**: A high-performance data transfer protocol built on gRPC and Apache Arrow. It enables:
- Fast binary data transfer
- Streaming large datasets
- Type-safe schema-based queries

`
    : `**Amp Sync**: Synchronizes Amp datasets to PostgreSQL for:
- Traditional SQL access
- Real-time data updates
${orm === 'electric' ? '- Offline-first applications with ElectricSQL\n' : '- Type-safe queries with Drizzle ORM\n'}
`
}
**Effect-TS**: A functional programming library providing:
- Type-safe error handling
- Dependency injection
- Resource management
- Composable effects

${
  isWalletExample
    ? `**ERC20 Tokens**: Standard fungible tokens on Ethereum with:
- Transfer functionality
- Balance tracking
- Approval mechanism

`
    : ''
}

## 🚢 Deployment

### Building for Production

\`\`\`bash
# Build frontend
cd frontend
pnpm build

# Build output is in:
${framework === 'nextjs' ? '# - .next/ (Next.js)' : '# - dist/ (Vite)'}
\`\`\`

### Environment Variables

Create a \`.env.local\` file in \`frontend/\`:

\`\`\`env
${
  dataLayer === 'amp-sync'
    ? `# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

${orm === 'electric' ? '# ElectricSQL\nELECTRIC_URL=https://your-electric-instance.com/v1/shape\n\n' : ''}
`
    : ''
}# Amp Server
AMP_ARROW_FLIGHT_URL=http://your-amp-server:1602
AMP_HTTP_URL=http://your-amp-server:1603

${includeAnvil ? '# Blockchain (if deploying to testnet/mainnet)\nNEXT_PUBLIC_RPC_URL=https://your-rpc-url\nNEXT_PUBLIC_CHAIN_ID=1\n' : ''}
\`\`\`

## 📄 License

UNLICENSED

---

**Need Help?** Check the [Amp documentation](https://github.com/edgeandnode/amp-private/tree/main/docs) or reach out to the team.
`;

  return readme;
}
