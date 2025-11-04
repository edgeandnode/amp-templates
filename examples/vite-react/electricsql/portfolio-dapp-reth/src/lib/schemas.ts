import { Schema } from "effect"
import { type Address, getAddress, type Hash } from "viem"

const AddressFromSelf: Schema.Schema<Address> = Schema.String.pipe(
  Schema.pattern(/^0x[0-9a-fA-F]{40}$/),
  Schema.transform(Schema.String, {
    decode: (address) => getAddress(address as Address),
    encode: (address) => getAddress(address as Address),
    strict: true,
  }),
).pipe(Schema.asSchema) as any

const AddressFromString = Schema.String.pipe(
  Schema.transform(AddressFromSelf, {
    decode: (address) => getAddress(address.startsWith("0x") ? address : (`0x${address}` as Address)),
    encode: (address) => getAddress(address.startsWith("0x") ? address : (`0x${address}` as Address)),
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
  blockNum: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("block_num")),
  txTimestamp: Schema.Number.pipe(Schema.propertySignature, Schema.fromKey("tx_timestamp")),
  contractAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("contract_address")),
  fromAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("from_address")),
  toAddress: AddressFromString.pipe(Schema.propertySignature, Schema.fromKey("to_address")),
  amountRaw: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("amount_raw")),
}) {}
