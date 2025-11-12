import * as Command from "@effect/cli/Command"

import * as pkg from "../package.json" with { type: "json" }

const command = Command.make("create-amp")

export const run = Command.run(command, {
  name: "create-amp",
  version: `v${pkg.version}`
})
