import { createConfig, http } from "wagmi"
import { anvil } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Configure Anvil chain
export const anvilChain = {
  ...anvil,
  id: Number(import.meta.env.VITE_CHAIN_ID) || 31337,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_ANVIL_RPC_URL || "http://localhost:8545"],
    },
  },
}

export const wagmiConfig = createConfig({
  chains: [anvilChain],
  connectors: [injected()],
  transports: {
    [anvilChain.id]: http(),
  },
})
