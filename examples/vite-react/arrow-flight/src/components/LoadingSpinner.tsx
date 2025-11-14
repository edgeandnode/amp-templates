interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  )
}
