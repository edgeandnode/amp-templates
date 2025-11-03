import { Schema } from "effect"

// ERC20 Transfer Event Schema
export const ERC20Transfer = Schema.Struct({
  block_hash: Schema.String,
  tx_hash: Schema.String,
  log_index: Schema.String,
  contract_address: Schema.String,
  block_num: Schema.String,
  tx_timestamp: Schema.String,
  from_address: Schema.String,
  to_address: Schema.String,
  amount_raw: Schema.String,
})

export type ERC20Transfer = typeof ERC20Transfer.Type

// Token Metadata
export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  chain: string
}

// Portfolio Balance
export interface PortfolioBalance {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  balance: bigint
  balanceFormatted: string
  decimals: number
  chain: string
}

// User Portfolio
export interface UserPortfolio {
  userAddress: string
  balances: PortfolioBalance[]
  totalTokens: number
}
