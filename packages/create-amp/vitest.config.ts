import { defineConfig, mergeConfig } from "vitest/config"

import shared from "../../vitest.shared"

const config = defineConfig({
  test: {
    environment: "node",
  },
})

export default mergeConfig(shared, config)
