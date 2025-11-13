import * as HelpDoc from "@effect/cli/HelpDoc"
import * as ValidationError from "@effect/cli/ValidationError"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as NodeSink from "@effect/platform-node/NodeSink"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Tar from "tar"

import type * as Domain from "./Domain.ts"

const codeloadBaseUrl = "https://codeload.github.com"

export class GitHubService extends Effect.Service<GitHubService>()("CreateAmpCli/services/GitHubService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const codeloadClient = client.pipe(
      HttpClient.filterStatusOk,
      HttpClient.mapRequest(HttpClientRequest.prependUrl(codeloadBaseUrl))
    )

    const downloadTemplate = (projectName: string, config: Domain.AvailableTemplSchema) =>
      codeloadClient.get("/edgeandnode/amp-templates/tar.gz/main").pipe(
        HttpClientResponse.stream,
        Stream.run(
          NodeSink.fromWritable(
            () =>
              Tar.extract({
                cwd: projectName,
                strip: config.directory.split("/").length,
                filter: (path) => path.includes(`amp-templates-main${config.directory}`)
              }),
            (err) => {
              console.error("Failure downloading templ", err)
              return ValidationError.invalidValue(HelpDoc.p(`Failed to download template ${config.name}`))
            }
          )
        )
      )

    return { downloadTemplate } as const
  })
}) {}
export const layer = GitHubService.Default
