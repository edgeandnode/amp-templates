/**
 * GraphQL resolvers for querying Arbitrum One blockchain data via AMP Gateway
 */

import { AmpClient, convertBigIntsToStrings } from "./amp-client.js"
import type { 
  BlockData,
  ConnectionResult, 
  LogData, 
  TransactionData
} from "./types/amp-data.js"

export interface Context {
  ampClient: AmpClient
}

export const resolvers = {
  Query: {
    health: async (_parent: any, _args: any, context: Context) => {
      const health = await context.ampClient.getHealth()
      return {
        status: health.status,
        service: "amp-apollo-graphql-gateway-backend",
        timestamp: health.timestamp,
        gateway: process.env.AMP_GATEWAY_URL || "https://gateway.amp.staging.edgeandnode.com",
      }
    },

    blocks: async (_parent: any, args: { limit?: number; offset?: number }, context: Context): Promise<ConnectionResult<BlockData>> => {
      const limit = Math.min(args.limit || 10, 100) // Cap at 100
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
        FROM "edgeandnode/arbitrum_one@0.0.1".blocks
        ORDER BY block_num DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const result = await context.ampClient.executeQuery(query)
      const data = result.data.map(convertBigIntsToStrings) as BlockData[]

      return {
        data,
        totalCount: result.rowCount,
        hasNextPage: result.rowCount === limit,
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
        FROM "edgeandnode/arbitrum_one@0.0.1".transactions
        ORDER BY block_num DESC, tx_index ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const result = await context.ampClient.executeQuery(query)
      const data = result.data.map(convertBigIntsToStrings) as TransactionData[]

      return {
        data,
        totalCount: result.rowCount,
        hasNextPage: result.rowCount === limit,
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
        FROM "edgeandnode/arbitrum_one@0.0.1".logs
        ${whereClause}
        ORDER BY block_num DESC, log_index ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const result = await context.ampClient.executeQuery(query)
      const data = result.data.map(convertBigIntsToStrings) as LogData[]

      return {
        data,
        totalCount: result.rowCount,
        hasNextPage: result.rowCount === limit,
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

      const result = await context.ampClient.executeQuery(args.query)
      
      return {
        data: result.data.map(convertBigIntsToStrings),
        rowCount: result.rowCount,
        executionTime: result.executionTime,
      }
    },
  },

  // Custom scalar resolver for QueryResultRow
  QueryResultRow: {
    __serialize: (value: any) => convertBigIntsToStrings(value),
    __parseValue: (value: any) => value,
    __parseLiteral: (ast: any) => ast.value,
  },
}