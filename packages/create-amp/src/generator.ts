import * as fs from "fs/promises"
import * as path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { CliOptions, ProjectVariables } from "./types.js"
import {
  TEMPLATES_ROOT,
  directoryExists,
  isDirectoryEmpty,
  getNetworkConfig,
  validateProjectName,
  replaceVariables,
} from "./utils.js"

const execAsync = promisify(exec)

export class ProjectGenerator {
  private options: CliOptions
  private variables: ProjectVariables
  private targetDir: string

  constructor(options: CliOptions) {
    this.options = options
    this.targetDir = path.resolve(process.cwd(), options.projectName)
    
    const networkConfig = getNetworkConfig(
      options.network || "arbitrum",
      options.networkEnv || "testnet"
    )
    
    this.variables = {
      projectName: options.projectName,
      projectType: options.projectType,
      framework: options.framework,
      backend: options.backend,
      dataLayer: options.dataLayer,
      orm: options.orm,
      networkDisplayName: networkConfig.displayName,
      rpcUrl: networkConfig.rpcUrl,
    }
  }

  /**
   * Validate the project setup
   */
  async validate(): Promise<void> {
    const nameError = validateProjectName(this.options.projectName)
    if (nameError) {
      throw new Error(nameError)
    }

    const exists = await directoryExists(this.targetDir)
    if (exists) {
      const isEmpty = await isDirectoryEmpty(this.targetDir)
      if (!isEmpty) {
        throw new Error(`Directory ${this.options.projectName} already exists and is not empty`)
      }
    }

    // Validate template path exists
    const templatePath = this.getTemplatePath()
    if (!(await directoryExists(templatePath))) {
      throw new Error(`Template not found: ${templatePath}`)
    }
  }

  /**
   * Get the single template path for the complete template
   */
  private getTemplatePath(): string {
    if (this.options.projectType === "frontend") {
      if (this.options.framework === "nextjs") {
        return path.join(TEMPLATES_ROOT, "nextjs")
      } else {
        // Vite React templates
        if (this.options.dataLayer === "amp-sync") {
          return path.join(TEMPLATES_ROOT, "vite-react", "amp-sync-electric")
        } else {
          return path.join(TEMPLATES_ROOT, "vite-react", "arrow-flight")
        }
      }
    } else {
      // Backend templates
      return path.join(TEMPLATES_ROOT, "backend", this.options.backend!)
    }
  }

  /**
   * Copy directory recursively with template variable replacement
   */
  private async copyDirectory(sourcePath: string, targetPath: string): Promise<void> {
    await fs.mkdir(targetPath, { recursive: true })
    
    const items = await fs.readdir(sourcePath)
    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item)
      const targetItemPath = path.join(targetPath, item)
      
      const stat = await fs.stat(sourceItemPath)
      
      if (stat.isDirectory()) {
        await this.copyDirectory(sourceItemPath, targetItemPath)
      } else {
        // Copy file and replace template variables
        const content = await fs.readFile(sourceItemPath, 'utf-8')
        const processedContent = replaceVariables(content, this.variables)
        await fs.writeFile(targetItemPath, processedContent)
      }
    }
  }

  /**
   * Generate the project
   */
  async generate(): Promise<void> {
    console.log(`Creating ${this.options.projectName}...`)
    
    await this.validate()
    
    const templatePath = this.getTemplatePath()
    console.log(`Using template: ${templatePath}`)
    
    // Copy the complete template
    await this.copyDirectory(templatePath, this.targetDir)
    
    // Initialize git repository
    if (!this.options.skipGit) {
      await this.initializeGit()
    }
    
    // Install dependencies
    if (!this.options.skipInstall) {
      await this.installDependencies()
    }
    
    this.printSuccess()
  }

  /**
   * Initialize git repository
   */
  private async initializeGit(): Promise<void> {
    try {
      await execAsync("git init", { cwd: this.targetDir })
      console.log("✅ Initialized git repository")
    } catch (error) {
      console.warn("⚠️  Could not initialize git repository")
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(): Promise<void> {
    try {
      console.log("📦 Installing dependencies...")
      await execAsync("pnpm install", { cwd: this.targetDir })
      console.log("✅ Dependencies installed")
    } catch (error) {
      console.warn("⚠️  Could not install dependencies. Run 'pnpm install' manually.")
    }
  }

  /**
   * Print success message
   */
  private printSuccess(): void {
    const projectType = this.options.projectType
    const port = this.options.projectType === "backend" 
      ? "3001" 
      : this.options.framework === "nextjs" 
        ? "3000" 
        : "5173"
    
    console.log(`
🎉 Successfully created ${this.options.projectName}!

Next steps:
  cd ${this.options.projectName}
  ${this.options.skipInstall ? 'pnpm install' : ''}
  
For development:
  just up      # Start infrastructure (Docker required)
  just dev     # Start development servers
  
Your ${projectType} will be available at: http://localhost:${port}

For more commands, see: just --list
Happy coding! 🚀
`)
  }
}