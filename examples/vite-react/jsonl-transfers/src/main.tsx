import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App.tsx"

// Create QueryClient instance with optimized settings for polling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once to avoid long delays on failed endpoints
      staleTime: 5000, // 5 seconds - longer than polling interval to avoid unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - cache old data for better UX
      refetchOnWindowFocus: false, // Polling handles freshness, no need for window focus refetch
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
