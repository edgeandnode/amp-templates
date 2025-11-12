import rootConfig from "../../eslint.config.mjs"
import codegen from "eslint-plugin-codegen"
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys"

export default [
  ...rootConfig,
  {
    plugins: {
      codegen,
      "sort-destructure-keys": sortDestructureKeys
    },

    rules: {
      // Additional package-specific rules
      "codegen/codegen": "error",
      "sort-destructure-keys/sort-destructure-keys": "error",

      // Package-specific TypeScript rules
      "@typescript-eslint/array-type": [
        "warn",
        {
          default: "generic",
          readonly: "generic"
        }
      ],
      "@typescript-eslint/consistent-type-imports": "warn"
    }
  }
]
