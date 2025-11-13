/**
 * Fastify backend server for {{projectName}}
 *
 * This server provides:
 * - Arrow Flight integration for querying blockchain data via Amp
 * - REST API endpoints for blocks and transfers
 */

import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import cors from "@fastify/cors"
import Fastify from "fastify"
import { Effect } from "effect"
import { Table } from "apache-arrow"
import { Chunk, Stream } from "effect"

// Configuration
const PORT = Number(process.env.PORT) || 3001
const AMP_FLIGHT_URL = process.env.AMP_FLIGHT_URL || "http://localhost:3002"

// Create Connect transport for Arrow Flight
const transport = createConnectTransport({
  baseUrl: AMP_FLIGHT_URL,
})

// Create Arrow Flight layer
const ArrowFlightLive = ArrowFlight.layer(transport)

// Create Fastify instance
const fastify = Fastify({
  logger: true,
})

// Register CORS
await fastify.register(cors, {
  origin: true, // Allow all origins in development
})

/**
 * Generic query function that executes SQL and returns results
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

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "healthy", service: "{{projectName}}-backend" }
})

// Root endpoint
fastify.get("/", async () => {
  return {
    message: "Amp - Fastify Backend",
    version: "0.1.0",
    endpoints: {
      health: "/health",
      getBlocks: "GET /api/blocks",
      getTransfers: "GET /api/transfers",
      executeQuery: "POST /api/queries/execute",
    },
  }
})

/**
 * Get ERC20 transfers from Amp
 */
fastify.get<{
  Querystring: { limit?: string; offset?: string }
}>("/api/transfers", async (request, reply) => {
  try {
    const limit = Number(request.query.limit) || 100
    const offset = Number(request.query.offset) || 0

    // Query ERC20 transfer logs from anvil dataset (temporarily until fastify_backend tables are available)
    const query = `
      SELECT 
        block_hash,
        tx_hash,
        log_index,
        address as contract_address,
        block_num,
        timestamp as tx_timestamp,
        evm_decode_log(topic1, topic2, topic3, data, 'Transfer(address indexed from, address indexed to, uint256 value)') as decoded_event
      FROM anvil.logs
      WHERE topic0 = evm_topic('Transfer(address indexed from, address indexed to, uint256 value)')
      ORDER BY block_num DESC, log_index ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    const data = await executeQuery(query)

    return {
      data,
      row_count: data.length,
      limit,
      offset,
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({
      error: "Failed to fetch transfers",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Get blocks from Amp
 */
fastify.get<{
  Querystring: { limit?: string; offset?: string }
}>("/api/blocks", async (request, reply) => {
  try {
    const limit = Number(request.query.limit) || 100
    const offset = Number(request.query.offset) || 0

    // Query blocks from anvil dataset (temporarily until fastify_backend tables are available)
    const query = `
      SELECT block_num, timestamp, hash 
      FROM anvil.blocks 
      ORDER BY block_num DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const data = await executeQuery(query)

    return {
      data,
      row_count: data.length,
      limit,
      offset,
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({
      error: "Failed to fetch blocks",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Execute custom SQL query against Amp
 */
fastify.post<{
  Body: { query: string }
}>("/api/queries/execute", async (request, reply) => {
  try {
    const { query } = request.body

    if (!query || typeof query !== "string") {
      return reply.code(400).send({ error: "Query string is required" })
    }

    const data = await executeQuery(query)

    return {
      data,
      row_count: data.length,
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({
      error: "Query execution failed",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" })
    fastify.log.info(`Server listening on http://localhost:${PORT}`)
    fastify.log.info(`Amp Flight URL: ${AMP_FLIGHT_URL}`)
    fastify.log.info(`Dataset: {{projectName}}_data`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
