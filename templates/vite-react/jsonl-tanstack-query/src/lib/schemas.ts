import { type Address, getAddress, type Hash, isAddress } from "viem"

export interface ERC20Transfer {
  txHash: Hash
  logIndex: number
  blockNum: number
  txTimestamp: number
  contractAddress: Address
  fromAddress: Address
  toAddress: Address
  amountRaw: bigint
}

// Validation helper functions

function validateAddress(value: unknown, field: string): Address {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`)
  }

  const normalized = value.startsWith("0x") ? value : `0x${value}`

  if (!isAddress(normalized)) {
    throw new Error(`${field} is not a valid address: ${value}`)
  }

  return getAddress(normalized)
}

function validateHash(value: unknown, field: string): Hash {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`)
  }

  const normalized = value.startsWith("0x") ? value : `0x${value}`
  return normalized as Hash
}

function validateNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`${field} must be a valid number`)
  }
  return value
}

function validateTimestamp(value: unknown, field: string): number {
  if (typeof value !== "string") {
    throw new Error(`${field} must be an ISO string`)
  }

  const timestamp = new Date(value).getTime() / 1000
  if (isNaN(timestamp)) {
    throw new Error(`${field} is not a valid ISO timestamp: ${value}`)
  }
  return timestamp
}

function validateBigInt(value: unknown, field: string): bigint {
  if (typeof value === "bigint") return value
  if (typeof value === "string" || typeof value === "number") {
    try {
      return BigInt(value)
    } catch {
      throw new Error(`${field} is not a valid bigint: ${value}`)
    }
  }
  throw new Error(`${field} must be a bigint, string, or number`)
}

// Main parser function

export function parseERC20Transfer(data: unknown): ERC20Transfer {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid transfer data: expected object")
  }

  const raw = data as Record<string, unknown>

  return {
    txHash: validateHash(raw.tx_hash, "tx_hash"),
    logIndex: validateNumber(raw.log_index, "log_index"),
    blockNum: validateNumber(raw.block_num, "block_num"),
    txTimestamp: validateTimestamp(raw.tx_timestamp, "tx_timestamp"),
    contractAddress: validateAddress(raw.contract_address, "contract_address"),
    fromAddress: validateAddress(raw.from_address, "from_address"),
    toAddress: validateAddress(raw.to_address, "to_address"),
    amountRaw: validateBigInt(raw.amount_raw, "amount_raw"),
  }
}
