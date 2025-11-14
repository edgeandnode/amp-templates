import * as path from "node:path"

import * as FileSystem from "@effect/platform/FileSystem"
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import { Effect, pipe } from "effect"

const read = pipe(
  FileSystem.FileSystem,
  Effect.flatMap((fileSystem) => fileSystem.readFileString("package.json")),
  Effect.map((_) => JSON.parse(_)),
  Effect.map((json) => ({
    name: json.name,
    version: json.version,
    description: json.description,
    bin: {
      "create-amp": "bin.mjs"
    },
    type: json.type,
    engines: json.engines,
    repository: json.repository,
    license: json.license,
    bugs: json.bugs,
    homepage: json.homepage,
    tags: json.tags,
    keywords: json.keywords,
    dependencies: json.dependencies
  }))
)

const pathTo = path.join("dist", "package.json")

const write = (pkg: object) =>
  FileSystem.FileSystem.pipe(
    Effect.flatMap((fileSystem) => fileSystem.writeFileString(pathTo, JSON.stringify(pkg, null, 2)))
  )

const copyFiles = FileSystem.FileSystem.pipe(
  Effect.flatMap((fileSystem) =>
    Effect.all([
      fileSystem.readFileString("README.md").pipe(
        Effect.flatMap((content) => fileSystem.writeFileString(path.join("dist", "README.md"), content)),
        Effect.tap(() => Effect.log("Copied README.md to dist/"))
      ),
      fileSystem.readFileString("CHANGELOG.md").pipe(
        Effect.flatMap((content) => fileSystem.writeFileString(path.join("dist", "CHANGELOG.md"), content)),
        Effect.tap(() => Effect.log("Copied CHANGELOG.md to dist/"))
      ),
      fileSystem.readFileString("llms.txt").pipe(
        Effect.flatMap((content) => fileSystem.writeFileString(path.join("dist", "llms.txt"), content)),
        Effect.tap(() => Effect.log("Copied llms.txt to dist/"))
      ),
      fileSystem.readFileString("../../LICENSE").pipe(
        Effect.flatMap((content) => fileSystem.writeFileString(path.join("dist", "LICENSE"), content)),
        Effect.tap(() => Effect.log("Copied LICENSE to dist/"))
      )
    ])
  )
)

const program = pipe(
  Effect.log(`Copying package.json to ${pathTo}...`),
  Effect.zipRight(read),
  Effect.flatMap(write),
  Effect.zipRight(copyFiles),
  Effect.provide(NodeFileSystem.layer)
)

Effect.runPromise(program)
