import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"

import { getAllTransfers, getUserTransfers, POLLING_INTERVAL } from "../lib/api"

/**
 * Hook that returns ERC20 transfer data using TanStack Query.
 *
 * @param address - Optional user address. If provided, returns transfers for that address.
 *                  If omitted, returns all transfers.
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
 * function MyComponent() {
 *   const { data, isLoading, isError, error, isFetching } = useERC20Transfers(address)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (isError) return <ErrorCard error={error} />
 *
 *   return <TransferList data={data ?? []} loading={isFetching} />
 * }
 * ```
 */
export function useERC20Transfers(address?: Address) {
  return useQuery({
    queryKey: address ? ["transfers", address] : ["transfers", "all"],
    queryFn: ({ signal }) => (address ? getUserTransfers(address, signal) : getAllTransfers(signal)),
    refetchInterval: POLLING_INTERVAL, // Poll every 2 seconds (or configured interval)
    placeholderData: (prev) => prev, // Keep previous data during refetch (reduces flicker)
  })
}
