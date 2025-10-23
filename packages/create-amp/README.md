# @edgeandnode/create-amp

Command-line interface tool to scaffold applications utilizing amp, built off predefined templates.

## Getting Started

There are two main ways to use `@edgeandnode/create-amp`:

### Interactive

The easiest way is to go through the interactive flow, that breaks down the options step-by-step, using your preferred package manager:

`npm`

```bash
npx @edgeandnode/create-amp [project name]
```

`pnpm`

```bash
pnpm create @edgeandnode/amp [project name]
```

`yarn`

```bash
yarn create @edgeandnode/amp [project name]
```

`bun`

```bash
bunx @edgeandnode/create-amp [project name]
```

The CLI will then prompt you to selext the template you would like to create (`nextjs` or `vite+react` for example) then will provide you with additional customization options.
(See the full [usage](#usage) documentation below).

### Non-Interactive

The `@edgeandnode/create-amp` cli can also be invoked non-interactively by providing all args/options.

#### Usage
