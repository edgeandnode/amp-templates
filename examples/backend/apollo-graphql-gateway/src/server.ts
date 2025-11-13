/**
 * Apollo GraphQL Server for {{projectName}}
 * 
 * This server provides a GraphQL API for querying Arbitrum One blockchain data
 * from the edgeandnode/arbitrum_one@0.0.1 dataset via AMP Gateway.
 * 
 * Features:
 * - GraphQL API with Apollo Server
 * - Query blocks, transactions, receipts, and logs
 * - Remote AMP Gateway integration (no local setup needed)
 * - Authentication via AMP_AUTH_TOKEN environment variable
 * - GraphQL Playground for development
 */

import "dotenv/config"
import { ApolloServer } from "@apollo/server"
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify"
import Fastify from "fastify"

import { AmpClient } from "./amp-client.js"
import { type Context, resolvers } from "./resolvers.js"
import { typeDefs } from "./schema.js"

// Configuration
const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || "0.0.0.0"
const AMP_GATEWAY_URL = process.env.AMP_GATEWAY_URL || "https://gateway.amp.staging.edgeandnode.com"
const AMP_AUTH_TOKEN = process.env.AMP_AUTH_TOKEN // Get auth token from environment
const NODE_ENV = process.env.NODE_ENV || "development"

// Create AMP client
const ampClient = new AmpClient(AMP_GATEWAY_URL, AMP_AUTH_TOKEN)

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: NODE_ENV === "development" ? "info" : "warn",
  },
})

// Create Apollo Server
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(fastify)],
  introspection: true, // Enable introspection for GraphQL Playground
  includeStacktraceInErrorResponses: NODE_ENV === "development",
})

async function startServer() {
  try {
    // Start Apollo Server
    await server.start()

    // Register Apollo plugin with Fastify
    await fastify.register(fastifyApollo(server), {
      context: async (): Promise<Context> => ({
        ampClient,
      }),
    })

    // Health check endpoint
    fastify.get("/health", async () => {
      try {
        const health = await ampClient.getHealth()
        return {
          status: health.status,
          service: "{{projectName}}-apollo-graphql",
          timestamp: health.timestamp,
          gateway: AMP_GATEWAY_URL,
          hasAuthToken: !!AMP_AUTH_TOKEN,
        }
      } catch (error) {
        return {
          status: "unhealthy",
          service: "{{projectName}}-apollo-graphql",
          timestamp: new Date().toISOString(),
          gateway: AMP_GATEWAY_URL,
          hasAuthToken: !!AMP_AUTH_TOKEN,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })

    // Root endpoint with API information
    fastify.get("/", async () => {
      return {
        name: "Amp Apollo GraphQL Server",
        version: "0.1.0",
        description: "GraphQL API for querying Arbitrum One blockchain data via AMP Gateway",
        endpoints: {
          graphql: "/graphql",
          health: "/health",
          playground: NODE_ENV === "development" ? "/graphql" : null,
        },
        dataset: "edgeandnode/arbitrum_one@0.0.1",
        gateway: AMP_GATEWAY_URL,
        authenticated: !!AMP_AUTH_TOKEN,
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
    console.log(`AMP Gateway: ${AMP_GATEWAY_URL}`)
    console.log(`Auth Token: ${AMP_AUTH_TOKEN ? "✅ Configured" : "❌ Missing (set AMP_AUTH_TOKEN)"}`)
    console.log(`Dataset: edgeandnode/arbitrum_one@0.0.1`)

    if (NODE_ENV === "development") {
      console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`)
      console.log(``)
      console.log(`Example queries:`)
      console.log(`   - Latest blocks: { blocks(limit: 5) { data { block_num hash timestamp miner } } }`)
      console.log(`   - Latest transactions: { transactions(limit: 5) { data { tx_hash from to value } } }`)
      console.log(`   - Custom query: { executeQuery(query: "SELECT * FROM \\"edgeandnode/arbitrum_one@0.0.1\\".blocks LIMIT 5") { data rowCount } }`)
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