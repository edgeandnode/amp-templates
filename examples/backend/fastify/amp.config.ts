import { defineDataset } from "@edgeandnode/amp"

export default defineDataset(() => ({
  name: "fastify_backend",
  network: "anvil",
  version: "1.0.0",
  dependencies: {
    anvil: {
      owner: "graphprotocol",
      name: "anvil",
      version: "0.1.0",
    },
  },
  tables: {
    blocks: {
      sql: `
        SELECT
          block_num,
          timestamp,
          hash
        FROM anvil.blocks
      `,
    },
    logs: {
      sql: `
        SELECT
          block_hash,
          tx_hash,
          log_index,
          address,
          block_num,
          timestamp,
          topic0,
          topic1,
          topic2,
          topic3,
          data
        FROM anvil.logs
      `,
    },
  },
}))