/**
 * Apollo GraphQL Server with Arrow Flight integration
 * 
 * This server provides a GraphQL API for querying blockchain data
 * from local Amp datasets via Arrow Flight.
 * 
 * Features:
 * - GraphQL API with Apollo Server
 * - Query blocks, transactions, receipts, and logs
 * - Arrow Flight integration for local Amp datasets
 * - GraphQL Playground for development
 */

import "dotenv/config"
import { ApolloServer } from "@apollo/server"
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify"
import Fastify from "fastify"

import { executeQuery, type Context } from "./resolvers.js"
import { typeDefs } from "./schema.js"

// Configuration
const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || "0.0.0.0"
const AMP_FLIGHT_URL = process.env.AMP_FLIGHT_URL || "http://localhost:3002"
const DATASET_NAME = process.env.DATASET_NAME || "anvil"
const NODE_ENV = process.env.NODE_ENV || "development"

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: NODE_ENV === "development" ? "info" : "warn",
  },
})

// Create Apollo Server
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers: {
    Query: {
      health: async () => {
        try {
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
      blocks: async (_parent: any, args: { limit?: number; offset?: number }) => {
        const limit = Math.min(args.limit || 10, 100)
        const offset = args.offset || 0

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
          FROM ${DATASET_NAME}.blocks
          ORDER BY block_num DESC
          LIMIT ${limit} OFFSET ${offset}
        `

        const data = await executeQuery(query) as any[]

        return {
          data,
          totalCount: data.length,
          hasNextPage: data.length === limit,
          hasPreviousPage: offset > 0,
        }
      },
      transactions: async (_parent: any, args: { limit?: number; offset?: number }) => {
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

        const data = await executeQuery(query) as any[]

        return {
          data,
          totalCount: data.length,
          hasNextPage: data.length === limit,
          hasPreviousPage: offset > 0,
        }
      },
      logs: async (_parent: any, args: { limit?: number; offset?: number; contractAddress?: string; topics?: string[] }) => {
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

        const data = await executeQuery(query) as any[]

        return {
          data,
          totalCount: data.length,
          hasNextPage: data.length === limit,
          hasPreviousPage: offset > 0,
        }
      },
      executeQuery: async (_parent: any, args: { query: string }) => {
        const queryLower = args.query.toLowerCase().trim()
        
        if (!queryLower.startsWith("select")) {
          throw new Error("Only SELECT statements are allowed")
        }

        const dangerousKeywords = ["drop", "delete", "insert", "update", "alter", "create", "truncate"]
        for (const keyword of dangerousKeywords) {
          if (queryLower.includes(keyword)) {
            throw new Error(`Query contains forbidden keyword: ${keyword}`)
          }
        }

        const startTime = Date.now()
        const data = await executeQuery(args.query)
        const executionTime = Date.now() - startTime
        
        return {
          data,
          rowCount: data.length,
          executionTime,
        }
      },
    },
    QueryResultRow: {
      __serialize: (value: any) => value,
      __parseValue: (value: any) => value,
      __parseLiteral: (ast: any) => ast.value,
    },
  },
  plugins: [fastifyApolloDrainPlugin(fastify)],
  introspection: true,
  includeStacktraceInErrorResponses: NODE_ENV === "development",
})

async function startServer() {
  try {
    // Start Apollo Server
    await server.start()

    // Register Apollo plugin with Fastify
    await fastify.register(fastifyApollo(server), {
      context: async (): Promise<Context> => ({
        executeQuery,
      }),
    })

    // Health check endpoint
    fastify.get("/health", async () => {
      try {
        await executeQuery(`SELECT 1 as health_check FROM ${DATASET_NAME}.blocks LIMIT 1`)
        return {
          status: "healthy",
          service: "amp-apollo-graphql-flight-backend",
          timestamp: new Date().toISOString(),
          flightUrl: AMP_FLIGHT_URL,
          dataset: DATASET_NAME,
        }
      } catch (error) {
        return {
          status: "unhealthy",
          service: "amp-apollo-graphql-flight-backend",
          timestamp: new Date().toISOString(),
          flightUrl: AMP_FLIGHT_URL,
          dataset: DATASET_NAME,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })

    // Root endpoint with API information
    fastify.get("/", async () => {
      return {
        name: "Amp Apollo GraphQL Flight Backend",
        version: "0.1.0",
        description: "GraphQL API for querying blockchain data via Arrow Flight",
        endpoints: {
          graphql: "/graphql",
          health: "/health",
          playground: NODE_ENV === "development" ? "/graphql" : null,
        },
        dataset: DATASET_NAME,
        flightUrl: AMP_FLIGHT_URL,
      }
    })

    // Start the server
    await fastify.listen({
      port: PORT,
      host: HOST,
    })

    console.log(`Apollo GraphQL Server ready!`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
    console.log(`Health check: http://localhost:${PORT}/health`)
    console.log(`AMP Flight URL: ${AMP_FLIGHT_URL}`)
    console.log(`Dataset: ${DATASET_NAME}`)

    if (NODE_ENV === "development") {
      console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`)
      console.log(``)
      console.log(`Example queries:`)
      console.log(`   - Latest blocks: { blocks(limit: 5) { data { block_num hash timestamp miner } } }`)
      console.log(`   - Latest transactions: { transactions(limit: 5) { data { tx_hash from to value } } }`)
      console.log(`   - Custom query: { executeQuery(query: "SELECT * FROM ${DATASET_NAME}.blocks LIMIT 5") { data rowCount } }`)
    }
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ["SIGINT", "SIGTERM"]
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`)
    try {
      await fastify.close()
      await server.stop()
      console.log("Server stopped gracefully")
      process.exit(0)
    } catch (error) {
      console.error("Error during shutdown:", error)
      process.exit(1)
    }
  })
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection at:", promise, "reason:", reason)
})

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

