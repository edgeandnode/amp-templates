import { XCircleIcon } from "@graphprotocol/gds-react/icons"
import { useERC20Transfers } from "../hooks/useERC20Transfers"

export function ERC20TransfersTable() {
  const { data: transfers, isPending, isError, error, isFetching } = useERC20Transfers()

  if (isError) {
    return (
      <div className="rounded-md bg-sonja-500 p-4 outline outline-sonja-600">
        <div className="flex">
          <div className="shrink-0">
            <XCircleIcon size={5} alt="" aria-hidden="true" className="text-white" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-white">Failure fetching ERC20 transfers</h3>
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
        <div className="text-sm text-space-500">Loading transfers...</div>
      </div>
    )
  }

  return (
    <div className="flow-root relative">
      {/* Background refresh indicator */}
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 z-10">
          <div className="rounded-md bg-space-1200 px-3 py-1 text-xs text-space-500 shadow-sm">
            Refreshing...
          </div>
        </div>
      )}

      <div className="-my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="relative min-w-full divide-y divide-space-1200">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-0">
                  Block #
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Timestamp
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Tx Hash
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  From
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  To
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {transfers.map((transfer) => (
                <tr key={`${transfer.txHash}-${transfer.fromAddress}-${transfer.toAddress}`}>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-0 text-white">
                    {transfer.blockNum}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-space-500">
                    {new Date(transfer.txTimestamp * 1000).toISOString()}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-space-500 font-mono">
                    {transfer.txHash.slice(0, 12)}...
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-space-500 font-mono">
                    {transfer.fromAddress.slice(0, 10)}...
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-space-500 font-mono">
                    {transfer.toAddress.slice(0, 10)}...
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-space-500 font-mono">
                    {transfer.amountRaw.toString()}
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
