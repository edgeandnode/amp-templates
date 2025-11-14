import { Arrow, ArrowFlight } from "@edgeandnode/amp"
import { Table } from "apache-arrow"
import { Chunk, Effect, Schema, Stream } from "effect"

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
    const flight = yield* ArrowFlight.ArrowFlight

    // Collect stream batches
    const batches = yield* Stream.runCollect(flight.stream(queryString)).pipe(
      Effect.catchAll((error) =>
        Effect.fail(
          new NetworkError({
            message: "Failed to execute Arrow Flight query",
            query: queryString.substring(0, 100) + "...",
            cause: error,
          }),
        ),
      ),
    )

    const data = Chunk.toArray(batches).map((batch) => batch.data)

    if (data.length === 0) {
      return []
    }

    const table = new Table(data)

    // Encode Arrow data
    const rawData = yield* Schema.encodeUnknown(Schema.Array(Arrow.generateSchema(table.schema)))([...table]).pipe(
      Effect.catchAll((error) =>
        Effect.fail(
          new SchemaDecodeError({
            message: "Failed to encode Arrow data",
            query: queryString.substring(0, 100) + "...",
            cause: error,
          }),
        ),
      ),
    )

    // Decode to domain schema
    const result = yield* Schema.decodeUnknown(Schema.Array(schema))(rawData).pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          console.error("[Query] Schema decode failed:", {
            query: queryString.substring(0, 100) + "...",
            error: error,
          })
        }),
      ),
      Effect.catchAll((error) =>
        Effect.fail(
          new SchemaDecodeError({
            message: "Failed to decode data to schema",
            query: queryString.substring(0, 100) + "...",
            cause: error,
          }),
        ),
      ),
    )

    return result
  }).pipe(
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
