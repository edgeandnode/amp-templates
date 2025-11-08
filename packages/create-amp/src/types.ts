export interface CliOptions {
  projectName: string
  projectType: "frontend" | "backend"
  framework?: "nextjs" | "vite" // Only for frontend projects
  backend?: "fastify" | "express" // Only for backend projects
  dataLayer: "arrow-flight" | "amp-sync"
  orm?: "electric" | "drizzle"
  example?: "wallet" | "blank"
  localSetup?: "anvil" | "public" | "both"
  network?: "arbitrum" | "solana"
  networkEnv?: "testnet" | "mainnet"
  skipInstall?: boolean
  skipGit?: boolean
}

export interface TemplateConfig {
  projectType: string
  framework?: string
  backend?: string
  dataLayer: string
  orm?: string
  example?: string
  network?: string
  networkEnv?: string
}

export interface ProjectVariables {
  projectName: string
  projectType: string
  framework?: string
  backend?: string
  dataLayer: string
  orm?: string
  networkDisplayName?: string
  rpcUrl?: string
  [key: string]: string | undefined
}

export const PROJECT_TYPES = ["frontend", "backend"] as const
export const FRAMEWORKS = ["nextjs", "vite"] as const
export const BACKENDS = ["fastify", "express"] as const
export const DATA_LAYERS = ["arrow-flight", "amp-sync"] as const
export const ORMS = ["electric", "drizzle"] as const
export const EXAMPLES = ["wallet", "blank"] as const
export const LOCAL_SETUPS = ["anvil", "public", "both"] as const
export const NETWORKS = ["arbitrum", "solana"] as const
export const NETWORK_ENVS = ["testnet", "mainnet"] as const