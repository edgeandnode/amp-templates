/**
 * Express backend server for querying remote AMP datasets via Gateway
 *
 * This server provides:
 * - REST API endpoints for querying blockchain data via AMP Gateway
 * - Remote AMP Gateway integration (no local setup needed)
 * - Authentication via AMP_AUTH_TOKEN environment variable
 */

import "dotenv/config"
import cors from "cors"
import express, { type Request, type Response } from "express"

import { AmpClient } from "./amp-client.js"
import type { BlockData, LogData, TransactionData } from "./types/amp-data.js"

// Configuration
const PORT = Number(process.env.PORT) || 3001
const AMP_GATEWAY_URL = process.env.AMP_GATEWAY_URL || "https://gateway.amp.staging.edgeandnode.com"
const AMP_AUTH_TOKEN = process.env.AMP_AUTH_TOKEN // Get auth token from environment
const DATASET_NAME = process.env.DATASET_NAME || "edgeandnode/arbitrum_one@0.0.1"

// Create AMP client
const ampClient = new AmpClient(AMP_GATEWAY_URL, AMP_AUTH_TOKEN)

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
  try {
    const health = await ampClient.getHealth()
    res.json({
      status: health.status,
      service: "amp-express-gateway-backend",
      timestamp: health.timestamp,
      gateway: AMP_GATEWAY_URL,
      hasAuthToken: !!AMP_AUTH_TOKEN,
    })
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      service: "amp-express-gateway-backend",
      timestamp: new Date().toISOString(),
      gateway: AMP_GATEWAY_URL,
      hasAuthToken: !!AMP_AUTH_TOKEN,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Amp Express Gateway Backend",
    version: "0.1.0",
    description: "REST API for querying blockchain data via AMP Gateway",
    endpoints: {
      health: "/health",
      getBlocks: "GET /api/blocks",
      getTransactions: "GET /api/transactions",
      getLogs: "GET /api/logs",
      executeQuery: "POST /api/queries/execute",
    },
    dataset: DATASET_NAME,
    gateway: AMP_GATEWAY_URL,
    authenticated: !!AMP_AUTH_TOKEN,
  })
})

/**
 * Get blocks from AMP Gateway
 */
app.get("/api/blocks", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100)
    const offset = Number(req.query.offset) || 0

    const query = `
      SELECT 
        block_num,
        timestamp,
        hash,
        parent_hash,
        ommers_hash,
        miner,
        state_root,
        transactions_root,
        receipt_root,
        logs_bloom,
        difficulty,
        total_difficulty,
        gas_limit,
        gas_used,
        extra_data,
        mix_hash,
        nonce,
        base_fee_per_gas,
        withdrawals_root,
        blob_gas_used,
        excess_blob_gas,
        parent_beacon_root
      FROM "${DATASET_NAME}".blocks
      ORDER BY block_num DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await ampClient.executeQuery(query)

    res.json({
      data: result.data as BlockData[],
      row_count: result.rowCount,
      limit,
      offset,
      has_next_page: result.rowCount === limit,
      has_previous_page: offset > 0,
    })
  } catch (error) {
    console.error("Failed to fetch blocks:", error)
    res.status(500).json({
      error: "Failed to fetch blocks",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Get transactions from AMP Gateway
 */
app.get("/api/transactions", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100)
    const offset = Number(req.query.offset) || 0

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
      FROM "${DATASET_NAME}".transactions
      ORDER BY block_num DESC, tx_index ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await ampClient.executeQuery(query)

    res.json({
      data: result.data as TransactionData[],
      row_count: result.rowCount,
      limit,
      offset,
      has_next_page: result.rowCount === limit,
      has_previous_page: offset > 0,
    })
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    res.status(500).json({
      error: "Failed to fetch transactions",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Get logs from AMP Gateway
 */
app.get("/api/logs", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100)
    const offset = Number(req.query.offset) || 0
    const contractAddress = req.query.contractAddress as string | undefined
    const topicsParam = req.query.topics as string | undefined

    let whereClause = ""
    const conditions: string[] = []

    if (contractAddress) {
      conditions.push(`address = '${contractAddress}'`)
    }

    if (topicsParam) {
      const topics = topicsParam.split(",").filter((t: string) => t.trim())
      topics.forEach((topic: string, index: number) => {
        if (topic.trim()) {
          conditions.push(`topic${index} = '${topic.trim()}'`)
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
      FROM "${DATASET_NAME}".logs
      ${whereClause}
      ORDER BY block_num DESC, log_index ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await ampClient.executeQuery(query)

    res.json({
      data: result.data as LogData[],
      row_count: result.rowCount,
      limit,
      offset,
      has_next_page: result.rowCount === limit,
      has_previous_page: offset > 0,
    })
  } catch (error) {
    console.error("Failed to fetch logs:", error)
    res.status(500).json({
      error: "Failed to fetch logs",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Execute custom SQL query against AMP Gateway
 */
app.post("/api/queries/execute", async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query string is required" })
    }

    // Add safety checks for the query
    const queryLower = query.toLowerCase().trim()

    // Only allow SELECT statements
    if (!queryLower.startsWith("select")) {
      return res.status(400).json({ error: "Only SELECT statements are allowed" })
    }

    // Prevent dangerous operations
    const dangerousKeywords = ["drop", "delete", "insert", "update", "alter", "create", "truncate"]
    for (const keyword of dangerousKeywords) {
      if (queryLower.includes(keyword)) {
        return res.status(400).json({ error: `Query contains forbidden keyword: ${keyword}` })
      }
    }

    const result = await ampClient.executeQuery(query)

    res.json({
      data: result.data,
      row_count: result.rowCount,
      execution_time: result.executionTime,
    })
  } catch (error) {
    console.error("Query execution failed:", error)
    res.status(500).json({
      error: "Query execution failed",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
  console.log(`AMP Gateway: ${AMP_GATEWAY_URL}`)
  console.log(`Auth Token: ${AMP_AUTH_TOKEN ? "✅ Configured" : "❌ Missing (set AMP_AUTH_TOKEN)"}`)
  console.log(`Dataset: ${DATASET_NAME}`)
})

