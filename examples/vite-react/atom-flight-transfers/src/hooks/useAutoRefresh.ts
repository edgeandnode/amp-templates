import { useAtomRefresh } from "@effect-atom/atom-react"
import { useEffect } from "react"

import { transfersAtom } from "../lib/transfers"
import { getRefreshInterval } from "@/config/env"

/**
 * Hook that automatically refreshes the transfers atom at regular intervals.
 * Use this hook in your root App component to enable polling for transfer data.
 *
 * @param enabled - Whether polling is enabled (default: true)
 * @param interval - Polling interval in milliseconds (default: from env or 5000ms)
 */
export function useAutoRefresh(enabled = true, interval?: number) {
  const refreshTransfers = useAtomRefresh(transfersAtom)
  const effectiveInterval = interval ?? getRefreshInterval()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = setInterval(() => {
      refreshTransfers()
    }, effectiveInterval)

    return () => clearInterval(intervalId)
  }, [refreshTransfers, effectiveInterval, enabled])
}
