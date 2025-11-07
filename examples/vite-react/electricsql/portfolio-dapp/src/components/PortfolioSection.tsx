import type { PortfolioBalance } from "../types/portfolio"

import { ErrorCard } from "./ErrorCard"
import { LoadingSpinner } from "./LoadingSpinner"
import { PortfolioTable } from "./PortfolioTable"

interface PortfolioSectionProps {
  balances: PortfolioBalance[]
  isLoading: boolean
  isError: boolean
  onTransfer: (tokenAddress: string, tokenSymbol: string) => void
}

export function PortfolioSection({ balances, isLoading, isError, onTransfer }: PortfolioSectionProps) {
  if (isError) {
    return (
      <ErrorCard title="Error loading portfolio data" message="Failed to load your token balances. Please try again." />
    )
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading portfolio data..." />
  }

  return <PortfolioTable balances={balances} onTransfer={onTransfer} />
}
