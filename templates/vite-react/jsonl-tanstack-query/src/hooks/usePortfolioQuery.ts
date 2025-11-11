import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"

import { getUserTransfers, POLLING_INTERVAL } from "../lib/api"

/**
 * Hook that returns user-specific ERC20 transfers using TanStack Query.
 *
 * This hook filters transfers to only those involving the specified address
 * (as sender or receiver).
 *
 * @param address - User wallet address. If not provided, query is disabled.
 *
 * @returns UseQueryResult with the following properties:
 *   - data: ERC20Transfer[] | undefined
 *   - isLoading: boolean - true during initial load
 *   - isError: boolean - true if query failed
 *   - error: Error | null - error object if failed
 *   - isFetching: boolean - true during background refresh
 *
 * @example
 * ```tsx
 * function TransactionHistory({ address }: Props) {
 *   const { data: transfers, isLoading, isError, error, isFetching } = usePortfolioQuery(address)
 *
 *   if (isLoading) return <LoadingSpinner message="Loading transactions..." />
 *   if (isError) return <ErrorCard error={error} />
 *   if (!transfers || transfers.length === 0) return <EmptyState />
 *
 *   return <TransactionTable data={transfers} loading={isFetching} />
 * }
 * ```
 */
export function usePortfolioQuery(address?: Address) {
  return useQuery({
    queryKey: ["transfers", address],
    queryFn: ({ signal }) => getUserTransfers(address!, signal),
    enabled: !!address, // Only run when address exists
    refetchInterval: POLLING_INTERVAL,
    placeholderData: (prev) => prev,
  })
}
