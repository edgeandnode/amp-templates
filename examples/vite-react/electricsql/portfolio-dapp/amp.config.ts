import { defineDataset } from "@edgeandnode/amp"
import { keccak256, toHex } from "viem"

const eventSig = (sig: string) => keccak256(toHex(sig)).slice(2)
const ERC20_TRANSFER = eventSig("Transfer(address,address,uint256)")

export default defineDataset(() => ({
  name: "portfolio_dapp",
  network: "anvil",
  version: "0.1.0",
  dependencies: {
    anvil: {
      owner: "graphprotocol",
      name: "anvil",
      version: "0.1.0",
    },
  },
  tables: {
    erc20_transfers: {
      sql: `
        SELECT
          logs.block_num,
          logs.tx_hash,
          logs.log_index,
          logs.address as token_address,
          logs.timestamp,
          SUBSTRING(logs.topic1, 13, 20) as from_address,
          SUBSTRING(logs.topic2, 13, 20) as to_address,
          logs.data as amount_raw
        FROM anvil.logs
        WHERE logs.topic0 = x'${ERC20_TRANSFER}'
      `,
    },
    blocks: {
      sql: `
        SELECT
          block_num,
          timestamp,
          hash
        FROM anvil.blocks
      `,
    },
  },
}))
