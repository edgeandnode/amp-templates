/**
 * Environment Configuration Helpers
 *
 * Utilities for safely accessing environment variables in the browser.
 * All environment variables must be prefixed with VITE_ to be exposed to the client.
 */

/**
 * Get the Arrow Flight Query Gateway URL
 *
 * @throws {Error} If VITE_AMP_QUERY_URL is not configured
 * @returns The Arrow Flight query gateway URL
 */
export function getQueryUrl(): string {
  const url = import.meta.env.VITE_AMP_QUERY_URL

  if (!url) {
    throw new Error(
      "VITE_AMP_QUERY_URL environment variable is not configured. " +
        "Please add it to your .env file. " +
        "Example: VITE_AMP_QUERY_URL=https://gateway.amp.staging.thegraph.com/",
    )
  }

  return url
}

/**
 * Get the authentication token from environment variable
 *
 * The token is read from VITE_AMP_ACCESS_TOKEN environment variable
 * and is used to authenticate requests to the Amp gateway.
 *
 * @returns The auth token if present, null otherwise
 */
export function getAuthToken(): string | null {
  return import.meta.env.VITE_AMP_ACCESS_TOKEN || null
}

/**
 * Get the request timeout in milliseconds
 *
 * @returns Request timeout in milliseconds (default: 30000ms / 30 seconds)
 */
export function getRequestTimeout(): number {
  const timeout = import.meta.env.VITE_REQUEST_TIMEOUT
  if (!timeout) {
    return 30000
  }
  return parseInt(timeout, 10)
}

/**
 * Get the auto-refresh polling interval in milliseconds
 *
 * @returns Refresh interval in milliseconds (default: 5000ms / 5 seconds)
 */
export function getRefreshInterval(): number {
  const interval = import.meta.env.VITE_REFRESH_INTERVAL
  if (!interval) {
    return 10000
  }
  return parseInt(interval, 10)
}
