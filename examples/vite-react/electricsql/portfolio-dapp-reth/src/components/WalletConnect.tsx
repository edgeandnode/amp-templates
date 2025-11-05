import { useConnect } from "wagmi"

export function WalletConnect() {
  const { connect, connectors } = useConnect()

  // Find connectors - simple and direct like other examples
  const portoConnector = connectors.find((connector) => connector.name.toLowerCase() === "porto")
  const metaMaskConnector = connectors.find((connector) => connector.name.toLowerCase() === "metamask")

  return (
    <div className="flex flex-col gap-4">
      {portoConnector && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => connect({ connector: portoConnector })}
            className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-blue-700"
          >
            <div className="flex items-center justify-center gap-2">
              <span>🔐</span>
              <span>Connect Porto Wallet</span>
            </div>
          </button>
          <p className="text-xs text-gray-400 text-center">
            Porto uses WebAuthn/Passkeys - no seed phrases needed
          </p>
        </div>
      )}
      
      {metaMaskConnector && (
        <div className="flex flex-col gap-2">
          <button
            key={metaMaskConnector.id}
            onClick={() => connect({ connector: metaMaskConnector })}
            className="rounded-md bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-medium text-white transition-colors hover:from-orange-600 hover:to-orange-700"
          >
            <div className="flex items-center justify-center gap-2">
              <span>🦊</span>
              <span>Connect {metaMaskConnector.name}</span>
            </div>
          </button>
          <p className="text-xs text-gray-400 text-center">
            Make sure MetaMask extension is installed
          </p>
        </div>
      )}

      {!portoConnector && !metaMaskConnector && (
        <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4">
          <p className="text-sm text-yellow-400">
            No wallet connectors available. Please install MetaMask or ensure Porto wallet is available.
          </p>
        </div>
      )}
    </div>
  )
}
