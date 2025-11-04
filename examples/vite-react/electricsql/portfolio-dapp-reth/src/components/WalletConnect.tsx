import { useConnect } from "wagmi"

export function WalletConnect() {
  const { connect, connectors } = useConnect()

  // Find Porto connector
  const portoConnector = connectors.find((connector) => connector.name.toLowerCase() === "porto")

  if (!portoConnector) {
    return (
      <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4">
        <p className="text-sm text-yellow-400">
          Porto wallet connector not found. Please ensure Porto wallet is available.
        </p>
      </div>
    )
  }

  return (
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
      <p className="mt-2 text-xs text-gray-400 text-center">
        Porto uses WebAuthn/Passkeys - no seed phrases needed
      </p>
    </div>
  )
}
