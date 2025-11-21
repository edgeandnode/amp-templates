import { ERC20TransfersTable } from "./components/Table"
import { useAutoRefresh } from "./hooks/useAutoRefresh"
import "./App.css"

function App() {
  // Enable automatic polling for transfer data every 10 seconds (configurable via VITE_REFRESH_INTERVAL)
  useAutoRefresh()

  return (
    <div className="bg-space-1400 min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Transfer Events</h1>
        <ERC20TransfersTable />
      </div>
    </div>
  )
}

export default App
