/**
 * Form validation functions using Effect Schema with clear error messages
 *
 * This module provides validation for the TransferModal form, including:
 * - Ethereum address validation for recipient field
 * - Decimal number validation and bigint conversion for amount field
 */

import { Schema } from "effect"
import { isAddress, parseUnits } from "viem"

/**
 * Form values type for the transfer form
 */
export type FormValues = {
  recipient: string
  amount: string
}

/**
 * Schema for validating recipient addresses
 * Uses a simple filter chain to ensure clear error messages
 */
const RecipientSchema = Schema.String.pipe(
  Schema.filter((value) => value.trim().length > 0 || "Recipient is required"),
  Schema.filter((value) => isAddress(value.trim(), { strict: false }) || "Invalid address"),
)

/**
 * Creates a schema for validating amounts with specific token decimals
 * Uses a simple filter chain to ensure clear error messages
 */
const createAmountSchema = (decimals: number) =>
  Schema.String.pipe(
    Schema.filter((value) => value.trim().length > 0 || "Amount is required"),
    Schema.filter((value) => /^\d+\.?\d*$/.test(value.trim()) || "Amount must be a valid positive decimal number"),
    Schema.filter((value) => {
      try {
        const parsed = parseUnits(value.trim(), decimals)
        return parsed > 0n || "Amount must be a positive number"
      } catch {
        return "Amount must be a positive number"
      }
    }),
  )

/**
 * Extracts error message from ParseIssue tree
 * Recursively traverses to find the first refinement/validation error message
 */
function extractErrorMessage(issue: any): string | undefined {
  // If issue has a message property, try to extract it
  if (issue.message) {
    const message = issue.message
    const result = typeof message === "function" ? message() : message
    if (typeof result === "string" && result.length > 0) {
      return result
    }
  }

  // Try to recurse into nested issue property
  if (issue.issue) {
    return extractErrorMessage(issue.issue)
  }

  return undefined
}

/**
 * Validates the recipient address field using Effect Schema
 *
 * @param value - The recipient address to validate
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateRecipient(value: string): string | undefined {
  const result = Schema.decodeUnknownEither(RecipientSchema)(value)
  if (result._tag === "Left") {
    return extractErrorMessage(result.left.issue)
  }
  return undefined
}

/**
 * Validates the amount field for a specific token's decimal places using Effect Schema
 *
 * @param value - The amount string to validate
 * @param decimals - The number of decimal places for the token
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateAmount(value: string, decimals: number): string | undefined {
  const AmountSchema = createAmountSchema(decimals)
  const result = Schema.decodeUnknownEither(AmountSchema)(value)
  if (result._tag === "Left") {
    return extractErrorMessage(result.left.issue)
  }
  return undefined
}
