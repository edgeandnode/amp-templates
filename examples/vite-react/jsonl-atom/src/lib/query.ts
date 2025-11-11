import * as JsonLines from "@edgeandnode/amp/api/JsonLines"
import { Effect, ParseResult, Schema } from "effect"

/**
 * Error thrown when a query fails to execute
 */
export class QueryError extends Schema.TaggedError<QueryError>()("QueryError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}

/**
 * Error thrown when schema decoding/encoding fails
 */
export class SchemaDecodeError extends Schema.TaggedError<SchemaDecodeError>()("SchemaDecodeError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}

/**
 * Error thrown when network/transport fails
 */
export class NetworkError extends Schema.TaggedError<NetworkError>()("NetworkError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}

export const query = <A, I, R>(schema: Schema.Schema<A, I, R>, queryString: string) =>
  Effect.gen(function* () {
    // Get optional access token from environment
    const accessToken = import.meta.env.VITE_AMP_ACCESS_TOKEN

    // Convert SQL string to TemplateStringsArray
    const queryTemplate: TemplateStringsArray = Object.assign([queryString], { raw: [queryString] })

    // Get JsonLines service from runtime context
    const jsonl = yield* JsonLines.JsonLines

    // Execute query with optional authentication
    // JsonLines parses each line individually and returns an array of results
    const queryWithHeaders = accessToken
      ? jsonl.query(schema)(queryTemplate, { Authorization: `Bearer ${accessToken}` })
      : jsonl.query(schema)(queryTemplate)

    const result = yield* queryWithHeaders.pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          console.error("[Query] JSON Lines query failed:", {
            query: queryString.substring(0, 100) + "...",
            error: error,
          })
        }),
      ),
      Effect.mapError((error) => {
        // Classify errors appropriately
        if (ParseResult.isParseError(error)) {
          return new SchemaDecodeError({
            message: "Failed to decode JSON Lines response",
            query: queryString.substring(0, 100) + "...",
            cause: error,
          })
        }

        // Default to NetworkError for other failures
        return new NetworkError({
          message: "Failed to execute JSON Lines query",
          query: queryString.substring(0, 100) + "...",
          cause: error,
        })
      }),
      // Catch any other unexpected errors
      Effect.catchAllDefect((defect) =>
        Effect.fail(
          new QueryError({
            message: "Unexpected error during query execution",
            query: queryString.substring(0, 100) + "...",
            cause: defect,
          }),
        ),
      ),
    )

    return result
  })
