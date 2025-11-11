import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import { ProjectVariables } from "./types.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const TEMPLATES_ROOT = path.resolve(__dirname, "../../../templates")

/**
 * Replace template variables in a string
 */
export function replaceVariables(content: string, variables: ProjectVariables): string {
  let result = content
  
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, "g")
      result = result.replace(regex, value)
    }
  }
  
  return result
}

/**
 * Copy a file and replace template variables
 */
export async function copyTemplateFile(
  sourcePath: string,
  targetPath: string,
  variables: ProjectVariables,
): Promise<void> {
  try {
    const content = await fs.readFile(sourcePath, "utf-8")
    const processedContent = replaceVariables(content, variables)
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    
    await fs.writeFile(targetPath, processedContent, "utf-8")
  } catch (error) {
    console.error(`Error copying ${sourcePath} to ${targetPath}:`, error)
    throw error
  }
}

/**
 * Copy an entire directory recursively, processing templates
 */
export async function copyDirectory(
  sourceDir: string,
  targetDir: string,
  variables: ProjectVariables,
): Promise<void> {
  try {
    await fs.mkdir(targetDir, { recursive: true })
    
    const items = await fs.readdir(sourceDir)
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item)
      const targetPath = path.join(targetDir, item)
      
      const stat = await fs.stat(sourcePath)
      
      if (stat.isDirectory()) {
        await copyDirectory(sourcePath, targetPath, variables)
      } else if (stat.isFile()) {
        await copyTemplateFile(sourcePath, targetPath, variables)
      }
    }
  } catch (error) {
    console.error(`Error copying directory ${sourceDir} to ${targetDir}:`, error)
    throw error
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

/**
 * Check if a directory is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath)
    return files.length === 0
  } catch {
    return true
  }
}

/**
 * Get the network configuration
 */
export function getNetworkConfig(network: string, networkEnv: string) {
  const networks = {
    arbitrum: {
      testnet: {
        displayName: "Arbitrum Sepolia",
        rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
      },
      mainnet: {
        displayName: "Arbitrum One",
        rpcUrl: "https://arb1.arbitrum.io/rpc",
      },
    },
    solana: {
      testnet: {
        displayName: "Solana Devnet",
        rpcUrl: "https://api.devnet.solana.com",
      },
      mainnet: {
        displayName: "Solana Mainnet",
        rpcUrl: "https://api.mainnet-beta.solana.com",
      },
    },
  }
  
  return networks[network as keyof typeof networks]?.[networkEnv as keyof typeof networks.arbitrum] || {
    displayName: "Local Network",
    rpcUrl: "http://localhost:8545",
  }
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): string | null {
  if (!name) {
    return "Project name is required"
  }
  
  if (!/^[a-z0-9-]+$/i.test(name)) {
    return "Project name can only contain letters, numbers, and hyphens"
  }
  
  if (name.length < 1 || name.length > 50) {
    return "Project name must be between 1 and 50 characters"
  }
  
  return null
}

/**
 * Process template additions (for .additions files)
 */
export async function processAdditions(
  filePath: string,
  variables: ProjectVariables,
): Promise<string> {
  const content = await fs.readFile(filePath, "utf-8")
  const dataLayer = variables.dataLayer
  const orm = variables.orm
  
  // Remove addition markers that don't match our configuration
  const lines = content.split('\n')
  const filteredLines: string[] = []
  let skipUntilEmpty = false
  
  for (const line of lines) {
    // Check for addition markers
    const additionMatch = line.match(/\/\/ \[Additions\]\(([^)]+)\):/)
    
    if (additionMatch) {
      const condition = additionMatch[1]
      
      // Check if this addition applies to our configuration
      if (condition === dataLayer || condition === orm || condition === `${dataLayer}-${orm}`) {
        skipUntilEmpty = false
        continue // Skip the marker line itself
      } else {
        skipUntilEmpty = true
        continue
      }
    }
    
    // If we're skipping and hit an empty line, stop skipping
    if (skipUntilEmpty && line.trim() === '') {
      skipUntilEmpty = false
      continue
    }
    
    // Only include lines if we're not skipping
    if (!skipUntilEmpty) {
      filteredLines.push(line)
    }
  }
  
  return replaceVariables(filteredLines.join('\n'), variables)
}