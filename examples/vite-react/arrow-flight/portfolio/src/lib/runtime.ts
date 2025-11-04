import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import { Atom } from "@effect-atom/atom-react"

/**
 * Transport configuration for Arrow Flight over gRPC-Web
 *
 * Connection flow:
 * - Browser → Vite dev server (same origin, HTTP/1.1)
 * - Vite proxy → Amp proxy (port 3001)
 * - Amp proxy → Amp server (port 1602, HTTP/2)
 */
const transport = createConnectTransport({
  baseUrl: window.location.origin,
  httpVersion: "1.1",
  interceptors: [
    (next) => async (req) => {
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
    },
  ],
})

const ArrowFlightLive = ArrowFlight.layer(transport)

export const runtime = Atom.runtime(ArrowFlightLive)
