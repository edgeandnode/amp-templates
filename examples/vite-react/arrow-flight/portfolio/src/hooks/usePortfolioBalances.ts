import { Result, useAtomRefresh, useAtomValue } from "@effect-atom/atom-react"
import { useCallback, useMemo } from "react"
import { type Address, formatUnits } from "viem"
import { useReadContracts } from "wagmi"

import { userTransfersAtom } from "../lib/atoms"
import type { PortfolioBalance } from "../types/portfolio"

const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
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
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

/**
 * Hybrid hook that combines Effect Atom transfers with Wagmi blockchain queries.
 *
 * This hook uses a hybrid pattern because it orchestrates two different data sources:
 * 1. Effect Atom (Arrow Flight SQL) - for transfer history
 * 2. Wagmi (RPC) - for real-time token balances
 *
 * The hook uses transfers to determine which tokens to query, then fetches current
 * balances from the blockchain. 
 *
 * @param userAddress - User wallet address
 *
 * @returns Object with:
 *   - balances: Array of token balances with metadata
 *   - isLoading: True if either transfers or balance queries are loading
 *   - isError: True if either source failed
 *   - refresh: Function to refresh both transfers and balances
 *
 * @example
 * ```tsx
 * function Portfolio({ address }: Props) {
 *   const { balances, isLoading, isError, refresh } = usePortfolioBalances(address)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (isError) return <ErrorCard />
 *   return <PortfolioTable balances={balances} />
 * }
 * ```
 */
export function usePortfolioBalances(userAddress?: Address) {
  // Use a dummy address if none provided to satisfy React hooks rules
  const effectiveAddress = userAddress || ("0x0000000000000000000000000000000000000000" as Address)

  // Get transfers from atoms (Result type)
  const transfersResult = useAtomValue(userTransfersAtom(effectiveAddress))

  // Extract unique token addresses from transfers, handling all Result states
  const uniqueTokenAddresses = useMemo(() => {
    if (!userAddress) return []

    // Handle Result type - extract transfers from any state that has them
    return Result.match(transfersResult, {
      onSuccess: (success) => {
        const tokenSet = new Set<string>()
        success.value.forEach((transfer) => {
          tokenSet.add(transfer.contractAddress.toLowerCase())
        })
        return Array.from(tokenSet)
      },
      onWaiting: (waiting) => {
        // Use previous transfers during refresh
        const transfers = waiting.value ?? []
        const tokenSet = new Set<string>()
        transfers.forEach((transfer) => {
          tokenSet.add(transfer.contractAddress.toLowerCase())
        })
        return Array.from(tokenSet)
      },
      onInitial: () => [],
      onFailure: () => [],
    })
  }, [transfersResult, userAddress])

  // Read balances and metadata from blockchain using Wagmi
  const {
    data: contractData,
    isLoading: isLoadingContracts,
    isError: isErrorContracts,
    refetch,
  } = useReadContracts({
    contracts: uniqueTokenAddresses.flatMap((address) => [
      { address: address as Address, abi: ERC20_ABI, functionName: "symbol" },
      { address: address as Address, abi: ERC20_ABI, functionName: "name" },
      { address: address as Address, abi: ERC20_ABI, functionName: "decimals" },
      {
        address: address as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [userAddress!],
      },
    ]),
    query: {
      enabled: uniqueTokenAddresses.length > 0 && !!userAddress,
    },
  })

  // Get atom refresh function
  const refreshTransfers = useAtomRefresh(userTransfersAtom(effectiveAddress))

  // Combined refresh function that updates both transfers and balances
  const refresh = useCallback(async () => {
    // Refresh the transfers atom to get latest transaction data
    refreshTransfers()
    // Refetch balance data from blockchain
    await refetch()
  }, [refreshTransfers, refetch])

  const balances = useMemo(() => {
    if (!contractData || !userAddress) return []

    const portfolioBalances: PortfolioBalance[] = []

    uniqueTokenAddresses.forEach((tokenAddress, index) => {
      const dataIndex = index * 4
      const symbolResult = contractData[dataIndex]
      const nameResult = contractData[dataIndex + 1]
      const decimalsResult = contractData[dataIndex + 2]
      const balanceResult = contractData[dataIndex + 3]

      if (
        symbolResult?.status === "success" &&
        nameResult?.status === "success" &&
        decimalsResult?.status === "success" &&
        balanceResult?.status === "success"
      ) {
        const balance = balanceResult.result as bigint
        // Only include tokens with positive balances
        if (balance > 0n) {
          portfolioBalances.push({
            tokenAddress: tokenAddress.startsWith("0x") ? tokenAddress : `0x${tokenAddress}`,
            tokenSymbol: symbolResult.result as string,
            tokenName: nameResult.result as string,
            balance,
            balanceFormatted: formatUnits(balance, decimalsResult.result as number),
            decimals: decimalsResult.result as number,
            chain: "Anvil",
          })
        }
      }
    })

    return portfolioBalances.sort((a, b) => a.tokenSymbol.localeCompare(b.tokenSymbol))
  }, [contractData, uniqueTokenAddresses, userAddress])

  // Combine loading and error states from both sources
  // Only show loading during initial load or when we have no data to display
  // During refresh (Waiting state), don't show loading if we have previous data (prevents flicker)
  const isLoading =
    Result.isInitial(transfersResult) ||
    (Result.isWaiting(transfersResult) && !transfersResult.value) ||
    (isLoadingContracts && balances.length === 0)

  const isError = Result.isFailure(transfersResult) || isErrorContracts

  return {
    balances,
    isLoading,
    isError,
    refresh,
  }
}
