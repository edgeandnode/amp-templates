import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
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
  onSuccess?: () => void | Promise<void>
}

export function TransferModal({ isOpen, onClose, tokenAddress, tokenSymbol, decimals, onSuccess }: TransferModalProps) {
  const { address: userAddress } = useAccount()
  const [recipient, setRecipient] = useState<Address>("0x")
  const [amount, setAmount] = useState<bigint>()
  const [toastId, setToastId] = useState<string | number | null>(null)

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash })

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash && toastId) {
      toast.success(`Successfully transferred ${amount} ${tokenSymbol}!`, { id: toastId })
      setRecipient("0x")
      setAmount(0n)
      setToastId(null)

      // Trigger refresh callback if provided
      if (onSuccess) {
        onSuccess()
      }

      onClose()
    }
  }, [isSuccess, hash, tokenSymbol, amount, toastId, onClose, onSuccess])

  // Handle transaction errors
  useEffect(() => {
    if (writeError && toastId) {
      toast.error(`Transfer failed: ${writeError.message}`, { id: toastId })
      setToastId(null)
    }
  }, [writeError, toastId])

  useEffect(() => {
    if (isError && toastId) {
      toast.error(`Transaction failed`, { id: toastId })
      setToastId(null)
    }
  }, [isError, toastId])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipient || !amount) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const parsedAmount = parseUnits(amount.toString(), decimals)

      const toastId = toast.loading(`Transferring ${amount} ${tokenSymbol}...`)
      setToastId(toastId)

      writeContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient as Address, parsedAmount],
      })
    } catch (error) {
      console.error("Transfer error:", error)
      if (toastId) {
        toast.error("Transfer failed. Please try again.", { id: toastId })
        setToastId(null)
      } else {
        toast.error("Transfer failed. Please try again.")
      }
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !isPending && !isConfirming && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold text-white">Transfer {tokenSymbol}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending || isConfirming}
              >
                ✕
              </button>
            </Dialog.Close>
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
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={isPending || isConfirming}
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
                value={amount?.toString()}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={isPending || isConfirming}
              />
            </div>

            <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-400">
              <p>
                From:{" "}
                <span className="font-mono">
                  {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                </span>
              </p>
              <p className="mt-1">Token: {tokenSymbol}</p>
              <p className="mt-1 font-mono text-xs text-gray-400">
                {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
              </p>
            </div>

            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending || isConfirming}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
