import { useMemo } from "react"
import { formatUnits } from "viem"
import { useReadContracts } from "wagmi"

import type { PortfolioBalance } from "../types/portfolio"

import { usePortfolioQuery } from "./usePortfolioQuery"

const ERC20_METADATA_ABI = [
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
] as const

export function usePortfolioBalances(userAddress?: string) {
  const { transfers, isLoading: transfersLoading, isError } = usePortfolioQuery(userAddress)

  const uniqueTokenAddresses = useMemo(() => {
    if (!transfers) return []
    const addressSet = new Set<string>()
    transfers.forEach((transfer) => {
      addressSet.add(`${transfer.contractAddress}`)
    })
    return Array.from(addressSet)
  }, [transfers])

  const { data: tokenMetadata } = useReadContracts({
    contracts: uniqueTokenAddresses.flatMap((address) => [
      { address: address as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "symbol" },
      { address: address as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "name" },
      { address: address as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "decimals" },
    ]),
  })

  const balances = useMemo(() => {
    if (!userAddress || !transfers || !tokenMetadata) return []

    const normalizedAddress = userAddress.toLowerCase()
    const balanceMap = new Map<string, bigint>()

    transfers.forEach((transfer) => {
      const tokenAddress = `${transfer.contractAddress}`
      const amount = BigInt(transfer.amountRaw)
      const normalizedFrom = transfer.fromAddress.startsWith("0x")
        ? transfer.fromAddress.slice(2).toLowerCase()
        : transfer.fromAddress.toLowerCase()
      const normalizedTo = transfer.toAddress.startsWith("0x")
        ? transfer.toAddress.slice(2).toLowerCase()
        : transfer.toAddress.toLowerCase()
      const normalizedUser = normalizedAddress.replace("0x", "")

      if (normalizedTo === normalizedUser) {
        const current = balanceMap.get(tokenAddress.toLowerCase()) || 0n
        balanceMap.set(tokenAddress.toLowerCase(), current + amount)
      }

      if (normalizedFrom === normalizedUser) {
        const current = balanceMap.get(tokenAddress.toLowerCase()) || 0n
        balanceMap.set(tokenAddress.toLowerCase(), current - amount)
      }
    })

    const portfolioBalances: PortfolioBalance[] = []

    balanceMap.forEach((balance, tokenAddress) => {
      if (balance <= 0n) return

      const tokenIndex = uniqueTokenAddresses.findIndex((addr) => addr.toLowerCase() === tokenAddress)
      if (tokenIndex === -1) return

      const metadataIndex = tokenIndex * 3
      const symbolResult = tokenMetadata[metadataIndex]
      const nameResult = tokenMetadata[metadataIndex + 1]
      const decimalsResult = tokenMetadata[metadataIndex + 2]

      if (
        symbolResult?.status === "success" &&
        nameResult?.status === "success" &&
        decimalsResult?.status === "success"
      ) {
        portfolioBalances.push({
          tokenAddress,
          tokenSymbol: symbolResult.result as string,
          tokenName: nameResult.result as string,
          balance,
          balanceFormatted: formatUnits(balance, decimalsResult.result as number),
          decimals: decimalsResult.result as number,
          chain: "Anvil",
        })
      }
    })

    return portfolioBalances.sort((a, b) => a.tokenSymbol.localeCompare(b.tokenSymbol))
  }, [userAddress, transfers, tokenMetadata, uniqueTokenAddresses])

  return {
    balances,
    isLoading: transfersLoading,
    isError,
  }
}
