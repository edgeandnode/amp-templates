import * as child_process from "node:child_process"

import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Options from "@effect/cli/Options"
import * as Prompt from "@effect/cli/Prompt"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import * as Array from "effect/Array"
import * as Cause from "effect/Cause"
import * as Console from "effect/Console"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Fn from "effect/Function"
import * as Option from "effect/Option"

import * as pkg from "../package.json" with { type: "json" }

import * as Constants from "./Constants.ts"
import type * as Domain from "./Domain.ts"
import * as GitHub from "./GitHub.ts"
import * as Templates from "./internal/Templates.ts"
import * as Utils from "./Utils.ts"

const TemplateType = ["build", "existing"] as const
type TemplateType = (typeof TemplateType)[number]

// =============================================================================
// CLI Args/Options
// =============================================================================

const appName = Args.directory({ name: "app-name", exists: "no" }).pipe(
  Args.withDescription("Your app name. Will also be the directory where the Amp code is scaffolded into"),
  Args.mapEffect((inputPath) =>
    Effect.gen(function* () {
      // Extract just the basename to validate the project name format
      const path = yield* Path.Path
      const basename = path.basename(inputPath)
      yield* Utils.validateProjectName(basename)
      // Return the input path as-is (will be resolved later in resolveAppName)
      return inputPath
    })
  ),
  Args.optional
)

const template = Options.choice(
  "template",
  Object.keys(Templates.AVAILABLE_TEMPLATES) as ReadonlyArray<Domain.AvailableTemplFrameworkKey>
).pipe(Options.withDescription("Which Amp template to scaffold"), Options.optional)

const packageManager = Options.choice("package-manager", Constants.PackageManager).pipe(
  Options.withAlias("p"),
  Options.withDescription("The package manager to use to install deps (if selected)"),
  Options.optional
)

const skipInstallDeps = Options.boolean("skip-install-deps").pipe(
  Options.withDescription("If flag is provided, the deps will not be installed with the given package manager"),
  Options.withDefault(false)
)

const skipInitializeGit = Options.boolean("skip-initialize-git").pipe(
  Options.withDescription("If flag is provided, git will not be initialized in the scaffolded app"),
  Options.withDefault(false)
)

interface RawConfig {
  readonly appName: Option.Option<string>
  readonly template: Option.Option<Domain.AvailableTemplFrameworkKey>
  readonly packageManager: Option.Option<Constants.PackageManager>
  readonly skipInstallDeps: boolean
  readonly skipInitializeGit: boolean
}
interface ResolvedConfig {
  readonly appName: string
  readonly template: Domain.AvailableTemplFrameworkKey
  readonly packageManager: Constants.PackageManager
  readonly skipInstallDeps: boolean
  readonly skipInitializeGit: boolean
}

// =============================================================================
// Command setup
// =============================================================================

const command = Command.make("create-amp", {
  appName,
  template,
  packageManager,
  skipInstallDeps,
  skipInitializeGit
}).pipe(
  Command.withDescription("Command line interface to scaffold an Amp-enabled application from a template"),
  Command.withHandler(handleCreateAmpCommand)
)

export const run = Command.run(command, {
  name: "create-amp",
  version: `v${pkg.version}`
})

// =============================================================================
// Create Amp Command Handler
// =============================================================================

function handleCreateAmpCommand(config: Readonly<RawConfig>) {
  return Effect.all({
    appName: resolveAppName(config),
    template: resolveTemplate(config),
    packageManager: resolvePackageManager(config),
    skipInstallDeps: Effect.succeed(config.skipInstallDeps),
    skipInitializeGit: Effect.succeed(config.skipInitializeGit)
  }).pipe(Effect.flatMap(scaffoldAmpApp))
}

