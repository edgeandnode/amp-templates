import express from "express"
import cors from "cors"
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"

const app = express()
const PORT = 3001
const ELECTRIC_URL = process.env.VITE_ELECTRIC_URL || "http://localhost:3000"

app.use(cors())

app.get("/api/shape-proxy/transfers", async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const electricSqlUrl = new URL(`${ELECTRIC_URL}/v1/shape`)

  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      electricSqlUrl.searchParams.set(key, value)
    }
  })

  electricSqlUrl.searchParams.set(`table`, `erc20_transfers`)

  try {
    const response = await fetch(electricSqlUrl.toString())
    const headers: Record<string, string> = {}

    response.headers.forEach((value, key) => {
      if (key !== "content-encoding" && key !== "content-length") {
        headers[key] = value
      }
    })

    res.status(response.status)
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }

    res.end()
  } catch (error) {
    console.error("Proxy error:", error)
    res.status(500).json({ error: "Failed to fetch from Electric SQL" })
  }
})

app.listen(PORT, () => {
  console.log(`Shape proxy server running on http://localhost:${PORT}`)
})
