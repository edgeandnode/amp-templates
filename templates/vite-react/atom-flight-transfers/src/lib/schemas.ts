import { Schema } from "effect"

/**
 * Effect Schema for Token Transfer (raw Arrow Flight format)
 *
 * Represents a single transfer event from Arrow Flight.
 * Fields match the database column names (snake_case).
 * This schema is used for Arrow data decoding.
 */
export class Transfer extends Schema.Class<Transfer>("Transfer")({
  block_num: Schema.NumberFromString,
  log_index: Schema.Number,
  timestamp: Schema.Number,
  token_address: Schema.String,
  tx_hash: Schema.String,
  sender: Schema.String,
  recipient: Schema.String,
  amount: Schema.NullOr(Schema.String),
}) {}

/**
 * Query error types for Arrow Flight operations
 */
export class QueryError extends Schema.TaggedError<QueryError>()("QueryError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}

export class SchemaDecodeError extends Schema.TaggedError<SchemaDecodeError>()("SchemaDecodeError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}

export class NetworkError extends Schema.TaggedError<NetworkError>()("NetworkError", {
  message: Schema.String,
  query: Schema.String,
  cause: Schema.Unknown,
}) {}
