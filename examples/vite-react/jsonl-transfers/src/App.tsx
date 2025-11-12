import { ERC20TransfersTable } from "./components/Table"
import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-space-1400 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-white mb-8">Token Transfers</h1>
        <ERC20TransfersTable />
      </div>
    </div>
  )
}

export default App
