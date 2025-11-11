import type { Address } from "viem"

import { usePortfolioQuery } from "../hooks/usePortfolioQuery"
import { EmptyState } from "./EmptyState"
import { ErrorCard } from "./ErrorCard"
import { LoadingSpinner } from "./LoadingSpinner"
import { TransactionTable } from "./TransactionTable"

interface TransactionHistoryProps {
  address?: Address
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const { data: transfers, isPending, isError, error, isFetching } = usePortfolioQuery(address)

  if (isPending) return <LoadingSpinner message="Loading transaction history..." />
  if (isError)
    return <ErrorCard title="Error loading transaction history" message={error?.message || "Unknown error"} />
  if (!transfers || transfers.length === 0) return <EmptyState message="No transactions found" />

  return <TransactionTable transfers={transfers} loading={isFetching} address={address} />
}