const scaffoldAmpApp = Effect.fn("ScaffoldAmpApp")(function* (config: Readonly<ResolvedConfig>) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const appname = path.basename(config.appName)
  const template = Templates.AVAILABLE_TEMPLATES[config.template]

  yield* Console.info(`Scaffolding Amp app: "${appname}", with template: "${template.name}"`, config.appName)

  // create the target directory
  yield* fs.makeDirectory(config.appName, { recursive: true })

  const updatePackageJson = Effect.fn("UpdateDownloadedPackageJson")(function* () {
    const packageJsonPath = path.join(config.appName, "package.json")
    const packageJson = yield* fs.readFileString(packageJsonPath).pipe(Effect.map((json) => JSON.parse(json)))
    const validatedPackageName = Utils.validatePackageName(appname)
    const name = validatedPackageName.normalizedName
    // update the name and description
    packageJson.name = name

    // rewrite file
    yield* fs.writeFileString(packageJsonPath, JSON.stringify(packageJson, null, 2))
  })

  const installDepsInScaffoldedApp = Effect.async<void, InstallDepsError>((resume) => {
    try {
      child_process.execSync(`${config.packageManager} install`, {
        stdio: "inherit",
        cwd: config.appName
      })
      return resume(Effect.void)
    } catch (err) {
      return resume(Effect.fail(new InstallDepsError({ cause: err })))
    }
  })

  const initializeGit = Effect.fn("InitializeGitInScaffoldedApp")(function* () {
    yield* Effect.try({
      try: () => {
        child_process.execSync("git init -q", {
          stdio: "inherit",
          cwd: config.appName
        })
      },
      catch: (err) => new InitializeGitRepoError({ cause: err })
    })

    yield* Effect.try({
      try: () => {
        child_process.execSync("git add .", {
          stdio: "inherit",
          cwd: config.appName
        })
      },
      catch: (err) => new InitializeGitRepoError({ cause: err })
    })

    yield* Effect.try({
      try: () => {
        child_process.execSync('git commit -q -m "Initial commit - Scaffold Amp app"', {
          stdio: "inherit",
          cwd: config.appName
        })
      },
      catch: (err) => new InitializeGitRepoError({ cause: err })
    })
  })

  // Download the example project from GitHub
  // apply the package.json transformations
  // install the deps (maybe)
  // initialize git (maybe)
  yield* GitHub.GitHubService.downloadTemplate(config.appName, template).pipe(
    Effect.tapErrorCause((cause) =>
      Console.error("Failure downloading the template from git to scaffold", Cause.pretty(cause))
    ),
    Effect.andThen(() => updatePackageJson()),
    // Initialize the git repo if user selected to
    Effect.andThen(() => Effect.when(initializeGit(), () => !config.skipInitializeGit)),
    Effect.tapErrorCause((cause) => Effect.logError("Failure initializing the git repository", Cause.pretty(cause))),
    // Install the deps with the selected package manager if user selected to
    Effect.andThen(() => Effect.when(installDepsInScaffoldedApp, () => !config.skipInstallDeps)),
    Effect.tapErrorCause((cause) =>
      Effect.logError(`Failure installing deps with ${config.packageManager}`, Cause.pretty(cause))
    ),
    // success! inform the user
    Effect.andThen(() =>
      Effect.gen(function* () {
        yield* Console.info(`🎉 Successfully scaffolded your Amp enabled app ${appname}!\r\n`)
        yield* Console.info("To start the app, run:\r\n")
        yield* Console.info(`    cd: ${config.appName}`)
        if (config.skipInstallDeps) {
          yield* Console.info(`    ${config.packageManager} install`)
        }
        yield* Console.info(`    ${config.packageManager} run dev`)
      })
    )
  )
})

// =============================================================================
// Command choice resolution
// =============================================================================

/**
 * Resolves the app name from either: the passed in arg to the command, _or_ by prompting the user
 */
function resolveAppName(config: Readonly<RawConfig>) {
  return Option.match(config.appName, {
    onSome: (name) => Utils.expandAndResolvePath(name),
    onNone: () =>
      Prompt.text({
        message: "What would you like your app to be named?",
        default: "my-amp-app",
        validate(value) {
          return Utils.validateProjectName(value).pipe(Effect.mapError((doc) => HelpDoc.toAnsiText(doc)))
        }
      }).pipe(Effect.flatMap((name) => Utils.expandAndResolvePath(name)))
  })
}

/**
 * Resolved the template from:
 * - the passed in --template option
 * - prompting the user through options based on the types
 */
function resolveTemplate(config: Readonly<RawConfig>) {
  return Option.match(config.template, {
    onSome: Effect.succeed,
    onNone: () => Prompt.run(getUserTemplateInput)
  })
}
const getUserTemplateInput = Prompt.select<TemplateType>({
  message: "Would you like to build your own Dataset? Or use an existing Dataset?",
  choices: [
    {
      title: "Build my own Amp Dataset",
      value: "build",
      description:
        "Scaffolds out the necessary docker-compose to run ampd locally, with anvil allowing you to build a Dataset from your own smart contracts"
    },
    {
      title: "Use an existing Amp Dataset",
      value: "existing",
      description:
        "Use this if there is already an Amp Dataset you want to query, or if you want a simplified experience to try out Amp"
    }
  ]
}).pipe(
  Prompt.flatMap((type): Prompt.Prompt<Domain.AvailableTemplFrameworkKey> => {
    switch (type) {
      case "build": {
        return Prompt.select<Domain.AvailableTemplFrameworkKey>({
          message: "What template would you like to use for building an app around your own Amp Dataset?",
          choices: Fn.pipe(
            Object.values(Templates.AVAILABLE_TEMPLATES),
            Array.filter((tmpl) => tmpl.type === "build-dataset"),
            Array.map((tmpl) => ({
              title: tmpl.name,
              description: tmpl.description,
              value: tmpl.key
            }))
          )
        })
      }
      case "existing": {
        return Prompt.select<Domain.AvailableTemplFrameworkKey>({
          message: "What template would you like to use for building an app around your own Amp Dataset?",
          choices: Fn.pipe(
            Object.values(Templates.AVAILABLE_TEMPLATES),
            Array.filter((tmpl) => tmpl.type === "existing-dataset"),
            Array.map((tmpl) => ({
              title: tmpl.name,
              description: tmpl.description,
              value: tmpl.key
            }))
          )
        })
      }
    }
  })
)

/**
 * Resolves the package manager from either: the passed in --package-manager option to the command, _or_ by prompting the user
 */
function resolvePackageManager(config: Readonly<RawConfig>) {
  return Option.match(config.packageManager, {
    onSome: Effect.succeed,
    onNone: () =>
      Prompt.select<Constants.PackageManager>({
        message: "What package manager do you want to use?",
        choices: [
          { title: "pnpm", value: "pnpm" },
          { title: "bun", value: "bun" },
          { title: "yarn", value: "yarn" },
          { title: "npm", value: "npm" }
        ]
      }).pipe(Effect.map((selected) => selected))
  })
}

// =============================================================================
// Error Models
// =============================================================================

class InitializeGitRepoError extends Data.TaggedError("InitializeGitRepoError")<{
  readonly cause: unknown
}> {}
class InstallDepsError extends Data.TaggedError("InstallDepsError")<{
  readonly cause: unknown
}> {}
