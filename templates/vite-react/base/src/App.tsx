// [Additions](ampsync-electricsql):imports
// [Additions](flight-atom):imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"

import { WalletConnect } from "./components/WalletConnect"
import { wagmiConfig } from "./config/wagmi"

import "./App.css"

const queryClient = new QueryClient()

function AppContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Amp App</h1>
        <p className="mb-8 text-lg text-gray-600">
          Connect your wallet to get started
        </p>
        <div className="flex justify-center">
          <WalletConnect />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App