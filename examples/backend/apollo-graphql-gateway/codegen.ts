import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: './src/schema.ts',
  generates: {
    './src/types/generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../resolvers#Context',
        mappers: {
          // Map GraphQL types to actual data types
          Block: '../types/amp-data#BlockData',
          Transaction: '../types/amp-data#TransactionData',
          TransactionReceipt: '../types/amp-data#TransactionReceiptData',
          Log: '../types/amp-data#LogData',
        },
      },
    },
  },
}

export default config