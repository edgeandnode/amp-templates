import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Address } from "viem"

import { userTransfersAtom } from "../lib/atoms"
import type { ERC20Transfer } from "../lib/schemas"

/**
 * Hook that returns user-specific ERC20 transfers as a Result type.
 *
 * This hook filters transfers to only those involving the specified address
 * (as sender or receiver).
 *
 * @param address - User wallet address. If not provided, returns Initial state.
 *
 * @returns Result<ERC20Transfer[], Error> with the following states:
 *   - Initial: No address provided or first load
 *   - Waiting: Loading/refreshing (may contain previous transfers)
 *   - Success: User transfers loaded successfully
 *   - Failure: Query failed (network, schema validation, or SQL error)
 *
 * @example
 * ```tsx
 * function TransactionHistory({ address }: Props) {
 *   const result = usePortfolioQuery(address)
 *
 *   return Result.match(result, {
 *     onInitial: () => <LoadingSpinner message="Loading transactions..." />,
 *     onWaiting: (waiting) => (
 *       <TransactionTable data={waiting.value ?? []} refreshing />
 *     ),
 *     onSuccess: (transfers) => (
 *       transfers.length === 0
 *         ? <EmptyState />
 *         : <TransactionTable data={transfers} />
 *     ),
 *     onFailure: (cause) => <ErrorCard cause={cause} />
 *   })
 * }
 * ```
 */
export function usePortfolioQuery(address?: Address): Result<ERC20Transfer[], Error> {
  // Use a dummy address to satisfy React hooks rules (must call hooks unconditionally)
  const effectiveAddress = address || ("0x0000000000000000000000000000000000000000" as Address)

  const result = useAtomValue(userTransfersAtom(effectiveAddress))

  // If no address provided, return Initial state
  if (!address) {
    return Result.initial()
  }

  return result
}
