import { eq, useLiveQuery } from "@tanstack/react-db"

import { erc20TransfersCollection } from "../lib/collections/erc20Transfers"

export function usePortfolioQuery(userAddress?: string) {
  const transfersQuery = useLiveQuery((q) => {
    if (!userAddress) return { transfers: [], isLoading: false, isError: false }

    const normalizedAddress = userAddress.toLowerCase().replace("0x", "")

    return q
      .from({ t: erc20TransfersCollection })
      .where(({ t }) => eq(t.fromAddress, normalizedAddress) || eq(t.toAddress, normalizedAddress))
      .select(({ t }) => ({
        txHash: t.txHash,
        logIndex: t.logIndex,
        tokenAddress: t.tokenAddress,
        fromAddress: t.fromAddress,
        toAddress: t.toAddress,
        amountRaw: t.amountRaw,
        blockNum: t.blockNum,
        timestamp: t.timestamp,
      }))
      .orderBy(({ t }) => t.blockNum, "desc")
  })

  return {
    transfers: transfersQuery.data ?? [],
    isLoading: transfersQuery.isLoading,
    isError: transfersQuery.isError,
  }
}
