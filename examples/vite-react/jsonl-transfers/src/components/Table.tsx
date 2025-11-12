import { XCircleIcon } from "@graphprotocol/gds-react/icons"
import { useERC20Transfers } from "../hooks/useERC20Transfers"
import { shortenAddress, formatTimestamp } from "../lib/utils"

export function ERC20TransfersTable() {
  const { data: transfers, isPending, isError, error, isFetching } = useERC20Transfers()

  if (isError) {
    return (
      <div className="bg-sonja-500 outline-sonja-600 rounded-md p-4 outline">
        <div className="flex">
          <div className="shrink-0">
            <XCircleIcon size={5} alt="" aria-hidden="true" className="text-white" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-white">Failure fetching transfer events</h3>
            <div className="mt-2 text-sm text-white">
              <ul role="list" className="list-disc space-y-1 pl-5">
                <li>{error.message}</li>
                {error.cause != null ? <li>{JSON.stringify(error.cause)}</li> : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isPending || !transfers) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-space-500 text-sm">Loading transfers...</div>
      </div>
    )
  }

  return (
    <div className="relative flow-root">
      {/* Background refresh indicator */}
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-space-1200 text-space-500 rounded-md px-3 py-1 text-xs shadow-sm">Refreshing...</div>
        </div>
      )}

      <div className="-my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="divide-space-1200 relative min-w-full divide-y">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-0">
                  Block #
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Timestamp
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  From
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  To
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Contract
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Amount
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {transfers.map((transfer) => (
                <tr key={`${transfer.txHash}-${transfer.tokenAddress}-${transfer.fromAddress}-${transfer.toAddress}`}>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-0">
                    {transfer.blockNum}
                  </td>
                  <td className="text-space-500 px-3 py-4 text-sm whitespace-nowrap">
                    {formatTimestamp(transfer.txTimestamp)}
                  </td>
                  <td className="text-space-500 px-3 py-4 font-mono text-sm whitespace-nowrap">
                    {shortenAddress(transfer.fromAddress)}
                  </td>
                  <td className="text-space-500 px-3 py-4 font-mono text-sm whitespace-nowrap">
                    {shortenAddress(transfer.toAddress)}
                  </td>
                  <td className="text-space-500 px-3 py-4 font-mono text-sm whitespace-nowrap">
                    <a
                      href={`https://arbiscan.io/address/${transfer.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white hover:underline"
                    >
                      {shortenAddress(transfer.tokenAddress)}
                    </a>
                  </td>
                  <td className="text-space-500 px-3 py-4 font-mono text-sm whitespace-nowrap">
                    {transfer.amountRaw.toString()}
                  </td>
                  <td className="text-space-500 px-3 py-4 font-mono text-sm whitespace-nowrap">
                    <a
                      href={`https://arbiscan.io/tx/${transfer.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white hover:underline"
                    >
                      {transfer.txHash.slice(0, 12)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
