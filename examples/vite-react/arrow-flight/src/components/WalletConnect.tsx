import { useConnect } from "wagmi"

export function WalletConnect() {
  const { connect, connectors } = useConnect()

  const MetaMaskOrInjectedConnector = connectors.find(
    (connector) => connector.name.toLowerCase() === "metamask" || "injected",
  )
  if (!MetaMaskOrInjectedConnector) {
    return (
      <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4">
        <p className="text-sm text-yellow-400">
          Wallet not found. Please ensure MetaMask or injected wallet is installed and configured.
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        key={MetaMaskOrInjectedConnector.id}
        onClick={() => connect({ connector: MetaMaskOrInjectedConnector })}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Connect
      </button>
    </div>
  )
}
