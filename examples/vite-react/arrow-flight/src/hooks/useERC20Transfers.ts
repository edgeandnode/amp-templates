import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Address } from "viem"

import { allTransfersAtom, userTransfersAtom } from "../lib/atoms"
import type { ERC20Transfer } from "../lib/schemas"

/**
 * Hook that returns ERC20 transfer data as a Result type.
 *
 * @param address - Optional user address. If provided, returns transfers for that address.
 *                  If omitted, returns all transfers.
 *
 * @returns Result<ERC20Transfer[], Error> with the following states:
 *   - Initial: First load, no data yet
 *   - Waiting: Loading/refreshing (may contain previous value)
 *   - Success: Transfers loaded successfully
 *   - Failure: Query failed (network, schema validation, or SQL error)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const result = useERC20Transfers(address)
 *
 *   return Result.match(result, {
 *     onInitial: () => <LoadingSpinner />,
 *     onWaiting: (waiting) => <TransferList data={waiting.value ?? []} loading />,
 *     onSuccess: (transfers) => <TransferList data={transfers} />,
 *     onFailure: (cause) => <ErrorMessage cause={cause} />
 *   })
 * }
 * ```
 */
export function useERC20Transfers(address?: Address): Result<ERC20Transfer[], Error> {
  const result = useAtomValue(address ? userTransfersAtom(address) : allTransfersAtom)
  return result
}
