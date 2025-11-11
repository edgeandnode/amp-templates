/**
 * Form validation functions using Zod
 *
 * This module provides validation for the TransferModal form, including:
 * - Ethereum address validation for recipient field
 * - Decimal number validation and bigint conversion for amount field
 */

import { z } from "zod"
import { isAddress, parseUnits } from "viem"

// Reusable address validator
export const addressSchema = z
  .string()
  .trim()
  .min(1, "Recipient is required")
  .refine((val) => isAddress(val, { strict: false }), {
    message: "Invalid address",
  })

// Amount validator factory (parameterized by decimals)
export const createAmountSchema = (decimals: number) =>
  z
    .string()
    .trim()
    .min(1, "Amount is required")
    .regex(/^\d+\.?\d*$/, "Amount must be a valid positive decimal number")
    .refine(
      (val) => {
        try {
          const parsed = parseUnits(val, decimals)
          return parsed > 0n
        } catch {
          return false
        }
      },
      {
        message: "Amount must be a positive number",
      },
    )

// Form schema factory
export const createTransferFormSchema = (decimals: number) =>
  z.object({
    recipient: addressSchema,
    amount: createAmountSchema(decimals),
  })

/**
 * Form values type for the transfer form
 */
export type FormValues = z.infer<ReturnType<typeof createTransferFormSchema>>

/**
 * Validates the recipient address field
 *
 * @param value - The recipient address to validate
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateRecipient(value: string): string | undefined {
  const result = addressSchema.safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message ?? "Invalid recipient"
}

/**
 * Validates the amount field for a specific token's decimal places
 *
 * @param value - The amount string to validate
 * @param decimals - The number of decimal places for the token
 * @returns Error message string if validation fails, undefined if valid
 */
export function validateAmount(value: string, decimals: number): string | undefined {
  const result = createAmountSchema(decimals).safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message ?? "Invalid amount"
}
