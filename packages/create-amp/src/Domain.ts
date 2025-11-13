import * as Schema from "effect/Schema"

export const AvailableTemplFrameworkKey = Schema.Literal(
  "backend-express",
  "backend-fastify",
  "backend-apollo-graphql",
  "backend-express-gateway",
  "backend-fastify-gateway",
  "backend-apollo-graphql-gateway",
  "nextjs",
  "react-ampsync-electricsql",
  "react-arrowflight-effect-atom",
  "react-jsonlines-effect-atom",
  "react-jsonlines-react-query"
)
export type AvailableTemplFrameworkKey = typeof AvailableTemplFrameworkKey.Type

export const AvailableTemplSchema = Schema.Struct({
  key: AvailableTemplFrameworkKey,
  name: Schema.NonEmptyTrimmedString,
  description: Schema.String,
  directory: Schema.NonEmptyTrimmedString.pipe(
    Schema.pattern(/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/),
    Schema.filter((dir) => dir.startsWith("/"))
  ),
  skip: Schema.Set(Schema.String)
})
export type AvailableTemplSchema = typeof AvailableTemplSchema.Type
