import { useAtomRefresh } from "@effect-atom/atom-react"
import { useEffect } from "react"
import type { Address } from "viem"

import { userTransfersAtom } from "../lib/atoms"

/**
 * Hook that automatically refreshes the user-specific transfers atom at regular intervals.
 * Use this hook in your root App component to enable polling for user transfer data.
 *
 * @param address - User's wallet address (optional, polling disabled if not provided)
 * @param interval - Polling interval in milliseconds (default: 2000ms)
 */
export function useAutoRefresh(address?: Address, interval = 2000) {
  // Use a dummy address if none provided to satisfy React hooks rules
  // We'll check the real address in the useEffect
  const effectiveAddress = address || ("0x0000000000000000000000000000000000000000" as Address)
  const refreshTransfers = useAtomRefresh(userTransfersAtom(effectiveAddress))

  useEffect(() => {
    // Only start polling if we have a real address
    if (!address) {
      return
    }

    // Start polling
    const intervalId = setInterval(() => {
      refreshTransfers()
    }, interval)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [refreshTransfers, interval, address])
}
