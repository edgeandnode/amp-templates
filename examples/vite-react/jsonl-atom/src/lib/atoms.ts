import { Atom } from "@effect-atom/atom-react"
import type { Address } from "viem"

import { query } from "./query"
import { runtime } from "./runtime"
import { ERC20Transfer } from "./schemas"

const allTransfersQuery = `
  SELECT * FROM "_/portfolio_dapp@dev"."erc20_transfers"
  ORDER BY block_num DESC
`

// Global atom that should persist across component unmounts
// Use Atom.keepAlive to prevent reset when no components are subscribed
export const allTransfersAtom = runtime.atom(query(ERC20Transfer, allTransfersQuery)).pipe(Atom.keepAlive)

// Helper to normalize address for SQL query (remove 0x prefix, lowercase)
const normalizeAddressForQuery = (address: Address): string => {
  return address.toLowerCase().replace("0x", "")
}

// Atom family that creates a filtered query for a specific user's transfers
export const userTransfersAtom = Atom.family((address: Address) => {
  const normalizedAddress = normalizeAddressForQuery(address)

  // Use decode() to convert hex string to FixedSizeBinary(20) for comparison
  // Addresses are stored as FixedSizeBinary(20) in the database
  const userTransfersQuery = `
    SELECT * FROM "_/portfolio_dapp@dev"."erc20_transfers"
    WHERE from_address = decode('${normalizedAddress}', 'hex')
       OR to_address = decode('${normalizedAddress}', 'hex')
    ORDER BY block_num DESC
  `

  return runtime.atom(query(ERC20Transfer, userTransfersQuery)).pipe(Atom.keepAlive)
})
