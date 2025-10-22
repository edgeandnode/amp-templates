import { defineDataset } from "@edgeandnode/amp"

export default defineDataset(() => ({
  name: "{{projectName}}_dataset",
  version: "0.1.0",
  network: "anvil",
  dependencies: {
    anvil_rpc: {
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
          hash,
          parent_hash,
          miner,
          gas_used,
          gas_limit
        FROM anvil_rpc.blocks
      `,
      network: "anvil",
    },
    transactions: {
      sql: `
        SELECT
          block_num,
          tx_hash,
          tx_index,
          "from",
          "to",
          value,
          gas_used,
          gas_price,
          input,
          status
        FROM anvil_rpc.transactions
      `,
      network: "anvil",
    },
    logs: {
      sql: `
        SELECT
          block_num,
          tx_hash,
          log_index,
          address,
          topic0,
          topic1,
          topic2,
          topic3,
          data
        FROM anvil_rpc.logs
      `,
      network: "anvil",
    },
  },
  functions: {},
}))
