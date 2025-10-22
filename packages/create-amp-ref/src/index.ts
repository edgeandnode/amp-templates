#!/usr/bin/env node

/**
 * create-amp - CLI tool to scaffold Amp-powered web applications
 */

import * as p from "@clack/prompts"
import pc from "picocolors"
import { runCLI } from "./cli"
import { generateProject } from "./generator"
import { formatSuccessMessage } from "./utils"

async function main(): Promise<void> {
  try {
    // Run CLI prompts and get configuration
    const config = await runCLI()

    // Generate project
    await generateProject(config)

    // Show success message
    p.outro(pc.green(formatSuccessMessage(config.name, config.path)))
  } catch (error) {
    if (error instanceof Error) {
      p.log.error(error.message)
    } else {
      p.log.error("An unexpected error occurred")
    }
    process.exit(1)
  }
}

main()
