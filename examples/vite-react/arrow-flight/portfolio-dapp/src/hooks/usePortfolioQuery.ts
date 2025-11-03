import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Address } from "viem"

import { userTransfersAtom } from "../lib/atoms"

export function usePortfolioQuery(address?: Address) {
  // Use a dummy address if none provided to satisfy React hooks rules
  const effectiveAddress = address || ("0x0000000000000000000000000000000000000000" as Address)
  const result = useAtomValue(userTransfersAtom(effectiveAddress))

  // Handle no address case (return empty data)
  if (!address) {
    return {
      transfers: [],
      isLoading: false,
      isError: false,
    }
  }

  // Handle Result type from atom (filtering is done in SQL query)
  const matched = Result.match(result, {
    onInitial: () => {
      return {
        transfers: [],
        isLoading: true,
        isError: false,
      }
    },
    onWaiting: (waiting) => {
      return {
        transfers: waiting.value ?? [],
        isLoading: true,
        isError: false,
      }
    },
    onSuccess: (success) => {
      return {
        transfers: success.value,
        isLoading: false,
        isError: false,
      }
    },
    onFailure: (failure) => {
      console.error("Failed to fetch transfers:", failure)
      return {
        transfers: [],
        isLoading: false,
        isError: true,
      }
    },
  })

  return matched
}
