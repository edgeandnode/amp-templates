import { gql } from "graphql-tag"

export const typeDefs = gql`
  type Query {
    """
    Get health status of the server
    """
    health: HealthStatus!
    
    """
    Get blocks from the Arbitrum One blockchain
    """
    blocks(limit: Int = 10, offset: Int = 0): BlockConnection!
    
    """
    Get transactions from the Arbitrum One blockchain
    """
    transactions(limit: Int = 10, offset: Int = 0): TransactionConnection!
    
    
    """
    Get logs from the Arbitrum One blockchain
    """
    logs(limit: Int = 10, offset: Int = 0, contractAddress: String, topics: [String]): LogConnection!
    
    """
    Execute a custom SQL query against the edgeandnode/arbitrum_one dataset
    """
    executeQuery(query: String!): QueryResult!
  }

  type HealthStatus {
    status: String!
    service: String!
    timestamp: String!
    gateway: String!
  }

  type BlockConnection {
    data: [Block!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Block {
    block_num: String!
    timestamp: String!
    hash: String!
    parent_hash: String!
    ommers_hash: String!
    miner: String!
    state_root: String!
    transactions_root: String!
    receipt_root: String!
    logs_bloom: String!
    difficulty: String!
    total_difficulty: String
    gas_limit: String!
    gas_used: String!
    extra_data: String!
    mix_hash: String!
    nonce: String!
    base_fee_per_gas: String
    withdrawals_root: String
    blob_gas_used: String
    excess_blob_gas: String
    parent_beacon_root: String
  }

  type TransactionConnection {
    data: [Transaction!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Transaction {
    block_hash: String!
    block_num: String!
    timestamp: String!
    tx_index: String!
    tx_hash: String!
    to: String
    nonce: String!
    gas_price: String
    gas_limit: String!
    value: String!
    input: String!
    v: String!
    r: String!
    s: String!
    gas_used: String!
    type: String!
    max_fee_per_gas: String
    max_priority_fee_per_gas: String
    max_fee_per_blob_gas: String
    from: String!
    status: Boolean!
  }


  type LogConnection {
    data: [Log!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Log {
    block_hash: String!
    block_num: String!
    timestamp: String!
    tx_hash: String!
    tx_index: String!
    log_index: String!
    address: String!
    topic0: String
    topic1: String
    topic2: String
    topic3: String
    data: String!
  }

  type QueryResult {
    data: [QueryResultRow!]!
    rowCount: Int!
    executionTime: Float
  }

  """
  Generic query result row - fields depend on the SQL query executed
  """
  scalar QueryResultRow
`