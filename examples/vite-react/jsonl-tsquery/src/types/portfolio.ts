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
