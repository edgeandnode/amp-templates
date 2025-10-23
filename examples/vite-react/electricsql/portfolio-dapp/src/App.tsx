import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Toaster } from "sonner"
import { useAccount, WagmiProvider } from "wagmi"

import { PortfolioTable } from "./components/PortfolioTable"
import { TransferModal } from "./components/TransferModal"
import { WalletConnect } from "./components/WalletConnect"
import { wagmiConfig } from "./config/wagmi"
import { usePortfolioBalances } from "./hooks/usePortfolioBalances"

import "./App.css"

const queryClient = new QueryClient()

function PortfolioContent() {
  const { address, isConnected } = useAccount()
  const { balances, isLoading, isError } = usePortfolioBalances(address)
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean
    tokenAddress: string
    tokenSymbol: string
    decimals: number
  }>({
    isOpen: false,
    tokenAddress: "",
    tokenSymbol: "",
    decimals: 18,
  })

  const handleTransferClick = (tokenAddress: string, tokenSymbol: string) => {
    const balance = balances.find((b) => b.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())
    if (balance) {
      setTransferModal({
        isOpen: true,
        tokenAddress,
        tokenSymbol,
        decimals: balance.decimals,
      })
    }
  }

  const closeModal = () => {
    setTransferModal({
      isOpen: false,
      tokenAddress: "",
      tokenSymbol: "",
      decimals: 18,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Portfolio DApp</h1>
            <p className="mt-2 text-gray-400">Track and manage your ERC20 tokens in real-time</p>
          </div>
          <WalletConnect />
        </header>

        <main>
          {!isConnected && (
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-12 text-center">
              <h2 className="mb-4 text-2xl font-semibold text-white">Connect Your Wallet</h2>
              <p className="mb-6 text-gray-400">Connect your MetaMask wallet to view your portfolio</p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          )}

          {isConnected && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
                <h2 className="mb-2 text-xl font-semibold text-white">Your Portfolio</h2>
                <p className="text-sm text-gray-400">
                  Address: <span className="font-mono">{address}</span>
                </p>
                <p className="mt-1 text-sm text-gray-400">Total Tokens: {balances.length}</p>
              </div>

              {isError && (
                <div className="rounded-lg border border-red-700 bg-red-900/20 p-4">
                  <p className="text-sm text-red-400">Error loading portfolio data</p>
                </div>
              )}

              {isLoading && (
                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-400">Loading portfolio data...</p>
                </div>
              )}

              {!isLoading && !isError && <PortfolioTable balances={balances} onTransfer={handleTransferClick} />}
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Built with Vite, React, Electric SQL, amp-sync, and TanStack Table</p>
          <p className="mt-1">Powered by Anvil local blockchain</p>
        </footer>
      </div>

      {transferModal.isOpen && (
        <TransferModal
          isOpen={transferModal.isOpen}
          onClose={closeModal}
          tokenAddress={transferModal.tokenAddress}
          tokenSymbol={transferModal.tokenSymbol}
          decimals={transferModal.decimals}
        />
      )}

      <Toaster position="top-right" theme="dark" />
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PortfolioContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
