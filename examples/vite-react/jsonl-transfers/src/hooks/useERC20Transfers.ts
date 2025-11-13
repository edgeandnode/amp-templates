import { useQuery } from "@tanstack/react-query"
import { getERC20Transfers, POLLING_INTERVAL } from "../lib/api"

/**
 * Hook that returns ERC20 token transfers using TanStack Query.
 *
 * Polls the Amp JSONLines API for new ERC20 transfers at a configurable interval.
 *
 * Note: Multiple components can safely call useERC20Transfers() simultaneously.
 * TanStack Query will deduplicate requests automatically based on the queryKey.
 *
 * @returns UseQueryResult with the following properties:
 *   - data: ERC20Transfer[] | undefined
 *   - isPending: boolean - true during initial load
 *   - isError: boolean - true if query failed
 *   - error: Error | null - error object if failed
 *   - isFetching: boolean - true during background refresh
 *
 * @example
 * ```tsx
 * function ERC20TransfersTable() {
 *   const { data: transfers, isPending, isError, error, isFetching } = useERC20Transfers()
 *
 *   if (isPending) return <LoadingSpinner />
 *   if (isError) return <ErrorCard error={error} />
 *   if (!transfers) return <EmptyState />
 *
 *   return <Table data={transfers} loading={isFetching} />
 * }
 * ```
 */
export function useERC20Transfers() {
  return useQuery({
    queryKey: ["erc20-transfers"],
    queryFn: ({ signal }) => getERC20Transfers(signal),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: (prev) => prev, // Keep previous data while refetching
  })
}
