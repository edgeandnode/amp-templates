import type { Transport } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { ArrowFlight } from "@edgeandnode/amp"
import { Atom } from "@effect-atom/atom-react"

// Create Connect transport for Arrow Flight
const transport: Transport = createConnectTransport({
  baseUrl: "/amp",
})

// Create the Effect-Atom runtime with Arrow Flight layer
export const runtime = Atom.runtime(ArrowFlight.layer(transport))
