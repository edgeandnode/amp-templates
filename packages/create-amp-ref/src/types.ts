/**
 * Types and interfaces for the create-amp CLI
 */

export type Framework = "nextjs" | "vite"
export type DataLayer = "arrow-flight" | "amp-sync"
export type ORM = "electric" | "drizzle"
export type Example = "wallet" | "blank"
export type LocalSetup = "anvil" | "public" | "both"
export type Network = "arbitrum" | "solana"
export type NetworkEnv = "testnet" | "mainnet"

export interface ProjectConfig {
  /** Project name */
  name: string
  /** Absolute path to project directory */
  path: string
  /** Frontend framework */
  framework: Framework
  /** Data layer choice */
  dataLayer: DataLayer
  /** ORM choice (only applicable if dataLayer is amp-sync) */
  orm?: ORM
  /** Example application to scaffold */
  example: Example
  /** Local setup configuration */
  localSetup: LocalSetup
  /** Blockchain network (only applicable if localSetup is public or both) */
  network?: Network
  /** Network environment (only applicable if network is selected) */
  networkEnv?: NetworkEnv
  /** Skip package installation */
  skipInstall: boolean
  /** Skip git initialization */
  skipGit: boolean
}

export interface TemplateData extends ProjectConfig {
  /** Package manager to use */
  packageManager: "pnpm" | "npm" | "yarn" | "bun"
  /** Whether to include Anvil setup */
  includeAnvil: boolean
  /** Whether to include public dataset setup */
  includePublic: boolean
  /** Whether this is the wallet example */
  isWalletExample: boolean
  /** Whether using Amp Sync */
  useAmpSync: boolean
  /** Whether using Arrow Flight */
  useArrowFlight: boolean
  /** Network display name */
  networkDisplayName: string
  /** RPC URL for the selected network */
  rpcUrl: string
  /** Chain ID for the selected network */
  chainId: string
}
