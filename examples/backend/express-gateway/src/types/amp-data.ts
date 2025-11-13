/**
 * TypeScript interfaces for AMP Gateway data
 * Based on the edgeandnode/arbitrum_one@0.0.1 dataset schema
 */

export interface BlockData {
  block_num: string
  timestamp: string
  hash: string
  parent_hash: string
  ommers_hash: string
  miner: string
  state_root: string
  transactions_root: string
  receipt_root: string
  logs_bloom: string
  difficulty: string
  total_difficulty?: string
  gas_limit: string
  gas_used: string
  extra_data: string
  mix_hash: string
  nonce: string
  base_fee_per_gas?: string
  withdrawals_root?: string
  blob_gas_used?: string
  excess_blob_gas?: string
  parent_beacon_root?: string
}

export interface TransactionData {
  block_hash: string
  block_num: string
  timestamp: string
  tx_index: string
  tx_hash: string
  to?: string
  nonce: string
  gas_price?: string
  gas_limit: string
  value: string
  input: string
  v: string
  r: string
  s: string
  gas_used: string
  type: string
  max_fee_per_gas?: string
  max_priority_fee_per_gas?: string
  max_fee_per_blob_gas?: string
  from: string
  status: boolean
}

export interface LogData {
  block_hash: string
  block_num: string
  timestamp: string
  tx_hash: string
  tx_index: string
  log_index: string
  address: string
  topic0?: string
  topic1?: string
  topic2?: string
  topic3?: string
  data: string
}

export interface QueryResultData {
  [key: string]: any
}

// Connection types for pagination
export interface ConnectionResult<T> {
  data: T[]
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Query execution result
export interface QueryExecutionResult {
  data: QueryResultData[]
  rowCount: number
  executionTime?: number
}

// Health check result
export interface HealthResult {
  status: string
  timestamp: string
}

