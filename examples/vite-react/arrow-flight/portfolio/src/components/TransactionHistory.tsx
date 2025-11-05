import { Result } from "@effect-atom/atom-react"

import { usePortfolioQuery } from "../hooks/usePortfolioQuery"

import { EmptyState } from "./EmptyState"
import { ErrorCard } from "./ErrorCard"
import { LoadingSpinner } from "./LoadingSpinner"
import { TransactionTable } from "./TransactionTable"

interface TransactionHistoryProps {
  address?: string
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const result = usePortfolioQuery(address as `0x${string}` | undefined)

  return Result.match(result, {
    onInitial: () => <LoadingSpinner message="Loading transaction history..." />,

    onWaiting: (waiting) =>
      waiting.value && waiting.value.length > 0 ? (
        <TransactionTable transfers={waiting.value} address={address} loading />
      ) : (
        <LoadingSpinner message="Loading transaction history..." />
      ),

    onSuccess: (success) =>
      success.value.length === 0 ? (
        <EmptyState message="No transactions found" />
      ) : (
        <TransactionTable transfers={success.value} address={address} />
      ),

    onFailure: (failure) => (
      <ErrorCard title="Error loading transaction history" message="Failed to load transactions" cause={failure} />
    ),
  })
}
