import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"

const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL || "http://localhost:3000"

export async function handleShapeProxy(request: Request, tableName: string): Promise<Response> {
  const url = new URL(request.url)
  const electricSqlUrl = new URL(`${ELECTRIC_URL}/v1/shape`)

  // Pass through only Electric protocol parameters
  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      electricSqlUrl.searchParams.set(key, value)
    }
  })

  // Set table name server-side (for security)
  electricSqlUrl.searchParams.set(`table`, tableName)

  const electricSqlApiRequest = new Request(electricSqlUrl.toString(), {
    method: `GET`,
    headers: new Headers(),
  })

  // Handle content-encoding issues in proxied long-polling responses
  let resp = await fetch(electricSqlApiRequest)
  if (resp.headers.get(`content-encoding`)) {
    const headers = new Headers(resp.headers)
    headers.delete(`content-encoding`)
    headers.delete(`content-length`)
    resp = new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    })
  }
  return resp
}
