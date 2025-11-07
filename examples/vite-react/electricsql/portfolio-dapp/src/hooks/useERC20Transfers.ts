"use client"

import { useShape } from "@electric-sql/react"
import { Schema } from "effect"

import { ERC20Transfer } from "../types/portfolio"

// Decoder for runtime validation
const ERC20TransferDecoder = Schema.decodeUnknownSync(ERC20Transfer)

export function useERC20Transfers() {
  return useShape<ERC20Transfer>({
    url: `http://localhost:3001/api/shape-proxy/transfers`,
    transformer(message) {
      return ERC20TransferDecoder(message)
    },
  })
}
