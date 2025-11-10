/**
 * Form validation functions using native TypeScript with clear error messages
 *
 * This module provides validation for the TransferModal form, including:
 * - Ethereum address validation for recipient field
 * - Decimal number validation and bigint conversion for amount field
 */

import { isAddress, parseUnits } from "viem"

/**
 * Form values type for the transfer form
 */
export type FormValues = {
  recipient: string
  amount: string
}

/**
 * Validates the recipient address field
 *
 * @param value - The recipient address to validate
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateRecipient(value: string): string | undefined {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return "Recipient is required"
  }

  if (!isAddress(trimmed, { strict: false })) {
    return "Invalid address"
  }

  return undefined
}

/**
 * Validates the amount field for a specific token's decimal places
 *
 * @param value - The amount string to validate
 * @param decimals - The number of decimal places for the token
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateAmount(value: string, decimals: number): string | undefined {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return "Amount is required"
  }

  if (!/^\d+\.?\d*$/.test(trimmed)) {
    return "Amount must be a valid positive decimal number"
  }

  try {
    const parsed = parseUnits(trimmed, decimals)
    if (parsed <= 0n) {
      return "Amount must be a positive number"
    }
  } catch {
    return "Amount must be a positive number"
  }

  return undefined
}
