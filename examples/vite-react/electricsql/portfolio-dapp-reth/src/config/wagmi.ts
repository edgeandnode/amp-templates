import { type Config, createConfig, createStorage, http } from "wagmi"
import { anvil } from "wagmi/chains"
import { injected, porto } from "wagmi/connectors"

// Configure Reth chain (using same chain ID as Anvil for local dev)
export const rethChain = {
  ...anvil,
  id: Number(import.meta.env.VITE_CHAIN_ID) || 31337,
  name: "Reth Local",
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RETH_RPC_URL || "http://localhost:8545"],
    },
  },
} as const

export const wagmiConfig: Config = createConfig({
  chains: [rethChain],
  connectors: [
    injected(),
    porto(),
  ],
  storage: createStorage({ storage: localStorage }),
  transports: {
    [rethChain.id]: http(),
  },
})
