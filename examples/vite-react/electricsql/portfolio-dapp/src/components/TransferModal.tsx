import { useState } from "react"
import { toast } from "sonner"
import { type Address, parseUnits } from "viem"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  tokenAddress: string
  tokenSymbol: string
  decimals: number
}

export function TransferModal({ isOpen, onClose, tokenAddress, tokenSymbol, decimals }: TransferModalProps) {
  const { address: userAddress } = useAccount()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipient || !amount) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const parsedAmount = parseUnits(amount, decimals)

      writeContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient as Address, parsedAmount],
      })

      toast.promise(
        new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (isSuccess) {
              clearInterval(checkInterval)
              resolve(hash)
              setRecipient("")
              setAmount("")
              onClose()
            } else if (!isConfirming && !isPending) {
              clearInterval(checkInterval)
              reject()
            }
          }, 100)
        }),
        {
          loading: `Transferring ${amount} ${tokenSymbol}...`,
          success: `Successfully transferred ${amount} ${tokenSymbol}!`,
          error: `Failed to transfer ${tokenSymbol}`,
        },
      )
    } catch (error) {
      console.error("Transfer error:", error)
      toast.error("Transfer failed. Please try again.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Transfer {tokenSymbol}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isPending || isConfirming}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label htmlFor="recipient" className="mb-1 block text-sm font-medium text-gray-300">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-300">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-400">
            <p>
              From: <span className="font-mono">{userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</span>
            </p>
            <p className="mt-1">Token: {tokenSymbol}</p>
            <p className="mt-1 font-mono text-xs text-gray-400">
              {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
              disabled={isPending || isConfirming}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
