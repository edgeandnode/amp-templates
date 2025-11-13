/**
 * AMP Gateway client for querying remote datasets
 */

import type { HealthResult, QueryResultData } from "./types/amp-data.js"

export interface QueryResult {
  data: QueryResultData[]
  rowCount: number
  executionTime?: number
}

export class AmpClient {
  private gatewayUrl: string
  private authToken: string | null

  constructor(gatewayUrl: string, authToken?: string) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "") // Remove trailing slash
    this.authToken = authToken || null
  }

  /**
   * Execute a SQL query against the AMP gateway
   */
  async executeQuery(query: string): Promise<QueryResult> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.gatewayUrl}/api/jsonl`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Accept": "application/x-ndjson",
          ...(this.authToken && { "Authorization": `Bearer ${this.authToken}` }),
        },
        body: query
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AMP Gateway error: ${response.status} - ${errorText}`)
      }

      const text = await response.text()
      const executionTime = Date.now() - startTime

      if (!text.trim()) {
        // Empty response
        return {
          data: [],
          rowCount: 0,
          executionTime,
        }
      }

      // Parse NDJSON response
      const lines = text.trim().split('\n').filter(line => line.trim())
      const data: QueryResultData[] = []

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line)
          data.push(parsed)
        } catch (parseError) {
          console.warn("Failed to parse NDJSON line:", line, parseError)
        }
      }

      return {
        data,
        rowCount: data.length,
        executionTime,
      }
    } catch (error) {
      console.error("AMP Gateway query error:", error)
      throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get health status from the AMP gateway
   */
  async getHealth(): Promise<HealthResult> {
    try {
      // Try a simple query to test connectivity
      const result = await this.executeQuery("SELECT 1 as health_check")
      return {
        status: result.data.length > 0 ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
      }
    } catch (_error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      }
    }
  }
}

/**
 * Convert BigInt values to strings for JSON serialization
 */
export function convertBigIntsToStrings(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntsToStrings)
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntsToStrings(value)
    }
    return result
  }

  return obj
}

