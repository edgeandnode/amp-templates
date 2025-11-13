/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMP_GATEWAY_URL?: string
  readonly VITE_AMP_ACCESS_TOKEN?: string
  readonly VITE_REQUEST_TIMEOUT?: string
  readonly VITE_POLLING_INTERVAL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
