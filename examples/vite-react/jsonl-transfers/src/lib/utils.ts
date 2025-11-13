/**
 * Shortens an Ethereum address for display purposes
 * @param address - Full Ethereum address (with or without 0x prefix)
 * @param firstChars - Number of characters to show at the start (default: 6, includes 0x)
 * @param lastChars - Number of characters to show at the end (default: 5)
 * @returns Shortened address in format: 0xABCD...12345
 *
 * @example
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678")
 * // Returns: "0x1234...45678"
 */
export function shortenAddress(address: string, firstChars: number = 6, lastChars: number = 5): string {
  if (!address) return ""

  // Ensure address has 0x prefix
  const normalizedAddress = address.startsWith("0x") ? address : `0x${address}`

  // If address is shorter than the desired display length, return as is
  if (normalizedAddress.length <= firstChars + lastChars + 3) {
    return normalizedAddress
  }

  const start = normalizedAddress.slice(0, firstChars)
  const end = normalizedAddress.slice(-lastChars)

  return `${start}...${end}`
}

/**
 * Formats a Unix timestamp into a human-readable date and time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted string in format: "DD-MM-YYYY HH:mm:ss am/pm"
 *
 * @example
 * formatTimestamp(1705329045)
 * // Returns: "15-01-2024 2:30:45 pm"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)

  // Format date part: "15-01-2024"
  const day = date.getUTCDate().toString().padStart(2, "0")
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = date.getUTCFullYear()
  const dateStr = `${day}-${month}-${year}`

  // Format time part: "2:30:45 pm"
  const timeStr = date
    .toLocaleTimeString("en-US", {
      timeZone: "UTC",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toLowerCase()

  return `${dateStr} ${timeStr}`
}
