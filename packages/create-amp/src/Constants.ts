export const ALWAYS_SKIP_DIRECTORIES = ["node_modules", ".git"]

export const PackageManager = ["pnpm", "bun", "yarn", "npm"] as const
export type PackageManager = (typeof PackageManager)[number]
