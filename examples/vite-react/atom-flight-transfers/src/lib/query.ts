import { Arrow, ArrowFlight, type Model } from "@edgeandnode/amp"
import { Table } from "apache-arrow"
import { Chunk, Effect, Schema, Stream } from "effect"

import { NetworkError, QueryError, SchemaDecodeError, Transfer } from "./schemas.ts"

/**
 * Execute an Arrow Flight query and decode results using Effect Schema
 *
 * This function implements a three-step transformation pipeline:
 * 1. Execute query and collect Arrow RecordBatch data into a Table
 * 2. Encode Arrow data using generated Arrow schema
 * 3. Decode to domain schema (Transfer) with validation
 *
 * Uses non-streaming mode (getFlightInfo + doGet without "amp-stream" header)
 * with Stream.take(1) to get the first batch only.
 *
 * @param queryString - SQL query to execute
 * @param options - Query options (resume blocks)
 * @returns Effect that yields array of validated Transfer objects
 */
export const query = (
  queryString: string,
  options?: {
    resume?: ReadonlyArray<Model.BlockRange>
  },
) =>
  Effect.gen(function* () {
    const flight = yield* ArrowFlight.ArrowFlight

    // Convert string to TemplateStringsArray for consistency with Effect APIs
    const queryTemplate: TemplateStringsArray = Object.assign([queryString], {
      raw: [queryString],
    })

    // Use non-streaming mode with Stream.take(1)
    const batchStream = flight.query(queryTemplate, options?.resume).pipe(Stream.take(1))

    // Collect stream batches into array
    const batches = yield* Stream.runCollect(batchStream).pipe(
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

    // Extract RecordBatch data (non-streaming mode returns RecordBatch directly)
    const data = Chunk.toArray(batches)

    if (data.length === 0) {
      return []
    }

    // Create Apache Arrow Table from batches
    const table = new Table(data)

    // Step 1: Encode Arrow data using generated schema
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

    // Step 2: Decode to domain schema (Transfer)
    const result = yield* Schema.decodeUnknown(Schema.Array(Transfer))(rawData).pipe(
      Effect.catchAll((error) =>
        Effect.fail(
          new SchemaDecodeError({
            message: "Failed to decode data to Transfer schema",
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
