import type { Interceptor } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import { Atom } from "@effect-atom/atom-react"

import { getAuthToken, getQueryUrl, getRequestTimeout } from "@/config/env.ts"

/**
 * Create an auth interceptor that adds the Authorization header
 *
 * The interceptor reads the token from environment variables and adds it to the request
 * if present. This allows for authenticated requests to the Amp gateway.
 *
 * @returns An interceptor that adds the Authorization header
 */
function makeAuthInterceptor(): Interceptor {
  return (next) => async (req) => {
    const token = getAuthToken()
    if (token) {
      req.header.append("Authorization", `Bearer ${token}`)
    }

    try {
      const response = await next(req)
      return response
    } catch (error) {
      console.error("[Runtime] Transport error:", {
        service: req.service.typeName,
        method: req.method.name,
        error: error,
        message: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }
}

/**
 * Global Connect transport configured for the Amp Arrow Flight service
 *
 * The transport is configured with:
 * - Base URL from VITE_AMP_QUERY_URL environment variable
 * - Auth interceptor that adds Authorization header from environment
 * - Request timeout from VITE_REQUEST_TIMEOUT (default: 20000ms)
 * - Error logging for debugging
 */
const transport = createConnectTransport({
  baseUrl: getQueryUrl(),
  interceptors: [makeAuthInterceptor()],
  defaultTimeoutMs: getRequestTimeout(),
})

/**
 * Global ArrowFlight layer provided to the runtime
 */
const ArrowFlightLive = ArrowFlight.layer(transport)

/**
 * Global effect-atom runtime with ArrowFlight layer
 *
 * This runtime is shared across the entire application and provides
 * the ArrowFlight service to all atoms and effects.
 */
export const runtime = Atom.runtime(ArrowFlightLive)
