import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for catching errors in atom computations.
 * Wrap components that use atoms with this boundary to prevent
 * the entire app from crashing if an atom fails.
 */
export class AtomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Atom error boundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{ padding: "20px", border: "1px solid red", margin: "10px" }}>
          <h2>Something went wrong loading data</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary>Error details</summary>
            {this.state.error?.message}
          </details>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}
