import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { type Address, formatUnits } from "viem"
import { useReadContracts } from "wagmi"

import type { ERC20Transfer } from "../lib/schemas"

const ERC20_METADATA_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const

interface TransactionTableProps {
  transfers: ERC20Transfer[]
  address?: Address
  loading?: boolean
}

export function TransactionTable({ transfers, address, loading = false }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "blockNum", desc: true }])

  // Get unique token addresses
  const uniqueTokenAddresses = useMemo(() => {
    const addressSet = new Set<string>()
    transfers.forEach((transfer) => {
      addressSet.add(`${transfer.contractAddress}`)
    })
    return Array.from(addressSet)
  }, [transfers])

  // Fetch token metadata
  const { data: tokenMetadata } = useReadContracts({
    contracts: uniqueTokenAddresses.flatMap((tokenAddress) => [
      { address: tokenAddress as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "symbol" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "name" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_METADATA_ABI, functionName: "decimals" },
    ]),
  })

  // Create a map of token address to metadata
  const tokenMetadataMap = useMemo(() => {
    if (!tokenMetadata) return new Map<string, { symbol: string; name: string; decimals: number }>()

    const map = new Map<string, { symbol: string; name: string; decimals: number }>()
    uniqueTokenAddresses.forEach((tokenAddress, index) => {
      const metadataIndex = index * 3
      const symbolResult = tokenMetadata[metadataIndex]
      const nameResult = tokenMetadata[metadataIndex + 1]
      const decimalsResult = tokenMetadata[metadataIndex + 2]

      if (
        symbolResult?.status === "success" &&
        nameResult?.status === "success" &&
        decimalsResult?.status === "success"
      ) {
        map.set(tokenAddress.toLowerCase(), {
          symbol: symbolResult.result as string,
          name: nameResult.result as string,
          decimals: decimalsResult.result as number,
        })
      }
    })
    return map
  }, [tokenMetadata, uniqueTokenAddresses])

  const columns = useMemo<ColumnDef<ERC20Transfer>[]>(
    () => [
      {
        accessorKey: "blockNum",
        header: "Block",
        cell: (info) => <span className="font-mono text-sm text-gray-300">{String(info.getValue())}</span>,
      },
      {
        accessorKey: "txHash",
        header: "Transaction Hash",
        cell: (info) => {
          const hash = info.getValue() as string
          return (
            <span className="cursor-pointer font-mono text-sm text-blue-400 hover:text-blue-300">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </span>
          )
        },
      },
      {
        accessorKey: "contractAddress",
        header: "Token",
        cell: (info) => {
          const tokenAddress = info.getValue() as string
          const metadata = tokenMetadataMap.get(tokenAddress.toLowerCase())

          if (metadata) {
            return (
              <div>
                <span className="font-semibold text-white">{metadata.symbol}</span>
                <span className="ml-2 text-xs text-gray-400">{metadata.name}</span>
              </div>
            )
          }

          return (
            <span className="font-mono text-xs text-gray-400">
              {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
            </span>
          )
        },
      },
      {
        id: "direction",
        header: "Direction",
        cell: (info) => {
          const from = info.row.original.fromAddress.toLowerCase()
          const userAddress = address?.toLowerCase() || ""
          const isSent = from === userAddress

          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                isSent ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
              }`}
            >
              {isSent ? "Sent" : "Received"}
            </span>
          )
        },
      },
      {
        id: "fromTo",
        header: "From / To",
        cell: (info) => {
          const from = info.row.original.fromAddress
          const to = info.row.original.toAddress
          const userAddress = address?.toLowerCase() || ""
          const isSent = from.toLowerCase() === userAddress

          return (
            <div className="text-sm">
              <div className="text-gray-400">
                {isSent ? "To" : "From"}:{" "}
                <span className="font-mono text-white">
                  {isSent ? to.slice(0, 6) : from.slice(0, 6)}...{isSent ? to.slice(-4) : from.slice(-4)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: "amount",
        header: "Amount",
        cell: (info) => {
          const tokenAddress = info.row.original.contractAddress
          const metadata = tokenMetadataMap.get(tokenAddress.toLowerCase())
          const decimals = metadata?.decimals ?? 18

          const amount = info.row.original.amountRaw
          const formatted = formatUnits(amount, decimals)

          return (
            <div>
              <span className="font-mono text-white">
                {parseFloat(formatted).toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })}
              </span>
              {metadata && <span className="ml-2 text-xs text-gray-400">{metadata.symbol}</span>}
            </div>
          )
        },
      },
      {
        accessorKey: "txTimestamp",
        header: "Timestamp",
        cell: (info) => {
          const timestamp = info.getValue() as number
          try {
            const date = new Date(timestamp * 1000)
            return <span className="text-sm text-gray-400">{date.toLocaleString()}</span>
          } catch {
            return <span className="text-sm text-gray-400">{timestamp}</span>
          }
        },
      },
    ],
    [address, tokenMetadataMap],
  )

  const table = useReactTable({
    data: transfers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50">
      <div className="border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">
          Transaction History {loading && <span className="text-sm text-gray-400">(refreshing...)</span>}
        </h3>
        <p className="mt-1 text-sm text-gray-400">{transfers.length} transaction(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-gray-700/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
