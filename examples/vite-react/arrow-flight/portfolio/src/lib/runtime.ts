import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import { Atom } from "@effect-atom/atom-react"

// Arrow Flight uses gRPC, which requires HTTP/2
// Browser makes requests to Vite dev server (same origin)
// Vite proxies to Amp proxy (port 3001)
// Amp proxy forwards to Amp server (port 1602)

const transport = createConnectTransport({
  baseUrl: window.location.origin, // Use same origin to leverage Vite proxy
  httpVersion: "1.1",
  interceptors: [
    (next) => async (req) => {
      try {
        const response = await next(req)
        return response
      } catch (error) {
        console.error("[Runtime] Request failed:", {
          service: req.service.typeName,
          method: req.method.name,
          error: error,
        })
        throw error
      }
    },
  ],
})

const ArrowFlightLive = ArrowFlight.layer(transport)

export const runtime = Atom.runtime(ArrowFlightLive)
