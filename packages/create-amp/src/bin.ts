#!/usr/bin/env node

import * as CliConfig from "@effect/cli/CliConfig"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

import { run } from "./Cli.ts"
import { layer } from "./GitHub.ts"

const CreateAmpLive = layer.pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Logger.minimumLogLevel(LogLevel.Info),
      CliConfig.layer({ showBuiltIns: false }),
      NodeContext.layer,
      NodeHttpClient.layerUndici,
      NodeFileSystem.layer,
      NodeContext.layer
    )
  )
)

run(process.argv).pipe(
  Effect.catchTags({
    QuitException: () => Effect.logError("Exiting...")
  }),
  Effect.catchAllDefect((defect) =>
    Effect.gen(function* () {
      if (defect && typeof defect === "object" && "name" in defect && defect.name === "QuitException") {
        return yield* Effect.logError("Exiting...")
      }
      return Effect.die(defect)
    })
  ),
  Effect.orDie,
  Effect.provide(CreateAmpLive),
  NodeRuntime.runMain({ disableErrorReporting: process.env.NODE_ENV === "prod", disablePrettyLogger: true })
)
