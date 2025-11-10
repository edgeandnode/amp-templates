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
  const result = usePortfolioQuery(address)

  return Result.match(result, {
    onInitial: () => <LoadingSpinner message="Loading transaction history..." />,
    onWaiting: (waiting) => {
      const transfers = waiting.value ?? []
      return transfers.length === 0 ? (
        <LoadingSpinner message="Loading transaction history..." />
      ) : (
        <TransactionTable transfers={transfers} address={address} loading />
      )
    },
    onSuccess: (success) => {
      const transfers = success.value
      return transfers.length === 0 ? (
        <EmptyState message="No transactions found" />
      ) : (
        <TransactionTable transfers={transfers} address={address} />
      )
    },
    onFailure: (failure) => <ErrorCard title="Error loading transaction history" message={failure.cause.message} />,
  })
}
