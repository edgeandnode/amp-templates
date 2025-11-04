import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Arrow Flight requests to the Amp proxy server
      "/arrow.flight.protocol.FlightService": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("[Vite Proxy] Proxy error:", err)
          })
        },
      },
    },
  },
})
