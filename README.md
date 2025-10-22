# Amp Examples

Monorepo containing Amp example apps and Create Amp utility that can be used to generate Amp applications using different frameworks


## Structure

```
amp-templates/
├── packages/
│   └── create-amp/       # CLI utility for generating Amp applications
├── templates/            # Templates used by Create Amp CLI
└── examples/
    └── nextjs-electricsql/  # Next.js with Electric SQL integration
```

## Templates

Templates used by Create Amp CLI utility to generate app code

## Examples

Example apps and use-cases for the amp and ampsync crates to demo functionality and usage.

- [nextjs-electricsql](./examples/nextjs-electricsql/README.md). Demos the usage of the `ampsync` crate to sync data defined in the [amp.config.ts](./examples/nextjs-electricsql/amp.config.ts) to the configured postgres database. Utilizes [electric-sql](https://electric-sql.com/docs/intro) to reactively sync the amp dataset data inserted into the postgres database and make it available in the nextjs ui.
  - Frameworks/services:
    - docker
      - postgres
      - anvil blockchain
      - amp
      - ampsync
      - electric-sql
    - nextjs app
