import { Result } from "@effect-atom/atom-react"
import * as Tabs from "@radix-ui/react-tabs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast, Toaster } from "sonner"
import { formatUnits } from "viem"
import { useAccount, useDisconnect, useReadContracts, WagmiProvider } from "wagmi"

import { PortfolioSection } from "./components/PortfolioSection"
import { TransactionHistory } from "./components/TransactionHistory"
import { TransferModal } from "./components/TransferModal"
import { WalletConnect } from "./components/WalletConnect"
import { wagmiConfig } from "./config/wagmi"
import { useAutoRefresh } from "./hooks/useAutoRefresh"
import { usePortfolioBalances } from "./hooks/usePortfolioBalances"
import { usePortfolioQuery } from "./hooks/usePortfolioQuery"

import "./App.css"

const ERC20_METADATA_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const

const queryClient = new QueryClient()

function PortfolioContent() {
  const { address, isConnected } = useAccount()

  // Enable automatic polling for transfer data (must be after address is defined)
  useAutoRefresh(address, 2000)
  const { disconnect } = useDisconnect()
  const { balances, isLoading, isError, refresh: refreshBalances } = usePortfolioBalances(address)
  const transfersResult = usePortfolioQuery(address)

  // Extract transfers from Result for use in effects and memos
  const transfers = Result.match(transfersResult, {
    onSuccess: (success) => success.value,
    onWaiting: (waiting) => waiting.value ?? [],
    onInitial: () => [],
    onFailure: () => [],
  })

  const seenTransferIdsRef = useRef<Set<string>>(new Set())
  const isInitialLoadRef = useRef<boolean>(true)

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

  // Get unique token addresses for metadata lookup
  const uniqueTokenAddresses = useMemo(
    () => Array.from(new Set(transfers?.map((t) => `${t.contractAddress}`) || [])),
    [transfers],
  )

  // Fetch token metadata for toast notifications
  const { data: tokenMetadata } = useReadContracts({
    contracts: uniqueTokenAddresses.flatMap((tokenAddress) => [
      { address: tokenAddress as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "symbol" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "decimals" },
    ]),
  })

  // Create token metadata map
  const tokenMetadataMap = useMemo(() => {
    const map = new Map<string, { symbol: string; decimals: number }>()
    uniqueTokenAddresses.forEach((tokenAddress, index) => {
      const metadataIndex = index * 2
      const symbolResult = tokenMetadata?.[metadataIndex]
      const decimalsResult = tokenMetadata?.[metadataIndex + 1]

      if (symbolResult?.status === "success" && decimalsResult?.status === "success") {
        map.set(tokenAddress.toLowerCase(), {
          symbol: symbolResult.result as string,
          decimals: decimalsResult.result as number,
        })
      }
    })
    return map
  }, [uniqueTokenAddresses, tokenMetadata])

  // Detect new received transfers and show toast
  useEffect(() => {
    if (!address || !transfers || transfers.length === 0) {
      // Reset initial load flag if transfers are cleared
      if (!transfers || transfers.length === 0) {
        isInitialLoadRef.current = true
      }
      return
    }

    const normalizedAddress = address.toLowerCase()
    const currentTransferIds = new Set<string>()

    // On initial load, mark all existing transfers as seen without showing toasts
    if (isInitialLoadRef.current) {
      transfers.forEach((transfer) => {
        const transferId = `${transfer.txHash}-${transfer.logIndex}`
        seenTransferIdsRef.current.add(transferId)
        currentTransferIds.add(transferId)
      })
      isInitialLoadRef.current = false
      return
    }

    // After initial load, only process truly new transfers
    transfers.forEach((transfer) => {
      const transferId = `${transfer.txHash}-${transfer.logIndex}`
      currentTransferIds.add(transferId)

      // Check if this is a received transfer and we haven't seen it before
      const toAddress = `${transfer.toAddress}`.toLowerCase()
      const isReceived = toAddress === normalizedAddress
      const isNewTransfer = !seenTransferIdsRef.current.has(transferId)

      if (isReceived && isNewTransfer) {
        const tokenAddress = `${transfer.contractAddress}`.toLowerCase()
        const metadata = tokenMetadataMap.get(tokenAddress)

        // Only show toast if we have metadata to ensure correct amounts
        if (metadata) {
          const decimals = metadata.decimals
          const symbol = metadata.symbol

          // Refresh balances immediately when new transfer is received
          refreshBalances()

          try {
            const amount = BigInt(transfer.amountRaw)
            const formatted = formatUnits(amount, decimals)
            const formattedAmount = parseFloat(formatted).toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })

            toast.success(`Received ${formattedAmount} ${symbol}`, {
              description: `Transaction: ${transfer.txHash.slice(0, 10)}...${transfer.txHash.slice(-8)}`,
              duration: 5000,
            })

            // Only mark as seen after successfully showing the toast
            seenTransferIdsRef.current.add(transferId)
          } catch (error) {
            console.error("Error formatting transfer amount:", error)
            toast.success(`Received ${symbol}`, {
              description: `New transfer received`,
              duration: 5000,
            })

            // Mark as seen even if formatting failed
            seenTransferIdsRef.current.add(transferId)
          }
        }
        // If metadata not available yet, don't mark as seen - we'll try again when metadata loads
        // This prevents showing toasts on refresh (since metadata won't be ready initially)
        // and ensures we show the toast once metadata is available
      } else {
        // Mark non-received or already-seen transfers as seen
        seenTransferIdsRef.current.add(transferId)
      }
    })

    // Clean up old transfer IDs that are no longer in the list
    if (seenTransferIdsRef.current.size > currentTransferIds.size * 2) {
      seenTransferIdsRef.current = currentTransferIds
    }
  }, [transfers, address, tokenMetadataMap])

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
          {isConnected && (
            <button
              onClick={() => disconnect()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Disconnect Wallet
            </button>
          )}
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

              <Tabs.Root defaultValue="portfolio" className="space-y-4">
                <Tabs.List className="flex gap-2 border-b border-gray-700">
                  <Tabs.Trigger
                    value="portfolio"
                    className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
                  >
                    Portfolio
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="history"
                    className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
                  >
                    Transaction History
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="portfolio" className="mt-4">
                  <PortfolioSection
                    balances={balances}
                    isLoading={isLoading}
                    isError={isError}
                    onTransfer={handleTransferClick}
                  />
                </Tabs.Content>

                <Tabs.Content value="history" className="mt-4">
                  <TransactionHistory address={address} />
                </Tabs.Content>
              </Tabs.Root>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Built with Vite, React, Effect Atom, Arrow Flight, and TanStack Table</p>
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
          onSuccess={refreshBalances}
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
