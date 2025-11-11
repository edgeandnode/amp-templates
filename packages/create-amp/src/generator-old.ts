import * as fs from "fs/promises"
import * as path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { CliOptions, ProjectVariables } from "./types.js"
import {
  TEMPLATES_ROOT,
  copyDirectory,
  copyTemplateFile,
  directoryExists,
  fileExists,
  isDirectoryEmpty,
  getNetworkConfig,
  validateProjectName,
  processAdditions,
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

    // Validate template paths exist
    const templatePaths = this.getTemplatePaths()
    for (const templatePath of templatePaths) {
      if (!(await directoryExists(templatePath))) {
        throw new Error(`Template not found: ${templatePath}`)
      }
    }
  }

  /**
   * Get the paths for all templates that need to be copied
   */
  private getTemplatePaths(): string[] {
    const paths = []
    
    if (this.options.projectType === "frontend") {
      // Frontend templates
      if (this.options.framework === "nextjs") {
        paths.push(path.join(TEMPLATES_ROOT, "nextjs"))
      } else {
        paths.push(path.join(TEMPLATES_ROOT, "vite-react", "base"))
      }
      
      // Data layer specific templates for frontend
      if (this.options.dataLayer === "amp-sync") {
        if (this.options.framework === "vite") {
          paths.push(path.join(TEMPLATES_ROOT, "vite-react", "ampsync-electricsql"))
        }
        paths.push(path.join(TEMPLATES_ROOT, "data-layer", "amp-sync"))
      } else {
        if (this.options.framework === "vite") {
          paths.push(path.join(TEMPLATES_ROOT, "vite-react", "flight-atom"))
        }
        paths.push(path.join(TEMPLATES_ROOT, "data-layer", "arrow-flight"))
      }
    } else {
      // Backend templates
      paths.push(path.join(TEMPLATES_ROOT, "backend", "base"))
      paths.push(path.join(TEMPLATES_ROOT, "backend", this.options.backend!))
    }
    
    return paths
  }

  /**
   * Generate the project
   */
  async generate(): Promise<void> {
    console.log(`Creating ${this.options.projectName}...`)
    
    await this.validate()
    await fs.mkdir(this.targetDir, { recursive: true })
    
    if (this.options.projectType === "frontend") {
      // Copy frontend templates
      await this.copyFrontendTemplates()
    } else {
      // Copy backend templates
      await this.copyBackendTemplates()
    }
    
    // Process package.json additions
    await this.processPackageJsonAdditions()
    
    // Process other file additions
    await this.processFileAdditions()
    
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
   * Copy frontend templates
   */
  private async copyFrontendTemplates(): Promise<void> {
    // Copy base frontend template
    const templatePath = this.options.framework === "nextjs" 
      ? path.join(TEMPLATES_ROOT, "nextjs")
      : path.join(TEMPLATES_ROOT, "vite-react", "base")
    
    await copyDirectory(templatePath, this.targetDir, this.variables)
    
    // Copy framework-specific data layer files
    if (this.options.framework === "vite") {
      const frameworkDataPath = this.options.dataLayer === "amp-sync"
        ? path.join(TEMPLATES_ROOT, "vite-react", "ampsync-electricsql")
        : path.join(TEMPLATES_ROOT, "vite-react", "flight-atom")
      
      await copyDirectory(frameworkDataPath, this.targetDir, this.variables)
    }
    
    // Copy general data layer files
    const dataLayerPath = path.join(TEMPLATES_ROOT, "data-layer", this.options.dataLayer)
    await copyDirectory(dataLayerPath, this.targetDir, this.variables)
  }

  /**
   * Copy backend templates
   */
  private async copyBackendTemplates(): Promise<void> {
    // Copy base backend template
    const baseBackendPath = path.join(TEMPLATES_ROOT, "backend", "base")
    await copyDirectory(baseBackendPath, this.targetDir, this.variables)
    
    // Copy backend-specific template
    const backendPath = path.join(TEMPLATES_ROOT, "backend", this.options.backend!)
    await copyDirectory(backendPath, this.targetDir, this.variables)
  }

  /**
   * Process package.json additions
   */
  private async processPackageJsonAdditions(): Promise<void> {
    const packageJsonPath = path.join(this.targetDir, "package.json")
    
    // Check for package.json.additions
    const additionsPath = path.join(this.targetDir, "package.json.additions")
    if (await fileExists(additionsPath)) {
      // Process additions
      const additionsContent = await processAdditions(additionsPath, this.variables)
      const additions = JSON.parse(additionsContent)
      
      // Merge with existing package.json
      const packageContent = await fs.readFile(packageJsonPath, "utf-8")
      const packageJson = JSON.parse(packageContent)
      
      // Deep merge objects
      const mergedPackage = this.deepMerge(packageJson, additions)
      
      await fs.writeFile(packageJsonPath, JSON.stringify(mergedPackage, null, 2))
      
      // Remove additions file
      await fs.unlink(additionsPath)
    }
  }

  /**
   * Process other file additions (like vite.config.ts.additions)
   */
  private async processFileAdditions(): Promise<void> {
    const files = await fs.readdir(this.targetDir)
    
    for (const file of files) {
      if (file.endsWith(".additions")) {
        const additionsPath = path.join(this.targetDir, file)
        const targetFileName = file.replace(".additions", "")
        const targetPath = path.join(this.targetDir, targetFileName)
        
        const additionsContent = await processAdditions(additionsPath, this.variables)
        
        // If target file exists, append; otherwise create
        if (await fileExists(targetPath)) {
          const existingContent = await fs.readFile(targetPath, "utf-8")
          await fs.writeFile(targetPath, existingContent + "\n" + additionsContent)
        } else {
          await fs.writeFile(targetPath, additionsContent)
        }
        
        // Remove additions file
        await fs.unlink(additionsPath)
      }
    }
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        this.deepMerge(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        target[key] = [...(target[key] || []), ...source[key]]
      } else {
        target[key] = source[key]
      }
    }
    return target
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
  pnpm dev

Your ${projectType} will be available at: http://localhost:${port}

Happy coding! 🚀
`)
  }
}