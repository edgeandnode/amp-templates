import { Cause } from "effect"

interface ErrorCardProps {
  title?: string
  message?: string
  cause?: Cause.Cause<unknown>
}

export function ErrorCard({ title = "Error", message = "An error occurred", cause }: ErrorCardProps) {
  return (
    <div className="rounded-lg border border-red-700 bg-red-900/20 p-4">
      <h3 className="text-sm font-semibold text-red-400">{title}</h3>
      <p className="mt-1 text-sm text-red-400">{message}</p>
      {cause && (
        <details className="mt-2 text-xs text-red-300">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 overflow-auto">{Cause.pretty(cause)}</pre>
        </details>
      )}
    </div>
  )
}
