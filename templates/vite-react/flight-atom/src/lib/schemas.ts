import { Schema } from "effect"
import { type Address, getAddress, type Hash } from "viem"

const AddressFromSelf: Schema.Schema<Address> = Schema.String.pipe(
  Schema.pattern(/^0x[0-9a-fA-F]{40}$/),
  Schema.transform(Schema.String, {
    decode: (address) => {
      try {
        return getAddress(address as Address)
      } catch (_error) {
        throw new Error(`Invalid Ethereum address: ${address}`)
      }
    },
    encode: (address) => {
      try {
        return getAddress(address as Address)
      } catch (_error) {
        throw new Error(`Invalid Ethereum address: ${address}`)
      }
    },
    strict: true,
  }),
).pipe(Schema.asSchema) as any

const AddressFromString = Schema.String.pipe(
  Schema.transform(AddressFromSelf, {
    decode: (address) => {
      try {
        const normalized = address.startsWith("0x") ? address : `0x${address}`
        return getAddress(normalized as Address)
      } catch (_error) {
        throw new Error(`Invalid Ethereum address format: ${address}`)
      }
    },
    encode: (address) => {
      try {
        const normalized = address.startsWith("0x") ? address : `0x${address}`
        return getAddress(normalized as Address)
      } catch (_error) {
        throw new Error(`Invalid Ethereum address format: ${address}`)
      }
    },
    strict: true,
  }),
).pipe(Schema.asSchema)

const HashFromString = Schema.String.pipe(
  Schema.transform(Schema.String, {
    decode: (hash) => (hash.startsWith("0x") ? hash : (`0x${hash}` as Hash)),
    encode: (hash) => (hash.startsWith("0x") ? hash : (`0x${hash}` as Hash)),
    strict: true,
  }),
)

export class ERC20Transfer extends Schema.Class<ERC20Transfer>("ERC20Transfer")({
  txHash: HashFromString.pipe(Schema.propertySignature, Schema.fromKey("tx_hash")),
  logIndex: Schema.Number.pipe(Schema.propertySignature, Schema.fromKey("log_index")),
  blockNum: Schema.BigInt.pipe(Schema.propertySignature, Schema.fromKey("block_num")),
  txTimestamp: Schema.Number.pipe(Schema.propertySignature, Schema.fromKey("tx_timestamp")),
  contractAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("contract_address")),
  fromAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("from_address")),
  toAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("to_address")),
  amountRaw: Schema.BigInt.pipe(Schema.propertySignature, Schema.fromKey("amount_raw")),
}) {}
