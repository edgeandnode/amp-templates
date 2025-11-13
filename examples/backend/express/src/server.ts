/**
 * Express backend server for Amp Arrow Flight integration
 *
 * This server provides:
 * - Arrow Flight integration for querying blockchain data via Amp
 * - REST API endpoints for blocks and transfers
 */

import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import { Table } from "apache-arrow"
import cors from "cors"
import { Chunk, Effect, Stream } from "effect"
import express, { type Request, type Response } from "express"

// Configuration
const PORT = Number(process.env.PORT) || 3001
const AMP_FLIGHT_URL = process.env.AMP_FLIGHT_URL || "http://localhost:3002"

// Create Connect transport for Arrow Flight
const transport = createConnectTransport({
  baseUrl: AMP_FLIGHT_URL,
})

// Create Arrow Flight layer
const ArrowFlightLive = ArrowFlight.layer(transport)

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

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
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", service: "amp-express-backend" })
})

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Amp Express Backend - Anvil Blocks",
    version: "0.1.0",
    endpoints: {
      health: "/health",
      getBlocks: "GET /api/blocks",
      getTransfers: "GET /api/transfers",
      executeQuery: "POST /api/queries/execute",
    },
  })
})

/**
 * Get ERC20 transfers from Amp
 */
app.get("/api/transfers", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100
    const offset = Number(req.query.offset) || 0

    // Query ERC20 transfer logs from anvil dataset (temporarily until express_backend tables are available)
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

    res.json({
      data,
      row_count: data.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Failed to fetch transfers",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Get blocks from Amp
 */
app.get("/api/blocks", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100
    const offset = Number(req.query.offset) || 0

    // Query blocks from anvil dataset (temporarily until express_backend tables are available)
    const query = `
      SELECT block_num, timestamp, hash 
      FROM anvil.blocks 
      ORDER BY block_num DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const data = await executeQuery(query)

    res.json({
      data,
      row_count: data.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Failed to fetch blocks",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Execute custom SQL query against Amp
 */
app.post("/api/queries/execute", async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query string is required" })
    }

    const data = await executeQuery(query)

    res.json({
      data,
      row_count: data.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Query execution failed",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT}`)
  console.log(`Amp Flight URL: ${AMP_FLIGHT_URL}`)
  console.log(`Dataset: express_backend`)
})

