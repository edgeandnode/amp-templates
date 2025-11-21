import { Atom } from "@effect-atom/atom-react"

import { query } from "./query.ts"
import { runtime } from "./runtime.ts"

// Amp SQL Query configuration
const dataset_ref = "edgeandnode/ethereum_mainnet@0.0.1" // Replace with Amp dataset name
const dataset_table = "logs" // Replace with Amp table name
const transfer_event = "Transfer(address indexed from, address indexed to, uint256 value)" // Replace with Event signature
const starting_block = 23837000 // Replace with earliest block_num needed
const limit_number = 50 // Replace with earliest block_num needed

// Transfers event query for Arrow Flight
export const transfers_event_query = `
  SELECT
    block_num,
    log_index,
    timestamp,
    token_address,
    tx_hash,
    event['from'] as sender,
    event['to'] as recipient,
    event['value'] as amount
  FROM (
    SELECT
      block_num,
      log_index,
      timestamp,
      address as token_address,
      tx_hash,
      evm_decode_log(topic1, topic2, topic3, data, '${transfer_event}') as event
    FROM "${dataset_ref}"."${dataset_table}"
    WHERE topic0 = evm_topic('${transfer_event}')
    AND block_num >= ${starting_block}
  )
  ORDER BY block_num DESC
  LIMIT ${limit_number}
`

/**
 * Global atom for token transfer events
 *
 * This atom executes the Arrow Flight query using non-streaming mode
 * (getFlightInfo + doGet without "amp-stream" header).
 *
 * Features:
 * - Uses Effect Schema for type-safe validation
 * - Arrow data encode/decode pipeline
 * - Persists across component unmounts with keepAlive
 * - Shared state across all components
 *
 * The query uses:
 * - Stream.take(1) to get first batch only
 * - evm_decode_log for server-side event decoding
 */
export const transfersAtom = runtime.atom(query(transfers_event_query)).pipe(Atom.keepAlive)
