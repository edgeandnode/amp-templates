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

// Main schema with snake_case → camelCase transformation
export const erc20TransferSchema = z
  .object({
    tx_hash: hashSchema,
    log_index: z.number(),
    block_num: z.number(),
    tx_timestamp: timestampSchema,
    contract_address: addressSchema,
    from_address: addressSchema,
    to_address: addressSchema,
    amount_raw: z.union([z.bigint(), z.string().transform(BigInt), z.number().transform(BigInt)]),
  })
  .transform((data) => ({
    txHash: data.tx_hash,
    logIndex: data.log_index,
    blockNum: data.block_num,
    txTimestamp: data.tx_timestamp,
    contractAddress: data.contract_address,
    fromAddress: data.from_address,
    toAddress: data.to_address,
    amountRaw: data.amount_raw,
  }))

// Inferred type (replaces manual interface)
export type ERC20Transfer = z.infer<typeof erc20TransferSchema>

// Main parser function
export function parseERC20Transfer(data: unknown): ERC20Transfer {
  return erc20TransferSchema.parse(data)
}
