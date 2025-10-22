/**
 * Utility functions for the create-amp CLI
 */

import * as fs from "fs-extra"
import * as fsPromises from "node:fs/promises"
import path from "node:path"
import type { TemplateData } from "./types"

/**
 * Detect which package manager is being used
 */
export function detectPackageManager(): "pnpm" | "npm" | "yarn" | "bun" {
  const userAgent = process.env.npm_config_user_agent || ""

  if (userAgent.includes("pnpm")) return "pnpm"
  if (userAgent.includes("yarn")) return "yarn"
  if (userAgent.includes("bun")) return "bun"
  return "npm"
}

/**
 * Get the install command for the detected package manager
 */
export function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case "pnpm":
      return "pnpm install"
    case "yarn":
      return "yarn"
    case "bun":
      return "bun install"
    default:
      return "npm install"
  }
}

/**
 * Check if a directory exists and is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath)
    return files.length === 0
  } catch {
    return true // Directory doesn't exist
  }
}

/**
 * Validate project name
 */
export function isValidProjectName(name: string): boolean {
  return /^[a-z0-9-_]+$/.test(name)
}

/**
 * Process template string by replacing variables
 */
export function processTemplate(template: string, data: TemplateData): string {
  return template
    .replace(/\{\{\s*projectName\s*\}\}/g, data.name)
    .replace(/\{\{\s*packageManager\s*\}\}/g, data.packageManager)
    .replace(/\{\{\s*framework\s*\}\}/g, data.framework)
    .replace(/\{\{\s*dataLayer\s*\}\}/g, data.dataLayer)
    .replace(/\{\{\s*orm\s*\}\}/g, data.orm || "")
    .replace(/\{\{\s*networkDisplayName\s*\}\}/g, data.networkDisplayName)
    .replace(/\{\{\s*rpcUrl\s*\}\}/g, data.rpcUrl)
    .replace(/\{\{\s*chainId\s*\}\}/g, data.chainId)
}

/**
 * Copy template files with processing
 */
export async function copyTemplate(
  srcDir: string,
  destDir: string,
  data: TemplateData,
  filter?: (file: string) => boolean,
): Promise<void> {
  await copyDirRecursive(srcDir, destDir, data, filter)
}

/**
 * Recursively copy directory
 */
async function copyDirRecursive(
  srcDir: string,
  destDir: string,
  data: TemplateData,
  filter?: (file: string) => boolean,
): Promise<void> {
  const entries = await fsPromises.readdir(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath)
      await copyDirRecursive(srcPath, destPath, data, filter)
    } else if (entry.isFile()) {
      const relativePath = path.relative(path.dirname(srcDir), srcPath)

      // Apply filter if provided
      if (filter && !filter(relativePath)) continue

      // Read file content
      let content = await fsPromises.readFile(srcPath, "utf-8")

      // Process template variables
      content = processTemplate(content, data)

      // Write processed content
      await fsPromises.writeFile(destPath, content)
    }
  }
}

/**
 * Format success message
 */
export function formatSuccessMessage(projectName: string, projectPath: string): string {
  return `
✅ Project created successfully!

📁 Location: ${projectPath}

🚀 Next steps:
  1. cd ${projectName}
  2. docker-compose up -d        # Start infrastructure
  3. cd frontend && pnpm dev     # Start development server

📚 Documentation: https://github.com/edgeandnode/amp-private/tree/main/docs
`
}

/**
 * Create a .gitignore file
 */
export async function createGitignore(destPath: string): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
dist/
build/
out/

# Development
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Amp
amp/data/

# Foundry
contracts/cache/
contracts/out/
contracts/broadcast/
contracts/lib/

# PostgreSQL
*.sql.backup

# Drizzle
drizzle/
`

  await fsPromises.writeFile(path.join(destPath, ".gitignore"), gitignore)
}
