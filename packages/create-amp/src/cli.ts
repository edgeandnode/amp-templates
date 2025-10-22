#!/usr/bin/env node

/**
 * CLI interface using @clack/prompts for interactive experience
 */

import * as p from "@clack/prompts"
import { Command } from "commander"
import path from "node:path"
import pc from "picocolors"
import type { DataLayer, Example, Framework, LocalSetup, Network, NetworkEnv, ORM, ProjectConfig } from "./types"
import { isValidProjectName } from "./utils"

interface CLIOptions {
  framework?: Framework
  dataLayer?: DataLayer
  orm?: ORM
  example?: Example
  localSetup?: LocalSetup
  network?: Network
  networkEnv?: NetworkEnv
  skipInstall?: boolean
  skipGit?: boolean
}

/**
 * Parse CLI arguments and run interactive prompts
 */
export async function runCLI(): Promise<ProjectConfig> {
  console.clear()

  p.intro(pc.bgCyan(pc.black(" create-amp ")))

  const program = new Command()
    .name("create-amp")
    .description("CLI to scaffold Amp-powered web applications")
    .argument("[project-name]", "Name of the project")
    .option("--framework <type>", "Framework to use (nextjs|vite)")
    .option("--data-layer <type>", "Data layer to use (arrow-flight|amp-sync)")
    .option("--orm <type>", "ORM to use with amp-sync (electric|drizzle)")
    .option("--example <type>", "Example to scaffold (wallet|blank)")
    .option("--local-setup <type>", "Local setup (anvil|public|both)")
    .option("--network <type>", "Blockchain network (arbitrum|solana)")
    .option("--network-env <type>", "Network environment (testnet|mainnet)")
    .option("--skip-install", "Skip package installation")
    .option("--skip-git", "Skip git initialization")
    .parse()

  const [projectNameArg] = program.args
  const options = program.opts<CLIOptions>()

  // Prompt for project name if not provided
  let projectName = projectNameArg
  if (!projectName) {
    const result = await p.text({
      message: "What is your project named?",
      placeholder: "my-amp-app",
      validate: (value) => {
        if (!value) return "Please enter a project name"
        if (!isValidProjectName(value)) {
          return "Project name can only contain lowercase letters, numbers, hyphens, and underscores"
        }
      },
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    projectName = result as string
  }

  // Validate project name
  if (!isValidProjectName(projectName)) {
    p.log.error("Invalid project name. Use only lowercase letters, numbers, hyphens, and underscores.")
    process.exit(1)
  }

  // Prompt for framework if not provided
  let framework = options.framework
  if (!framework) {
    const result = await p.select({
      message: "Which framework would you like to use?",
      options: [
        { value: "nextjs", label: "Next.js", hint: "React framework with SSR" },
        { value: "vite", label: "React (Vite)", hint: "Fast development with HMR" },
      ],
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    framework = result as Framework
  }

  // Prompt for data layer if not provided
  let dataLayer = options.dataLayer
  if (!dataLayer) {
    const result = await p.select({
      message: "Which data layer would you like to use?",
      options: [
        { value: "arrow-flight", label: "Arrow Flight", hint: "High-performance binary protocol" },
        { value: "amp-sync", label: "Amp Sync", hint: "PostgreSQL synchronization" },
      ],
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    dataLayer = result as DataLayer
  }

  // Prompt for ORM if using amp-sync and not provided
  let orm = options.orm
  if (dataLayer === "amp-sync" && !orm) {
    const result = await p.select({
      message: "Which ORM/database layer would you like to use?",
      options: [
        { value: "electric", label: "ElectricSQL", hint: "Real-time sync with offline support" },
        { value: "drizzle", label: "Drizzle", hint: "Type-safe SQL query builder" },
      ],
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    orm = result as ORM
  }

  // Prompt for example if not provided
  let example = options.example
  if (!example) {
    const result = await p.select({
      message: "Which example would you like to start with?",
      options: [
        { value: "wallet", label: "ERC20 Wallet App", hint: "Token wallet with transfers" },
        { value: "blank", label: "Blank Template", hint: "Start from scratch" },
      ],
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    example = result as Example
  }

  // Prompt for local setup if not provided
  let localSetup = options.localSetup
  if (!localSetup) {
    const result = await p.select({
      message: "What local development setup would you like?",
      options: [
        { value: "anvil", label: "Anvil + Amp", hint: "Local blockchain + Amp server" },
        { value: "public", label: "Public Dataset", hint: "Connect to public Amp datasets" },
        { value: "both", label: "Both", hint: "Local dev with public fallback" },
      ],
    })

    if (p.isCancel(result)) {
      p.cancel("Operation cancelled")
      process.exit(0)
    }

    localSetup = result as LocalSetup
  }

  // Prompt for network if using public datasets
  let network = options.network
  let networkEnv = options.networkEnv

  if (localSetup === "public" || localSetup === "both") {
    if (!network) {
      const result = await p.select({
        message: "Which blockchain network would you like to use?",
        options: [
          { value: "arbitrum", label: "Arbitrum", hint: "Ethereum L2 with low fees" },
          { value: "solana", label: "Solana", hint: "High-performance blockchain" },
        ],
      })

      if (p.isCancel(result)) {
        p.cancel("Operation cancelled")
        process.exit(0)
      }

      network = result as Network
    }

    if (!networkEnv) {
      const result = await p.select({
        message: "Which network environment?",
        options: [
          { value: "testnet", label: "Testnet", hint: "For testing and development" },
          { value: "mainnet", label: "Mainnet", hint: "Production network" },
        ],
      })

      if (p.isCancel(result)) {
        p.cancel("Operation cancelled")
        process.exit(0)
      }

      networkEnv = result as NetworkEnv
    }
  }

  const projectPath = path.resolve(process.cwd(), projectName)

  return {
    name: projectName,
    path: projectPath,
    framework,
    dataLayer,
    orm,
    example,
    localSetup,
    network,
    networkEnv,
    skipInstall: options.skipInstall || false,
    skipGit: options.skipGit || false,
  }
}
