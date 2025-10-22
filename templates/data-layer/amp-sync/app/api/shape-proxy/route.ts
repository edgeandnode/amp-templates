import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const electricSqlUrl = new URL(process.env.ELECTRIC_URL || "http://localhost:3000/v1/shape")

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // Only pass through Electric protocol parameters
  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      electricSqlUrl.searchParams.set(key, value)
    }
  })

  // Set the table server-side - not from client params
  // The table name comes from the amp.config.ts
  // When ampsync starts, it will create the table in the database
  // which electric-sql then reads from
  electricSqlUrl.searchParams.set("table", "blocks")

  const electricSqlApiRequest = new Request(electricSqlUrl.toString(), {
    method: "GET",
    headers: new Headers(),
  })

  // When proxying long-polling requests, content-encoding & content-length are added
  // erroneously (saying the body is gzipped when it's not) so we'll just remove
  // them to avoid content decoding errors in the browser.
  let resp = await fetch(electricSqlApiRequest)
  if (resp.headers.get("content-encoding")) {
    const headers = new Headers(resp.headers)
    headers.delete("content-encoding")
    headers.delete("content-length")
    resp = new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    })
  }

  return resp
}
