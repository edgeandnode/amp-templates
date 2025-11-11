import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import type { PortfolioBalance } from "../types/portfolio"

interface PortfolioTableProps {
  balances: PortfolioBalance[]
  onTransfer?: (tokenAddress: string, tokenSymbol: string) => void
}

export function PortfolioTable({ balances, onTransfer }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<PortfolioBalance>[]>(
    () => [
      {
        accessorKey: "tokenSymbol",
        header: "Symbol",
        cell: (info) => <span className="font-semibold text-white">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "tokenName",
        header: "Token",
        cell: (info) => <span className="text-gray-300">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "chain",
        header: "Chain",
        cell: (info) => (
          <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "tokenAddress",
        header: "Contract Address",
        cell: (info) => {
          const address = info.getValue() as string
          return (
            <span className="font-mono text-sm text-gray-400">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )
        },
      },
      {
        accessorKey: "balanceFormatted",
        header: "Balance",
        cell: (info) => (
          <span className="font-mono text-white">
            {parseFloat(info.getValue() as string).toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <button
            onClick={() => onTransfer?.(info.row.original.tokenAddress, info.row.original.tokenSymbol)}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Transfer
          </button>
        ),
      },
    ],
    [onTransfer],
  )

  const table = useReactTable({
    data: balances,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (balances.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
        <p className="text-gray-400">No tokens found in your portfolio</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50">
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
  )
}
