#!/usr/bin/env node

import * as clack from "@clack/prompts"
import { CliOptions, PROJECT_TYPES, FRAMEWORKS, BACKENDS, DATA_LAYERS, EXAMPLES } from "./types.js"
import { ProjectGenerator } from "./generator.js"
import { validateProjectName } from "./utils.js"

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): Partial<CliOptions> {
  const options: Partial<CliOptions> = {}
   
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]
    
    switch (arg) {
      case "--project-type":
        if (PROJECT_TYPES.includes(nextArg as any)) {
          options.projectType = nextArg as any
          i++
        }
        break
      case "--framework":
        if (FRAMEWORKS.includes(nextArg as any)) {
          options.framework = nextArg as any
          i++
        }
        break
      case "--backend":
        if (BACKENDS.includes(nextArg as any)) {
          options.backend = nextArg as any
          i++
        }
        break
      case "--data-layer":
        if (DATA_LAYERS.includes(nextArg as any)) {
          options.dataLayer = nextArg as any
          i++
        }
        break
      case "--example":
        if (EXAMPLES.includes(nextArg as any)) {
          options.example = nextArg as any
          i++
        }
        break
      case "--skip-install":
        options.skipInstall = true
        break
      case "--skip-git":
        options.skipGit = true
        break
      default:
        if (!arg.startsWith("--") && !options.projectName) {
          options.projectName = arg
        }
        break
    }
  }
  
  return options
}

/**
 * Run interactive prompts for missing options
 */
async function promptForOptions(initialOptions: Partial<CliOptions>): Promise<CliOptions> {
  clack.intro("🚀 Create Amp App")
  
  const options = { ...initialOptions }
  
  // Project name
  if (!options.projectName) {
    const projectName = await clack.text({
      message: "What is your project name?",
      placeholder: "my-amp-app",
      validate: validateProjectName,
    })
    
    if (clack.isCancel(projectName)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.projectName = projectName
  }
  
  // Project type
  if (!options.projectType) {
    const projectType = await clack.select({
      message: "What type of project would you like to create?",
      options: [
        { value: "frontend", label: "Frontend Application", hint: "React/Next.js app with Amp integration" },
        { value: "backend", label: "Backend Server", hint: "API server with Amp data layer" },
      ],
    })
    
    if (clack.isCancel(projectType)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.projectType = projectType as any
  }

  // Framework (only for frontend)
  if (options.projectType === "frontend" && !options.framework) {
    const framework = await clack.select({
      message: "Which frontend framework would you like to use?",
      options: [
        { value: "vite", label: "Vite + React", hint: "Fast development with HMR" },
        { value: "nextjs", label: "Next.js", hint: "Full-stack React framework" },
      ],
    })
    
    if (clack.isCancel(framework)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.framework = framework as any
  }

  // Backend (only for backend)
  if (options.projectType === "backend" && !options.backend) {
    const backend = await clack.select({
      message: "Which backend framework would you like to use?",
      options: [
        { value: "fastify", label: "Fastify", hint: "High-performance web server" },
        { value: "express", label: "Express", hint: "Popular, flexible Node.js framework" },
        { value: "apollo-graphql", label: "Apollo GraphQL", hint: "GraphQL API server for blockchain data" },
      ],
    })
    
    if (clack.isCancel(backend)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.backend = backend as any
  }
  
  // Data layer
  if (!options.dataLayer) {
    const dataLayer = await clack.select({
      message: "Which data layer would you like to use?",
      options: [
        { value: "arrow-flight", label: "Arrow Flight", hint: "Real-time data with Effect Atom" },
        { value: "amp-sync", label: "Amp Sync", hint: "Real-time sync with ElectricSQL" },
      ],
    })
    
    if (clack.isCancel(dataLayer)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.dataLayer = dataLayer as any
  }
  
  // ORM (only for amp-sync)
  if (options.dataLayer === "amp-sync" && !options.orm) {
    const orm = await clack.select({
      message: "Which ORM would you like to use with Amp Sync?",
      options: [
        { value: "electric", label: "ElectricSQL", hint: "Real-time sync with PostgreSQL" },
        { value: "drizzle", label: "Drizzle ORM", hint: "Type-safe database toolkit" },
      ],
    })
    
    if (clack.isCancel(orm)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.orm = orm as any
  }
  
  // Example template (only for frontend)
  if (options.projectType === "frontend" && !options.example) {
    const example = await clack.select({
      message: "What type of app would you like to create?",
      options: [
        { value: "wallet", label: "Wallet Portfolio", hint: "Complete dApp with wallet integration" },
        { value: "blank", label: "Blank Template", hint: "Minimal setup to start from scratch" },
      ],
    })
    
    if (clack.isCancel(example)) {
      clack.cancel("Operation cancelled.")
      process.exit(0)
    }
    
    options.example = example as any
  }
  
  // Additional options
  const additionalOptions = await clack.multiselect({
    message: "Select additional options:",
    options: [
      { value: "skip-install", label: "Skip dependency installation" },
      { value: "skip-git", label: "Skip git initialization" },
    ],
    required: false,
  })
  
  if (clack.isCancel(additionalOptions)) {
    clack.cancel("Operation cancelled.")
    process.exit(0)
  }
  
  options.skipInstall = additionalOptions.includes("skip-install")
  options.skipGit = additionalOptions.includes("skip-git")
  
  // Show summary
  const summary = [
    `Project: ${options.projectName}`,
    `Type: ${options.projectType}`,
    options.framework && `Framework: ${options.framework}`,
    options.backend && `Backend: ${options.backend}`,
    `Data Layer: ${options.dataLayer}`,
    options.orm && `ORM: ${options.orm}`,
    options.example && `Example: ${options.example}`,
  ].filter(Boolean).join("\n")
  
  clack.note(summary, "Configuration")
  
  const proceed = await clack.confirm({
    message: "Create project with these settings?",
  })
  
  if (clack.isCancel(proceed) || !proceed) {
    clack.cancel("Operation cancelled.")
    process.exit(0)
  }
  
  return options as CliOptions
}

/**
 * Main CLI function
 */
async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  try {
    const initialOptions = parseArgs(args)
    const options = await promptForOptions(initialOptions)
    
    const generator = new ProjectGenerator(options)
    await generator.generate()
    
    clack.outro("✨ Project created successfully!")
  } catch (error) {
    clack.log.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
