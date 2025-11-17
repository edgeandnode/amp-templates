/**
 * GraphQL resolvers for querying blockchain data via Arrow Flight
 */

import { createConnectTransport } from "@connectrpc/connect-node"
import { ArrowFlight } from "@edgeandnode/amp"
import { Effect } from "effect"
import { Table } from "apache-arrow"
import { Chunk, Stream } from "effect"
import type { 
  BlockData,
  ConnectionResult, 
  LogData, 
  TransactionData
} from "./types/amp-data.js"

export interface Context {
  executeQuery: (query: string) => Promise<unknown[]>
}

const AMP_FLIGHT_URL = process.env.AMP_FLIGHT_URL || "http://localhost:3002"
const DATASET_NAME = process.env.DATASET_NAME || "anvil"

// Create Connect transport for Arrow Flight
const transport = createConnectTransport({
  baseUrl: AMP_FLIGHT_URL,
  httpVersion: "1.1",
})

// Create Arrow Flight layer
const ArrowFlightLive = ArrowFlight.layer(transport)

/**
 * Generic query function that executes SQL via Arrow Flight and returns results
 */
async function executeQuery(query: string): Promise<unknown[]> {
  return Effect.gen(function* () {
    const flight = yield* ArrowFlight.ArrowFlight

    // Stream data from Amp and collect all batches
    const data = yield* Stream.runCollect(flight.stream(query)).pipe(
      Effect.map((batches) => Chunk.toArray(batches).map((batch) => batch.data)),
    )

    if (data.length === 0) {
      return []
    }

    // Convert Arrow batches to table
    const table = new Table(data)

    // Convert table to array of objects
    const result: unknown[] = []
    const columnNames = table.schema.fields.map((field) => field.name)

    for (let i = 0; i < table.numRows; i++) {
      const obj: Record<string, unknown> = {}
      for (let j = 0; j < table.numCols; j++) {
        const columnName = columnNames[j]
        let value = table.getChildAt(j)?.get(i)

        // Convert BigInt to string for JSON serialization
        if (typeof value === "bigint") {
          value = value.toString()
        }

        // Convert FixedSizeBinary to hex string for hashes
        if (value && typeof value === "object" && "constructor" in value && value.constructor.name === "Uint8Array") {
          const bytes = value as Uint8Array
          value =
            "0x" +
            Array.from(bytes)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
        }

        obj[columnName] = value
      }
      result.push(obj)
    }

    return result
  }).pipe(Effect.provide(ArrowFlightLive), Effect.runPromise)
}

export const resolvers = {
  Query: {
    health: async () => {
      try {
        // Try a simple query to test connectivity
        await executeQuery(`SELECT 1 as health_check FROM ${DATASET_NAME}.blocks LIMIT 1`)
        return {
          status: "healthy",
          service: "amp-apollo-graphql-flight-backend",
          timestamp: new Date().toISOString(),
          flightUrl: AMP_FLIGHT_URL,
        }
      } catch (_error) {
        return {
          status: "unhealthy",
          service: "amp-apollo-graphql-flight-backend",
          timestamp: new Date().toISOString(),
          flightUrl: AMP_FLIGHT_URL,
        }
      }
    },

    blocks: async (_parent: any, args: { limit?: number; offset?: number }, context: Context): Promise<ConnectionResult<BlockData>> => {
      const limit = Math.min(args.limit || 10, 100) // Cap at 100
      const offset = args.offset || 0

      const query = `
        SELECT
          block_num,
          timestamp,
          hash
        FROM ${DATASET_NAME}.blocks
        ORDER BY block_num DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const data = await context.executeQuery(query) as BlockData[]

      return {
        data,
        totalCount: data.length,
        hasNextPage: data.length === limit,
        hasPreviousPage: offset > 0,
      }
    },

    transactions: async (_parent: any, args: { limit?: number; offset?: number }, context: Context): Promise<ConnectionResult<TransactionData>> => {
      const limit = Math.min(args.limit || 10, 100)
      const offset = args.offset || 0

      const query = `
        SELECT 
          block_hash,
          block_num,
          timestamp,
          tx_index,
          tx_hash,
          "to",
          nonce,
          gas_price,
          gas_limit,
          value,
          input,
          v,
          r,
          s,
          gas_used,
          type,
          max_fee_per_gas,
          max_priority_fee_per_gas,
          max_fee_per_blob_gas,
          "from",
          status
        FROM ${DATASET_NAME}.transactions
        ORDER BY block_num DESC, tx_index ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const data = await context.executeQuery(query) as TransactionData[]

      return {
        data,
        totalCount: data.length,
        hasNextPage: data.length === limit,
        hasPreviousPage: offset > 0,
      }
    },

    logs: async (_parent: any, args: { limit?: number; offset?: number; contractAddress?: string; topics?: string[] }, context: Context) => {
      const limit = Math.min(args.limit || 10, 100)
      const offset = args.offset || 0

      let whereClause = ""
      const conditions: string[] = []

      if (args.contractAddress) {
        conditions.push(`address = '${args.contractAddress}'`)
      }

      if (args.topics && args.topics.length > 0) {
        args.topics.forEach((topic, index) => {
          if (topic) {
            conditions.push(`topic${index} = '${topic}'`)
          }
        })
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`
      }

      const query = `
        SELECT 
          block_hash,
          block_num,
          timestamp,
          tx_hash,
          tx_index,
          log_index,
          address,
          topic0,
          topic1,
          topic2,
          topic3,
          data
        FROM ${DATASET_NAME}.logs
        ${whereClause}
        ORDER BY block_num DESC, log_index ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const data = await context.executeQuery(query) as LogData[]

      return {
        data,
        totalCount: data.length,
        hasNextPage: data.length === limit,
        hasPreviousPage: offset > 0,
      }
    },

    executeQuery: async (_parent: any, args: { query: string }, context: Context) => {
      // Add safety checks for the query
      const queryLower = args.query.toLowerCase().trim()
      
      // Only allow SELECT statements
      if (!queryLower.startsWith("select")) {
        throw new Error("Only SELECT statements are allowed")
      }

      // Prevent dangerous operations
      const dangerousKeywords = ["drop", "delete", "insert", "update", "alter", "create", "truncate"]
      for (const keyword of dangerousKeywords) {
        if (queryLower.includes(keyword)) {
          throw new Error(`Query contains forbidden keyword: ${keyword}`)
        }
      }

      const startTime = Date.now()
      const data = await context.executeQuery(args.query)
      const executionTime = Date.now() - startTime
      
      return {
        data,
        rowCount: data.length,
        executionTime,
      }
    },
  },

  // Custom scalar resolver for QueryResultRow
  QueryResultRow: {
    __serialize: (value: any) => value,
    __parseValue: (value: any) => value,
    __parseLiteral: (ast: any) => ast.value,
  },
}

// Export executeQuery for use in server.ts
export { executeQuery }

