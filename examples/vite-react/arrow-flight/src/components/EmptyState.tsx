interface EmptyStateProps {
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({ message = "No data found", icon }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
      {icon}
      <p className="text-gray-400">{message}</p>
    </div>
  )
}
