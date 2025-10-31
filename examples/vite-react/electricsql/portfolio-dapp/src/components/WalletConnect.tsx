import { useConnect } from "wagmi"

export function WalletConnect() {
  const { connect, connectors } = useConnect()

  const MetaMaskConnector = connectors.find((connector) => connector.name.toLowerCase() === "metamask")!

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
