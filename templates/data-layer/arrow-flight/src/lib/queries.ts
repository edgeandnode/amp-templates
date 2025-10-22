import { Arrow, ArrowFlight } from "@edgeandnode/amp"
import { Atom } from "@effect-atom/atom-react"
import { Table } from "apache-arrow"
import { Chunk, Effect, Schema, Stream } from "effect"
import { runtime } from "./runtime"

/**
 * Generic query function that executes SQL and transforms results using Effect Schema
 */
export const query = Effect.fn(function*<A, I, R>(
  schema: Schema.Schema<A, I, R>, 
  query: string
) {
  const flight = yield* ArrowFlight.ArrowFlight
  
  // Stream data from Amp and collect all batches
  const data = yield* Stream.runCollect(flight.stream(query)).pipe(
    Effect.map((batches) => Chunk.toArray(batches).map((batch) => batch.data)),
  )

  if (data.length === 0) {
    return []
  }

  // Convert Arrow batches to table and decode with schema
  const table = new Table(data)
  const result = yield* Schema.encodeUnknown(
    Schema.Array(Arrow.generateSchema(table.schema))
  )([...table])
  
  return yield* Schema.decodeUnknown(Schema.Array(schema))(result)
})

/**
 * Example: Query blocks from the dataset
 */
export class Block extends Schema.Class<Block>("Block")({
  blockNum: Schema.BigInt.pipe(Schema.propertySignature, Schema.fromKey("block_num")),
  timestamp: Schema.Date.pipe(Schema.propertySignature, Schema.fromKey("timestamp")),
  hash: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("hash")),
}) {}

const blocksQuery = `
  SELECT block_num, timestamp, hash 
  FROM {{projectName}}_dataset.blocks 
  ORDER BY block_num DESC 
  LIMIT 100
`

export const queryBlocks = () => query(Block, blocksQuery)

// Create a reactive atom for blocks
export const blocksAtom = runtime.atom(queryBlocks()).pipe(
  Atom.withReactivity(["blocks"])
)

