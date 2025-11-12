import { parseERC20Transfer, type ERC20Transfer } from "./schemas"

// Configuration
const JSONL_URL = import.meta.env.VITE_AMP_JSONL_URL || "http://localhost:1603"
const ACCESS_TOKEN = import.meta.env.VITE_AMP_ACCESS_TOKEN
const TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000 // 30 seconds default

// Polling configuration
export const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 2000

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

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = "TimeoutError"
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
function validateERC20TransferLine(line: string): ERC20Transfer {
  try {
    const parsed = JSON.parse(line)
    return parseERC20Transfer(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new ValidationError(line, message)
  }
}

// Utility to combine multiple AbortSignals
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort()
      break
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true })
  }

  return controller.signal
}

// Generic fetch function for JSON Lines with timeout support
async function fetchJSONL<T>(
  query: string,
  validator: (line: string) => T,
  signal?: AbortSignal
): Promise<T[]> {
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timeoutController.abort()
  }, TIMEOUT_MS)

  // Combine timeout signal with user-provided signal
  const combinedSignal = signal
    ? combineAbortSignals([signal, timeoutController.signal])
    : timeoutController.signal

  try {
    const response = await fetch(`${JSONL_URL}`, {
      method: "POST",
      headers: buildHeaders(),
      body: query,
      signal: combinedSignal,
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

    const results: T[] = []
    for (const line of lines) {
      const validated = validator(line)
      results.push(validated)
    }

    return results
  } catch (error) {
    // Handle timeout abort specifically
    if (error instanceof Error && error.name === "AbortError" && timeoutController.signal.aborted) {
      throw new TimeoutError(TIMEOUT_MS)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// Domain-specific API function for ERC20 token transfers
export async function getERC20Transfers(signal?: AbortSignal): Promise<ERC20Transfer[]> {
  const raw_dataset_FQN = "edgeandnode/arbitrum_one@0.0.1"
  const token_contract_address = "54f27abab2d30d6732edc45dff9b411c8dac2d41"
  const transfer_event = "Transfer(address indexed from, address indexed to, uint256 value)"
  const starting_block = 5
  const result_limit = 8

  const usdc_transfers_query = `
    SELECT t.block_num, t.timestamp, t.address as token_address, t.tx_hash, t.event['from'] as sender, t.event['to'] as recipient, t.event['value'] as amount
    FROM (
        SELECT block_hash, tx_hash, block_num, timestamp, address, evm_decode_log(topic1, topic2, topic3, data, '${transfer_event}') as event
        FROM "${raw_dataset_FQN}"."logs"
        WHERE topic0 = evm_topic('${transfer_event}')
        AND address = decode('${token_contract_address}', 'hex')
        AND block_num > ${starting_block}
    ) as t
    LIMIT ${result_limit}
  `

  return fetchJSONL(usdc_transfers_query, validateERC20TransferLine, signal)
}
