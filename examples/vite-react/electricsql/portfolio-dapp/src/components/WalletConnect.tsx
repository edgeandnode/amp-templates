import { useAccount, useConnect, useDisconnect } from "wagmi"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const MetaMaskConnector = connectors.find((connector) => connector.name.toLowerCase() === "metamask")!

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
          <span className="mr-2">●</span>
          Connected
        </div>
        <span className="font-mono text-sm text-gray-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        key={MetaMaskConnector.id}
        onClick={() => connect({ connector: MetaMaskConnector })}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Connect {MetaMaskConnector?.name}
      </button>
    </div>
  )
}
