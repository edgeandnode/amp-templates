import { defineDataset } from "@edgeandnode/amp"

const event = (event: string) => {
  return `
    SELECT block_hash, tx_hash, log_index, block_num, timestamp, address, evm_decode_log(topic1, topic2, topic3, data, '${event}') as event
    FROM anvil.logs
    WHERE topic0 = evm_topic('${event}')
  `
}

const erc20_transfers = event("Transfer(address indexed from, address indexed to, uint256 value)")

export default defineDataset(() => ({
  name: "portfolio_dapp",
  network: "anvil",
  version: "0.0.1",
  dependencies: {
    anvil: "_/anvil@0.0.1",
  },
  tables: {
    erc20_transfers: {
      sql: `
        SELECT c.block_hash, c.tx_hash, c.log_index, c.address as contract_address, c.block_num, c.timestamp as tx_timestamp, c.event['from'] as from_address, c.event['to'] as to_address, c.event['value'] as amount_raw
        FROM (${erc20_transfers}) as c
      `,
    }
  },
}))
