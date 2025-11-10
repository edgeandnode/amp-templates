import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { type Address, formatUnits } from "viem"
import { useReadContracts } from "wagmi"

import { getUserTransfers, POLLING_INTERVAL } from "../lib/api"
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
 * Hybrid hook that combines TanStack Query transfers with Wagmi blockchain queries.
 *
 * This hook uses a hybrid pattern because it orchestrates two different data sources:
 * 1. TanStack Query (Arrow Flight SQL) - for transfer history
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
  // Fetch transfers via TanStack Query
  const {
    data: transfers = [],
    isLoading: isLoadingTransfers,
    isError: isErrorTransfers,
    refetch: refetchTransfers,
  } = useQuery({
    queryKey: ["transfers", userAddress],
    queryFn: ({ signal }) => getUserTransfers(userAddress!, signal),
    enabled: !!userAddress,
    refetchInterval: POLLING_INTERVAL,
    placeholderData: (prev) => prev,
  })

  // Extract unique token addresses
  const uniqueTokenAddresses = useMemo(() => {
    if (!userAddress) return []
    const tokenSet = new Set<string>()
    transfers.forEach((transfer) => {
      tokenSet.add(transfer.contractAddress.toLowerCase())
    })
    return Array.from(tokenSet)
  }, [transfers, userAddress])

  // Fetch token metadata and balances from blockchain
  const {
    data: contractData,
    isLoading: isLoadingContracts,
    isError: isErrorContracts,
    refetch: refetchContracts,
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

  // Combined refresh function
  const refresh = async () => {
    await Promise.all([refetchTransfers(), refetchContracts()])
  }

  // Process balances
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
        const balance = BigInt(balanceResult.result)
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

  const isLoading = isLoadingTransfers || (isLoadingContracts && balances.length === 0)
  const isError = isErrorTransfers || isErrorContracts

  return {
    balances,
    isLoading,
    isError,
    refresh,
  }
}
