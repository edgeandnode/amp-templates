/**
 * Fastify backend server for querying remote AMP datasets via Gateway
 *
 * This server provides:
 * - REST API endpoints for querying blockchain data via AMP Gateway
 * - Remote AMP Gateway integration (no local setup needed)
 * - Authentication via AMP_AUTH_TOKEN environment variable
 */

import "dotenv/config"
import cors from "@fastify/cors"
import Fastify from "fastify"

import { AmpClient } from "./amp-client.js"
import type { BlockData, LogData, TransactionData } from "./types/amp-data.js"

// Configuration
const PORT = Number(process.env.PORT) || 3001
const HOST = process.env.HOST || "0.0.0.0"
const AMP_GATEWAY_URL = process.env.AMP_GATEWAY_URL || "https://gateway.amp.staging.edgeandnode.com"
const AMP_AUTH_TOKEN = process.env.AMP_AUTH_TOKEN // Get auth token from environment
const DATASET_NAME = process.env.DATASET_NAME || "edgeandnode/arbitrum_one@0.0.1"
const NODE_ENV = process.env.NODE_ENV || "development"

// Create AMP client
const ampClient = new AmpClient(AMP_GATEWAY_URL, AMP_AUTH_TOKEN)

// Create Fastify instance
const fastify = Fastify({
    logger: {
        level: NODE_ENV === "development" ? "info" : "warn",
    },
})

// Register CORS
await fastify.register(cors, {
    origin: true, // Allow all origins in development
})

// Health check endpoint
fastify.get("/health", async () => {
    try {
        const health = await ampClient.getHealth()
        return {
            status: health.status,
            service: "amp-fastify-gateway-backend",
            timestamp: health.timestamp,
            gateway: AMP_GATEWAY_URL,
            hasAuthToken: !!AMP_AUTH_TOKEN,
        }
    } catch (error) {
        return {
            status: "unhealthy",
            service: "amp-fastify-gateway-backend",
            timestamp: new Date().toISOString(),
            gateway: AMP_GATEWAY_URL,
            hasAuthToken: !!AMP_AUTH_TOKEN,
            error: error instanceof Error ? error.message : String(error),
        }
    }
})

// Root endpoint
fastify.get("/", async () => {
    return {
        name: "Amp Fastify Gateway Backend",
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
    }
})

/**
 * Get blocks from AMP Gateway
 */
fastify.get<{
    Querystring: { limit?: string; offset?: string }
}>("/api/blocks", async (request, reply) => {
    try {
        const limit = Math.min(Number(request.query.limit) || 10, 100)
        const offset = Number(request.query.offset) || 0

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

        return {
            data: result.data as BlockData[],
            row_count: result.rowCount,
            limit,
            offset,
            has_next_page: result.rowCount === limit,
            has_previous_page: offset > 0,
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
 * Get transactions from AMP Gateway
 */
fastify.get<{
    Querystring: { limit?: string; offset?: string }
}>("/api/transactions", async (request, reply) => {
    try {
        const limit = Math.min(Number(request.query.limit) || 10, 100)
        const offset = Number(request.query.offset) || 0

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

        return {
            data: result.data as TransactionData[],
            row_count: result.rowCount,
            limit,
            offset,
            has_next_page: result.rowCount === limit,
            has_previous_page: offset > 0,
        }
    } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
            error: "Failed to fetch transactions",
            message: error instanceof Error ? error.message : String(error),
        })
    }
})

/**
 * Get logs from AMP Gateway
 */
fastify.get<{
    Querystring: { limit?: string; offset?: string; contractAddress?: string; topics?: string }
}>("/api/logs", async (request, reply) => {
    try {
        const limit = Math.min(Number(request.query.limit) || 10, 100)
        const offset = Number(request.query.offset) || 0
        const contractAddress = request.query.contractAddress
        const topicsParam = request.query.topics

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

        return {
            data: result.data as LogData[],
            row_count: result.rowCount,
            limit,
            offset,
            has_next_page: result.rowCount === limit,
            has_previous_page: offset > 0,
        }
    } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
            error: "Failed to fetch logs",
            message: error instanceof Error ? error.message : String(error),
        })
    }
})

/**
 * Execute custom SQL query against AMP Gateway
 */
fastify.post<{
    Body: { query: string }
}>("/api/queries/execute", async (request, reply) => {
    try {
        const { query } = request.body

        if (!query || typeof query !== "string") {
            return reply.code(400).send({ error: "Query string is required" })
        }

        // Add safety checks for the query
        const queryLower = query.toLowerCase().trim()

        // Only allow SELECT statements
        if (!queryLower.startsWith("select")) {
            return reply.code(400).send({ error: "Only SELECT statements are allowed" })
        }

        // Prevent dangerous operations
        const dangerousKeywords = ["drop", "delete", "insert", "update", "alter", "create", "truncate"]
        for (const keyword of dangerousKeywords) {
            if (queryLower.includes(keyword)) {
                return reply.code(400).send({ error: `Query contains forbidden keyword: ${keyword}` })
            }
        }

        const result = await ampClient.executeQuery(query)

        return {
            data: result.data,
            row_count: result.rowCount,
            execution_time: result.executionTime,
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
        await fastify.listen({ port: PORT, host: HOST })
        fastify.log.info(`Server listening on http://localhost:${PORT}`)
        fastify.log.info(`AMP Gateway: ${AMP_GATEWAY_URL}`)
        fastify.log.info(`Auth Token: ${AMP_AUTH_TOKEN ? "✅ Configured" : "❌ Missing (set AMP_AUTH_TOKEN)"}`)
        fastify.log.info(`Dataset: ${DATASET_NAME}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

// Graceful shutdown
const signals = ["SIGINT", "SIGTERM"]
signals.forEach((signal) => {
    process.on(signal, async () => {
        fastify.log.info(`\nReceived ${signal}, shutting down gracefully...`)
        try {
            await fastify.close()
            fastify.log.info("Server stopped gracefully")
            process.exit(0)
        } catch (error) {
            fastify.log.error(`Error during shutdown: ${error instanceof Error ? error.message : String(error)}`)
            process.exit(1)
        }
    })
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    fastify.log.error(`Unhandled Promise Rejection at: ${String(promise)}, reason: ${reason instanceof Error ? reason.message : String(reason)}`)
})

// Start the server
start().catch((error) => {
    fastify.log.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
})

