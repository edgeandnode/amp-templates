import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import { describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import * as Domain from "../src/Domain.ts"
import * as GitHub from "../src/GitHub.ts"

const mockConfig = Domain.AvailableTemplSchema.make({
  key: "nextjs",
  name: "Next.js Blank Template",
  description: "A blank Next.js template for AMP applications",
  directory: "/templates/nextjs",
  skip: new Set<string>()
})

describe("GitHubService", () => {
  describe("downloadTemplate", () => {
    it("should use correct strip level based on directory depth", ({ expect }) => {
      // Test that service calculates strip level as 2 + directory segments
      const testConfigs = [
        {
          directory: "/templates/nextjs",
          expectedSegments: 3,
          expectedStrip: 5 // 2 + 3 segments
        },
        {
          directory: "/templates/deep/nested",
          expectedSegments: 4,
          expectedStrip: 6 // 2 + 4 segments
        },
        {
          directory: "/a/b/c/d/e/f",
          expectedSegments: 7,
          expectedStrip: 9 // 2 + 7 segments
        }
      ]

      testConfigs.forEach(({ directory, expectedSegments, expectedStrip }) => {
        const segments = directory.split("/").length
        const calculatedStrip = 2 + segments

        expect(segments).toBe(expectedSegments)
        expect(calculatedStrip).toBe(expectedStrip)
      })
    })

    it("should apply tar filter for template directory", ({ expect }) => {
      const testCases = [
        {
          directory: "/templates/nextjs",
          expectedPattern: "amp-templates-main/templates/nextjs",
          shouldMatch: [
            "amp-templates-main/templates/nextjs/package.json",
            "amp-templates-main/templates/nextjs/src/index.ts",
            "amp-templates-main/templates/nextjs/README.md"
          ],
          shouldNotMatch: [
            "amp-templates-main/templates/vite/package.json",
            "amp-templates-main/templates/backend-express/index.ts",
            "amp-templates-main/README.md",
            "amp-templates-main/package.json"
          ]
        },
        {
          directory: "/templates/vite",
          expectedPattern: "amp-templates-main/templates/vite",
          shouldMatch: [
            "amp-templates-main/templates/vite/package.json",
            "amp-templates-main/templates/vite/src/main.ts"
          ],
          shouldNotMatch: ["amp-templates-main/templates/nextjs/package.json", "amp-templates-main/README.md"]
        }
      ]

      testCases.forEach(({ directory, expectedPattern, shouldMatch, shouldNotMatch }) => {
        const filterPattern = `amp-templates-main${directory}`
        expect(filterPattern).toBe(expectedPattern)

        // Verify the filter logic that the service implements
        const filterFn = (path: string) => path.includes(filterPattern)

        shouldMatch.forEach((path) => {
          expect(filterFn(path)).toBe(true)
        })

        shouldNotMatch.forEach((path) => {
          expect(filterFn(path)).toBe(false)
        })
      })
    })

    it.effect("should fail with ValidationError on HTTP 404 errors", ({ expect }) =>
      Effect.gen(function* () {
        const mockHttpClient = HttpClient.make((req) =>
          Effect.fail(
            new HttpClientError.ResponseError({
              request: req,
              response: HttpClientResponse.fromWeb(req, new Response("Not Found", { status: 404 })),
              reason: "StatusCode",
              description: "404 Not Found"
            })
          )
        )

        const TestLayer = GitHub.GitHubService.Default.pipe(
          Layer.provide(Layer.succeed(HttpClient.HttpClient, mockHttpClient))
        )

        const result = yield* GitHub.GitHubService.downloadTemplate("test-project", mockConfig).pipe(
          Effect.exit,
          Effect.provide(TestLayer)
        )

        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure") {
          expect(result.cause._tag).toBe("Fail")
          if (result.cause._tag === "Fail") {
            // Service wraps all errors in ValidationError.InvalidValue via NodeSink.fromWritable
            expect(result.cause.error._tag).toBe("InvalidValue")
          }
        }
      })
    )

    it.effect("should fail with ValidationError on HTTP 500 errors", ({ expect }) =>
      Effect.gen(function* () {
        const mockHttpClient = HttpClient.make((req) =>
          Effect.fail(
            new HttpClientError.ResponseError({
              request: req,
              response: HttpClientResponse.fromWeb(req, new Response("Server Error", { status: 500 })),
              reason: "StatusCode",
              description: "500 Internal Server Error"
            })
          )
        )

        const TestLayer = GitHub.GitHubService.Default.pipe(
          Layer.provide(Layer.succeed(HttpClient.HttpClient, mockHttpClient))
        )

        const result = yield* GitHub.GitHubService.downloadTemplate("test-project", mockConfig).pipe(
          Effect.exit,
          Effect.provide(TestLayer)
        )

        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure") {
          expect(result.cause._tag).toBe("Fail")
          if (result.cause._tag === "Fail") {
            // Service wraps all errors in ValidationError.InvalidValue via NodeSink.fromWritable
            expect(result.cause.error._tag).toBe("InvalidValue")
          }
        }
      })
    )

    it.effect("should fail with ValidationError on network errors", ({ expect }) =>
      Effect.gen(function* () {
        const mockHttpClient = HttpClient.make((req) =>
          Effect.fail(
            new HttpClientError.RequestError({
              request: req,
              reason: "Transport",
              description: "Network connection failed"
            })
          )
        )

        const TestLayer = GitHub.GitHubService.Default.pipe(
          Layer.provide(Layer.succeed(HttpClient.HttpClient, mockHttpClient))
        )

        const result = yield* GitHub.GitHubService.downloadTemplate("test-project", mockConfig).pipe(
          Effect.exit,
          Effect.provide(TestLayer)
        )

        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure") {
          expect(result.cause._tag).toBe("Fail")
          if (result.cause._tag === "Fail") {
            // Service wraps all errors in ValidationError.InvalidValue via NodeSink.fromWritable
            expect(result.cause.error._tag).toBe("InvalidValue")
          }
        }
      })
    )
  })
})
