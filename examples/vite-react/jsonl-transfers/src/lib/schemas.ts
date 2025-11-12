import { type Address, getAddress, type Hash, isAddress } from "viem"
import { z } from "zod"

// Custom Zod validators for viem types
const addressSchema = z.string().transform((val, ctx) => {
  const normalized = val.startsWith("0x") ? val : `0x${val}`
  if (!isAddress(normalized)) {
    ctx.addIssue({
      code: "custom",
      message: `Invalid Ethereum address: ${val}`,
    })
    return z.NEVER
  }
  return getAddress(normalized) as Address
})

const hashSchema = z.string().transform((val) => {
  return (val.startsWith("0x") ? val : `0x${val}`) as Hash
})

const timestampSchema = z.string().transform((val, ctx) => {
  const timestamp = new Date(val).getTime() / 1000
  if (isNaN(timestamp)) {
    ctx.addIssue({
      code: "custom",
      message: `Invalid ISO timestamp: ${val}`,
    })
    return z.NEVER
  }
  return timestamp
})

// Anvil block schema
// Note: Fields match the actual Amp JSONLines API response format
export const anvilBlockSchema = z.object({
  block_num: z.number(), // Block number as integer
  timestamp: z.string(), // ISO 8601 timestamp string from database
  hash: z.string(), // Hex-encoded hash
  nonce: z.number(), // Nonce as integer
})

// Inferred type
export type AnvilBlock = z.infer<typeof anvilBlockSchema>

// Parser function
export function parseAnvilBlock(data: unknown): AnvilBlock {
  return anvilBlockSchema.parse(data)
}

// ERC20 Token Transfer schema with snake_case → camelCase transformation
// Note: Fields match the actual Amp JSONLines API response format for ERC20 transfers
// Note: amount field is optional because evm_decode_log may fail for malformed events
export const erc20TransferSchema = z
  .object({
    block_num: z.number(),
    timestamp: timestampSchema,
    token_address: addressSchema,
    tx_hash: hashSchema,
    sender: addressSchema,
    recipient: addressSchema,
    amount: z
      .union([z.bigint(), z.string().transform(BigInt), z.number().transform(BigInt)])
      .optional()
      .default(0n),
  })
  .transform((data) => ({
    blockNum: data.block_num,
    txTimestamp: data.timestamp,
    tokenAddress: data.token_address,
    txHash: data.tx_hash,
    fromAddress: data.sender,
    toAddress: data.recipient,
    amountRaw: data.amount,
  }))

// Inferred type
export type ERC20Transfer = z.infer<typeof erc20TransferSchema>

// Parser function
export function parseERC20Transfer(data: unknown): ERC20Transfer {
  return erc20TransferSchema.parse(data)
}
