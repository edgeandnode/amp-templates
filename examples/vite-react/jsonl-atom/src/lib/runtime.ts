import * as JsonLines from "@edgeandnode/amp/api/JsonLines"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { Atom } from "@effect-atom/atom-react"
import { Layer } from "effect"

/**
 * Atom runtime for managing Effect-based atoms with JSON Lines support
 *
 * The JsonLines layer is configured with the URL from environment variables
 * and provides the JsonLines service to all atoms.
 */
const url = import.meta.env.VITE_AMP_JSONL_URL || "http://localhost:1603"

const JsonLinesLive = JsonLines.layer(url).pipe(Layer.provide(FetchHttpClient.layer))

export const runtime = Atom.runtime(JsonLinesLive)
