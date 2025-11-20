import { getAddress, type Address, type Hash } from "viem"

import type { Transfer as TransferSchema } from "./schemas.ts"
import type { Transfer as TransferUI } from "@/types/transfer.ts"

/**
 * Transform Transfer from Arrow schema format to UI format
 *
 * Converts:
 * - snake_case → camelCase field names
 * - ISO timestamp string → Unix timestamp (seconds)
 * - Hex strings → viem Address and Hash types
 * - String/number amounts → BigInt
 *
 * @param transfer - Transfer from Arrow Flight query
 * @returns Transfer formatted for UI consumption
 */
export function transformTransfer(transfer: TransferSchema): TransferUI {
  return {
    blockNum: transfer.block_num,
    logIndex: transfer.log_index,
    txTimestamp: new Date(transfer.timestamp).getTime() / 1000,
    tokenAddress: normalizeAddress(transfer.token_address),
    txHash: normalizeHash(transfer.tx_hash),
    fromAddress: normalizeAddress(transfer.sender),
    toAddress: normalizeAddress(transfer.recipient),
    amountRaw: normalizeAmount(transfer.amount),
  }
}

/**
 * Normalize an address string to checksummed Address type
 */
function normalizeAddress(address: string): Address {
  const hex = address.startsWith("0x") ? address : `0x${address}`
  return getAddress(hex) as Address
}

/**
 * Normalize a hash string to Hash type with 0x prefix
 */
function normalizeHash(hash: string): Hash {
  return (hash.startsWith("0x") ? hash : `0x${hash}`) as Hash
}

/**
 * Normalize amount to BigInt
 * Handles string, number, bigint, or null inputs
 * Returns 0n for null amounts
 */
function normalizeAmount(amount: string | number | bigint | null): bigint {
  if (amount === null) {
    return 0n
  }
  if (typeof amount === "bigint") {
    return amount
  }
  if (typeof amount === "number") {
    return BigInt(amount)
  }
  // String
  return BigInt(amount)
}
