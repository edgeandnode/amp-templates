import { type Config, createConfig, createStorage, http } from "wagmi"
import { anvil } from "wagmi/chains"
import { porto } from "wagmi/connectors"

// Configure Reth chain
export const rethChain = {
  ...anvil,
  id: Number(import.meta.env.VITE_CHAIN_ID) || 1337, // Reth dev mode uses chain ID 1337
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
    porto(),
  ],
  storage: createStorage({ storage: localStorage }),
  transports: {
    [rethChain.id]: http(),
  },
})
