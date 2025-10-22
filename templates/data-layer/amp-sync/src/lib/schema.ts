import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core"

/**
 * Drizzle schema for {{projectName}}
 * Define your database schema here
 */

// Example: Blocks table
export const blocks = pgTable("blocks", {
  blockNum: bigint("block_num", { mode: "bigint" }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  hash: text("hash").notNull(),
  parentHash: text("parent_hash"),
})

// Add more tables as needed
