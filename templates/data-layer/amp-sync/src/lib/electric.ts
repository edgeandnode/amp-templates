"use client"

import { useShape } from "@electric-sql/react"
import { Schema } from "effect"

/**
 * Electric SQL configuration
 * This connects to the Electric sync service that reads from PostgreSQL
 */

// Example: Blocks schema
export const Block = Schema.Struct({
  block_num: Schema.String,
  timestamp: Schema.String,
  hash: Schema.String,
})
export type Block = typeof Block.Type

const BlockDecoder = Schema.decodeUnknownSync(Block)

/**
 * Hook to stream blocks from Electric SQL
 * Uses Shape-based reactivity for real-time updates
 */
export function useBlocksStream() {
  return useShape<Block>({
    url: `/api/shape-proxy`,
    transformer(message) {
      return BlockDecoder(message)
    },
  })
}
