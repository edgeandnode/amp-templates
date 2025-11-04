import { useCallback, useMemo } from "react"
import { type Address, formatUnits } from "viem"
import { useReadContracts } from "wagmi"

import { usePortfolioQuery } from "./usePortfolioQuery"
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

export function usePortfolioBalances(userAddress?: Address) {
  // Get transfers from ElectricSQL to determine which tokens the user has interacted with
  const { transfers } = usePortfolioQuery(userAddress)

  // Extract unique token addresses from transfer history
  const uniqueTokenAddresses = useMemo(() => {
    if (!userAddress) return []

    const tokenSet = new Set<string>()
    transfers.forEach((transfer) => {
      tokenSet.add(transfer.contractAddress.toLowerCase())
    })
    return Array.from(tokenSet)
  }, [transfers, userAddress])

  // Read balances and metadata directly from contracts using WAGMI
  const {
    data: contractData,
    isLoading: isLoadingContracts,
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

  // Combined refresh function that updates both transfers and balances
  const refresh = useCallback(async () => {
    // ElectricSQL automatically syncs transfers, so we just need to refetch balance data from blockchain
    await refetch()
  }, [refetch])

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
        const balance = BigInt(balanceResult.result as string | number | bigint)
        // Only include tokens with positive balances
        if (balance > 0n) {
          portfolioBalances.push({
            tokenAddress: tokenAddress.startsWith("0x") ? tokenAddress : `0x${tokenAddress}`,
            tokenSymbol: symbolResult.result as string,
            tokenName: nameResult.result as string,
            balance,
            balanceFormatted: formatUnits(balance, decimalsResult.result as number),
            decimals: decimalsResult.result as number,
            chain: "Reth",
          })
        }
      }
    })

    return portfolioBalances.sort((a, b) => a.tokenSymbol.localeCompare(b.tokenSymbol))
  }, [contractData, uniqueTokenAddresses, userAddress])

  return {
    balances,
    isLoading: isLoadingContracts,
    isError: false,
    refresh,
  }
}
