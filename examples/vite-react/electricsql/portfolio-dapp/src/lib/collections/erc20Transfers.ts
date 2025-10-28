import type {} from "@standard-schema/spec"

import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { createCollection } from "@tanstack/react-db"
import { Schema } from "effect"

const AddressOrTxHashSchema = Schema.transform(Schema.String, Schema.String, {
  strict: true,
  decode: (s) => {
    const hex = s.replace(/^\\x/, "")
    return `0x${hex}`
  },
  encode: (s) => {
    const hex = s.replace(/^0x/, "")
    return `\\x${hex}`
  },
})

export const ERC20Transfer = Schema.Struct({
  blockNum: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("block_num")),
  txHash: AddressOrTxHashSchema.pipe(Schema.propertySignature, Schema.fromKey("tx_hash")),
  logIndex: Schema.BigIntFromSelf.pipe(Schema.propertySignature, Schema.fromKey("log_index")),
  txTimestamp: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("tx_timestamp")),
  tokenAddress: AddressOrTxHashSchema.pipe(Schema.propertySignature, Schema.fromKey("contract_address")),
  fromAddress: AddressOrTxHashSchema.pipe(Schema.propertySignature, Schema.fromKey("from_address")),
  toAddress: AddressOrTxHashSchema.pipe(Schema.propertySignature, Schema.fromKey("to_address")),
  amountRaw: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("amount_raw")),
})

export type ERC20Transfer = typeof ERC20Transfer.Type

export const erc20TransfersCollection = createCollection(
  electricCollectionOptions({
    id: "erc20_transfers",
    shapeOptions: {
      url: `http://localhost:3001/api/shape-proxy/transfers`,
      transformer(message) {
        return Schema.decodeUnknownSync(ERC20Transfer)(message)
      },
    },
    schema: Schema.standardSchemaV1(ERC20Transfer),
    getKey(item) {
      return `${item.txHash}-${item.logIndex}`
    },
  }),
)
