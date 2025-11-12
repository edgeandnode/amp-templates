import { ERC20TransfersTable } from "./components/Table"
import "./App.css"

function App() {
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
