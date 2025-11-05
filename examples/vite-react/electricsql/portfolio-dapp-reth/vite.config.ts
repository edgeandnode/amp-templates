import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
