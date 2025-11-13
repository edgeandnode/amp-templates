import * as os from "node:os"

import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Path from "@effect/platform/Path"
import { describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import * as Utils from "../src/Utils.ts"

describe("Utils", () => {
  describe("expandAndResolvePath", () => {
    it.effect("should expand tilde to home directory", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.expandAndResolvePath("~/dev/my-project")
        const homeDir = os.homedir()
        expect(result).toBe(`${homeDir}/dev/my-project`)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should expand lone tilde to home directory", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.expandAndResolvePath("~")
        const homeDir = os.homedir()
        expect(result).toBe(homeDir)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should normalize absolute Unix paths", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.expandAndResolvePath("/home/user/projects/my-app")
        expect(result).toBe("/home/user/projects/my-app")
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should resolve relative paths to current working directory", ({ expect }) =>
      Effect.gen(function* () {
        const path = yield* Path.Path
        const cwd = process.cwd()
        const result = yield* Utils.expandAndResolvePath("my-project")
        const expected = path.resolve(cwd, "my-project")
        expect(result).toBe(expected)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should resolve relative paths with subdirectories", ({ expect }) =>
      Effect.gen(function* () {
        const path = yield* Path.Path
        const cwd = process.cwd()
        const result = yield* Utils.expandAndResolvePath("subdir/my-project")
        const expected = path.resolve(cwd, "subdir/my-project")
        expect(result).toBe(expected)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should handle paths with ./ prefix", ({ expect }) =>
      Effect.gen(function* () {
        const path = yield* Path.Path
        const cwd = process.cwd()
        const result = yield* Utils.expandAndResolvePath("./my-project")
        const expected = path.resolve(cwd, "./my-project")
        expect(result).toBe(expected)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should handle paths with ../ prefix", ({ expect }) =>
      Effect.gen(function* () {
        const path = yield* Path.Path
        const cwd = process.cwd()
        const result = yield* Utils.expandAndResolvePath("../my-project")
        const expected = path.resolve(cwd, "../my-project")
        expect(result).toBe(expected)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should normalize paths with multiple slashes", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.expandAndResolvePath("/home//user///projects/my-app")
        expect(result).toBe("/home/user/projects/my-app")
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should handle tilde followed by directory traversal", ({ expect }) =>
      Effect.gen(function* () {
        const homeDir = os.homedir()
        const result = yield* Utils.expandAndResolvePath("~/dev/../projects/my-app")
        expect(result).toBe(`${homeDir}/projects/my-app`)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should not treat tilde in middle of path as special", ({ expect }) =>
      Effect.gen(function* () {
        const path = yield* Path.Path
        const cwd = process.cwd()
        const result = yield* Utils.expandAndResolvePath("projects/~test/my-app")
        const expected = path.resolve(cwd, "projects/~test/my-app")
        expect(result).toBe(expected)
      }).pipe(Effect.provide(Path.layer))
    )

    it.effect("should handle empty relative path segments", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.expandAndResolvePath("~/./dev/./my-project")
        const homeDir = os.homedir()
        expect(result).toBe(`${homeDir}/dev/my-project`)
      }).pipe(Effect.provide(Path.layer))
    )
  })

  describe("validateProjectName", () => {
    it.effect("should succeed for valid project names", ({ expect }) =>
      Effect.gen(function* () {
        const validNames = [
          "my-project",
          "my-app",
          "project123",
          "app-name-123",
          "@scope/package",
          "@company/my-app",
          "a",
          "project_name"
        ]

        for (const name of validNames) {
          const result = yield* Utils.validateProjectName(name).pipe(Effect.exit)
          expect(result._tag).toBe("Success")
          if (result._tag === "Success") {
            expect(result.value).toBe(name)
          }
        }
      })
    )

    it.effect("should fail for empty string", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName("").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must be a non-empty string")
        }
      })
    )

    it.effect("should fail for names longer than 214 characters", ({ expect }) =>
      Effect.gen(function* () {
        const longName = "a".repeat(215)
        const result = yield* Utils.validateProjectName(longName).pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not contain more than 214 characters")
        }
      })
    )

    it.effect("should fail for names with capital letters", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName("MyProject").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not contain capital letters")
        }
      })
    )

    it.effect("should fail for names with leading whitespace", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName(" project").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not contain leading or trailing whitespace")
        }
      })
    )

    it.effect("should fail for names with trailing whitespace", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName("project ").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not contain leading or trailing whitespace")
        }
      })
    )

    it.effect("should fail for names starting with a period", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName(".project").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not start with a period")
        }
      })
    )

    it.effect("should fail for names starting with an underscore", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName("_project").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must not start with an underscore")
        }
      })
    )

    it.effect("should fail for names with special characters", ({ expect }) =>
      Effect.gen(function* () {
        const specialChars = ["~", "'", "!", "(", ")", "*"]
        for (const char of specialChars) {
          const result = yield* Utils.validateProjectName(`project${char}name`).pipe(Effect.exit)
          expect(result._tag).toBe("Failure")
          if (result._tag === "Failure" && result.cause._tag === "Fail") {
            const message = HelpDoc.toAnsiText(result.cause.error)
            expect(message).toContain("must not contain the special scharacters")
          }
        }
      })
    )

    it.effect("should fail for NodeJS built-in module names", ({ expect }) =>
      Effect.gen(function* () {
        const builtins = ["http", "fs", "path", "crypto", "events"]
        for (const builtin of builtins) {
          const result = yield* Utils.validateProjectName(builtin).pipe(Effect.exit)
          expect(result._tag).toBe("Failure")
          if (result._tag === "Failure" && result.cause._tag === "Fail") {
            const message = HelpDoc.toAnsiText(result.cause.error)
            expect(message).toContain("must not be a NodeJS built-in module name")
          }
        }
      })
    )

    it.effect("should fail for blocked names", ({ expect }) =>
      Effect.gen(function* () {
        const blockedNames = ["node_modules", "favicon.ico"]
        for (const name of blockedNames) {
          const result = yield* Utils.validateProjectName(name).pipe(Effect.exit)
          expect(result._tag).toBe("Failure")
          if (result._tag === "Failure" && result.cause._tag === "Fail") {
            const message = HelpDoc.toAnsiText(result.cause.error)
            expect(message).toContain("is blocked from use")
          }
        }
      })
    )

    it.effect("should validate scoped packages correctly", ({ expect }) =>
      Effect.gen(function* () {
        const validScoped = ["@scope/package", "@company/my-app", "@user/valid-name"]
        for (const name of validScoped) {
          const result = yield* Utils.validateProjectName(name).pipe(Effect.exit)
          expect(result._tag).toBe("Success")
        }
      })
    )

    it.effect("should fail for invalid scoped package names", ({ expect }) =>
      Effect.gen(function* () {
        const result = yield* Utils.validateProjectName("@scope/invalid package").pipe(Effect.exit)
        expect(result._tag).toBe("Failure")
        if (result._tag === "Failure" && result.cause._tag === "Fail") {
          const message = HelpDoc.toAnsiText(result.cause.error)
          expect(message).toContain("must only contain URL-friendly characters")
        }
      })
    )
  })

  describe("validatePackageName", () => {
    it("should return valid for correct package names", ({ expect }) => {
      const validNames = [
        "my-package",
        "my-app",
        "package123",
        "app-name-123",
        "@scope/package",
        "@company/my-app",
        "a",
        "package_name",
        "package.name",
        "~package",
        "package-with-dashes",
        "package_with_underscores",
        "package.with.dots"
      ]

      for (const name of validNames) {
        const result = Utils.validatePackageName(name)
        expect(result.isValid).toBe(true)
        expect(result.normalizedName).toBe(name)
        expect(result.errorMessage).toBeUndefined()
      }
    })

    it("should fail for empty string", ({ expect }) => {
      const result = Utils.validatePackageName("")
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe("Package name cannot be empty")
    })

    it("should fail for whitespace-only string", ({ expect }) => {
      const result = Utils.validatePackageName("   ")
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe("Package name cannot be empty")
    })

    it("should fail for names longer than 214 characters", ({ expect }) => {
      const longName = "a".repeat(215)
      const result = Utils.validatePackageName(longName)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe("Package name cannot exceed 214 characters")
    })

    it("should normalize uppercase to lowercase", ({ expect }) => {
      const result = Utils.validatePackageName("MyPackage")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toBe("mypackage")
      expect(result.errorMessage).toContain("Invalid package name")
      expect(result.errorMessage).toContain("mypackage")
    })

    it("should normalize names with spaces", ({ expect }) => {
      const result = Utils.validatePackageName("my package name")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toBe("my-package-name")
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should normalize names with special characters", ({ expect }) => {
      const result = Utils.validatePackageName("my@package#name!")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toMatch(/my-package-name/)
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should handle scoped packages correctly", ({ expect }) => {
      const validScoped = ["@scope/package", "@company/my-app", "@user/valid-name"]
      for (const name of validScoped) {
        const result = Utils.validatePackageName(name)
        expect(result.isValid).toBe(true)
        expect(result.normalizedName).toBe(name)
      }
    })

    it("should normalize invalid scoped packages", ({ expect }) => {
      const result = Utils.validatePackageName("@SCOPE/My Package")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toBe("@scope/my-package")
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should handle malformed scoped packages", ({ expect }) => {
      const result = Utils.validatePackageName("@scope/package/extra")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toMatch(/@[a-z0-9-]+\/[a-z0-9-]+/)
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should remove invalid starting characters", ({ expect }) => {
      const testCases = [
        { input: "!package", expected: "package" },
        { input: "#test", expected: "test" },
        { input: "@@@invalid", expected: "package" }
      ]

      for (const { expected, input } of testCases) {
        const result = Utils.validatePackageName(input)
        expect(result.isValid).toBe(false)
        expect(result.normalizedName).toMatch(new RegExp(expected))
      }
    })

    it("should provide fallback for completely invalid names", ({ expect }) => {
      const result = Utils.validatePackageName("!!!###$$$")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toBe("package")
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should handle mixed valid and invalid characters", ({ expect }) => {
      const result = Utils.validatePackageName("my-app@123#test")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toMatch(/my-app/)
      expect(result.errorMessage).toContain("Invalid package name")
    })

    it("should trim whitespace before validation", ({ expect }) => {
      const result = Utils.validatePackageName("  my-package  ")
      expect(result.isValid).toBe(true)
      expect(result.normalizedName).toBe("my-package")
    })

    it("should validate names at exactly 214 characters", ({ expect }) => {
      const exactName = "a".repeat(214)
      const result = Utils.validatePackageName(exactName)
      expect(result.isValid).toBe(true)
      expect(result.normalizedName).toBe(exactName)
    })

    it("should handle scoped packages with special characters", ({ expect }) => {
      const result = Utils.validatePackageName("@my-scope!/package#name")
      expect(result.isValid).toBe(false)
      expect(result.normalizedName).toMatch(/@my-scope/)
      expect(result.errorMessage).toContain("Invalid package name")
    })
  })
})
