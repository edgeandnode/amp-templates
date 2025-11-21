import type { Address, Hash } from "viem"

/**
 * ERC20 Token Transfer type
 *
 * Represents a single ERC20 transfer event decoded from the blockchain.
 * Fields are derived from the Arrow Flight response and transformed from
 * snake_case to camelCase.
 */
export interface Transfer {
  /**
   * Block number where the transfer occurred
   */
  blockNum: number

  /**
   * Log index within the block
   */
  logIndex: number

  /**
   * Unix timestamp (seconds) of the block
   */
  txTimestamp: number

  /**
   * Address of the ERC20 token contract
   */
  tokenAddress: Address

  /**
   * Transaction hash
   */
  txHash: Hash

  /**
   * Sender address (from)
   */
  fromAddress: Address

  /**
   * Recipient address (to)
   */
  toAddress: Address

  /**
   * Raw amount transferred (in token's smallest unit)
   */
  amountRaw: bigint
}
