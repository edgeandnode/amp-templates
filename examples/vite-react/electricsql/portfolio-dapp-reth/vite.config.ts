import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import mkcert from "vite-plugin-mkcert"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mkcert(), // Enable HTTPS for Porto Wallet (WebAuthn requires secure origins)
    react(),
  ],
  server: {
    proxy: {
      // Proxy ElectricSQL shape requests to the Express proxy server
      "/api/shape-proxy": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("[Vite Proxy] Shape proxy error:", err)
          })
        },
      },
    },
  },
})
