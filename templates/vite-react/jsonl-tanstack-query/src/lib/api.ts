import type { Address } from "viem"

import { parseERC20Transfer, type ERC20Transfer } from "./schemas"

// Configuration
const JSONL_URL = import.meta.env.VITE_AMP_JSONL_URL || "http://localhost:1603"
const ACCESS_TOKEN = import.meta.env.VITE_AMP_ACCESS_TOKEN

// Polling configuration
export const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 2000 // 2 seconds

// Error types
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseBody: string,
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = "ApiError"
  }
}

export class ValidationError extends Error {
  constructor(
    public line: string,
    public issues: string,
  ) {
    super(`Schema validation failed: ${issues}`)
    this.name = "ValidationError"
  }
}

// Headers builder
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/x-ndjson",
    "Content-Type": "application/json",
  }

  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`
  }

  return headers
}

// JSON Lines parser
function parseJsonLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

// Validator using parseERC20Transfer
function validateLine(line: string): ERC20Transfer {
  try {
    const parsed = JSON.parse(line)
    return parseERC20Transfer(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new ValidationError(line, message)
  }
}

// Generic fetch function for JSON Lines
async function fetchJSONL(query: string, signal?: AbortSignal): Promise<ERC20Transfer[]> {
  const response = await fetch(`${JSONL_URL}`, {
    method: "POST",
    headers: buildHeaders(),
    body: query,
    signal,
  })

  if (!response.ok) {
    const body = await response.text()

    // Check if authentication is required but not provided
    if (response.status === 401 && !ACCESS_TOKEN) {
      console.error("Authentication required but VITE_AMP_ACCESS_TOKEN is not set")
    }

    throw new ApiError(response.status, response.statusText, body)
  }

  const text = await response.text()
  const lines = parseJsonLines(text)

  const results: ERC20Transfer[] = []
  for (const line of lines) {
    const validated = validateLine(line)
    results.push(validated)
  }

  return results
}

// Domain-specific API functions
export async function getAllTransfers(signal?: AbortSignal): Promise<ERC20Transfer[]> {
  const query = `
    SELECT * FROM "_/portfolio_dapp@dev"."erc20_transfers"
    ORDER BY block_num DESC
  `
  return fetchJSONL(query, signal)
}

export async function getUserTransfers(address: Address, signal?: AbortSignal): Promise<ERC20Transfer[]> {
  const normalizedAddress = address.toLowerCase().replace("0x", "")

  const query = `
    SELECT * FROM "_/portfolio_dapp@dev"."erc20_transfers"
    WHERE from_address = decode('${normalizedAddress}', 'hex')
       OR to_address = decode('${normalizedAddress}', 'hex')
    ORDER BY block_num DESC
  `

  return fetchJSONL(query, signal)
}
