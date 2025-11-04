import { defineDataset } from "@edgeandnode/amp"

/**
 * Base dataset for Reth node
 * Provides raw blocks, transactions, and logs tables from the Reth RPC provider
 */
export default defineDataset(() => ({
  name: "reth",
  network: "reth",
  version: "0.1.0",
  dependencies: {},
  tables: {
    // Raw blocks from Reth node
    blocks: {
      sql: `
        SELECT
          block_num,
          timestamp,
          hash,
          parent_hash,
          state_root,
          transactions_root,
          receipt_root,
          miner,
          difficulty,
          gas_limit,
          gas_used,
          nonce,
          base_fee_per_gas,
          blob_gas_used,
          excess_blob_gas,
          mix_hash,
          ommers_hash,
          withdrawals_root,
          parent_beacon_root,
          extra_data,
          logs_bloom
        FROM blocks
      `,
      network: "reth",
    },
    // Raw transactions from Reth node
    transactions: {
      sql: `
        SELECT
          tx_hash,
          block_num,
          block_hash,
          tx_index,
          timestamp,
          from,
          to,
          value,
          gas_limit,
          gas_used,
          gas_price,
          max_fee_per_gas,
          max_priority_fee_per_gas,
          max_fee_per_blob_gas,
          input,
          nonce,
          type,
          status,
          r,
          s,
          v
        FROM transactions
      `,
      network: "reth",
    },
    logs: {
      sql: `
        SELECT
          block_num,
          block_hash,
          tx_hash,
          tx_index,
          log_index,
          timestamp,
          address,
          data,
          topic0,
          topic1,
          topic2,
          topic3
        FROM logs
      `,
      network: "reth",
    },
  },
}))
