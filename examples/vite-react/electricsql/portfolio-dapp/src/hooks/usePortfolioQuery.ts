import { useLiveQuery } from "@tanstack/react-db"

import { erc20TransfersCollection } from "../lib/collections/erc20Transfers"

export function usePortfolioQuery(userAddress?: string) {
  const transfersQuery = useLiveQuery((q) => {
    if (!userAddress) return null

    const normalizedAddress = userAddress.toLowerCase().startsWith("0x")
      ? userAddress.toLowerCase()
      : `0x${userAddress.toLowerCase()}`

    return q
      .from({ t: erc20TransfersCollection })
      .fn.where((row) => {
        return (
          row.t.fromAddress.toLowerCase() === normalizedAddress ||
          row.t.toAddress.toLowerCase() === normalizedAddress
        )
      })
      .select(({ t }) => ({
        txHash: t.txHash,
        logIndex: t.logIndex,
        tokenAddress: t.tokenAddress,
        fromAddress: t.fromAddress,
        toAddress: t.toAddress,
        amountRaw: t.amountRaw,
        blockNum: t.blockNum,
        txTimestamp: t.txTimestamp,
      }))
      .orderBy(({ t }) => t.blockNum, "desc")
  })

  return {
    transfers: transfersQuery.data ?? [],
    isLoading: transfersQuery.isLoading,
    isError: transfersQuery.isError,
  }
}
