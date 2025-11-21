/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Amp Gateway Query URL
   * @required
   * @example "https://gateway.amp.staging.thegraph.com/"
   */
  readonly VITE_AMP_QUERY_URL?: string

  /**
   * Access token for Amp Gateway authentication
   * @optional
   * @example "your-amp-gateway-token"
   */
  readonly VITE_AMP_ACCESS_TOKEN?: string

  /**
   * Request timeout in milliseconds
   * @optional
   * @default 30000 (30 seconds)
   * @example "30000"
   */
  readonly VITE_REQUEST_TIMEOUT?: string

  /**
   * Auto-refresh polling interval in milliseconds
   * @optional
   * @default 10000 (10 seconds)
   * @example "10000"
   */
  readonly VITE_REFRESH_INTERVAL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
