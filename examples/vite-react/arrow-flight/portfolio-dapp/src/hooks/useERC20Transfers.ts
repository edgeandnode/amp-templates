import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { Address } from "viem"

import { allTransfersAtom, userTransfersAtom } from "../lib/atoms"

export function useERC20Transfers(address?: Address) {
  const result = useAtomValue(address ? userTransfersAtom(address) : allTransfersAtom)

  // Handle Result type from atoms
  return Result.match(result, {
    onInitial: () => ({
      transfers: [],
      isLoading: true,
      isError: false,
    }),
    onWaiting: () => ({
      transfers: Result.value(result) ?? [],
      isLoading: true,
      isError: false,
    }),
    onSuccess: (transfers) => ({
      transfers,
      isLoading: false,
      isError: false,
    }),
    onFailure: () => ({
      transfers: [],
      isLoading: false,
      isError: true,
    }),
  })
}
