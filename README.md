# Ampsync Examples

Example apps and use-cases for the amp and ampsync crates to demo functionality and usage.

## Examples

- [nextjs-electricsql](./nextjs-electricsql/README.md). Demos the usage of the `ampsync` crate to sync data defined in the [nozzle.config.ts](./nextjs-electricsql/nozzle.config.ts) to the configured postgres database. Utilizes [electric-sql](https://electric-sql.com/docs/intro) to reactively sync the amp dataset data inserted into the postgres database and make it available in the nextjs ui.
  - Frameworks/services:
    - docker
      - postgres
      - anvil blockchain
      - amp
      - ampsync
      - electric-sql
    - nextjs app
