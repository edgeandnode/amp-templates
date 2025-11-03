import { Arrow, ArrowFlight } from "@edgeandnode/amp"
import { Table } from "apache-arrow"
import { Chunk, Effect, Schema, Stream } from "effect"

export const query = <A, I, R>(schema: Schema.Schema<A, I, R>, queryString: string) =>
  Effect.gen(function* () {
    try {
      const flight = yield* ArrowFlight.ArrowFlight

      const batches = yield* Stream.runCollect(flight.stream(queryString))
      const data = Chunk.toArray(batches).map((batch) => batch.data)

      if (data.length === 0) {
        return []
      }

      const table = new Table(data)

      const rawData = yield* Schema.encodeUnknown(Schema.Array(Arrow.generateSchema(table.schema)))([...table])

      const result = yield* Schema.decodeUnknown(Schema.Array(schema))(rawData).pipe(
        Effect.tapError((error) =>
          Effect.sync(() => {
            console.error("[Query] Schema decode failed with error:", error)
            console.error("[Query] Error details:", JSON.stringify(error, null, 2))
          }),
        ),
      )
      return result
    } catch (error) {
      console.error("[Query] Query failed:", {
        query: queryString.substring(0, 100) + "...",
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }
  })
