import { defineDataset } from "@edgeandnode/amp"

/**
 * Portfolio DApp Dataset
 * Depends on the reth base dataset for blockchain data
 * Provides decoded ERC20 transfer events and blocks
 */

const erc20TransferEvents = `
  SELECT
    block_hash,
    tx_hash,
    log_index,
    block_num,
    timestamp,
    address,
    evm_decode_log(topic1, topic2, topic3, data, 'Transfer(address indexed from, address indexed to, uint256 value)') as event
  FROM reth.logs
  WHERE topic0 = evm_topic('Transfer(address indexed from, address indexed to, uint256 value)')
`

export default defineDataset(() => ({
  name: "portfolio_dapp",
  network: "reth",
  version: "0.1.0",
  dependencies: {
    reth: {
      owner: "local",
      name: "reth",
      version: "0.1.0",
    },
  },
  tables: {
    erc20_transfers: {
      sql: `
        SELECT
          block_hash,
          tx_hash,
          log_index,
          address as contract_address,
          block_num,
          timestamp as tx_timestamp,
          event['from'] as from_address,
          event['to'] as to_address,
          event['value'] as amount_raw
        FROM (${erc20TransferEvents})
      `,
      network: "reth",
    },
    blocks: {
      sql: `
        SELECT
          block_num,
          timestamp,
          hash
        FROM reth.blocks
      `,
      network: "reth",
    },
  },
}))
