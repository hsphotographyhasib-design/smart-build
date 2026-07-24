'use client'

/**
 * SmartBuild — generic React ErrorBoundary
 *
 * Uses only plain Tailwind classes; no shadcn/ui or external UI deps.
 * Import this when you need a lightweight, self-contained fallback for any
 * subtree.  The richer, shadcn-based variants live in error-boundaries.tsx.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // Custom fallback:
 *   <ErrorBoundary fallback={<p>Oops</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'

// ---------------------------------------------------------------------------
// Props / State
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode
  /** Rendered instead of the default fallback UI when an error is caught. */
  fallback?: ReactNode
  /** Called after the error is caught; useful for Sentry / reporting. */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console (replace / augment with Sentry/OpenTelemetry later)
    console.error('[ErrorBoundary] caught:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    // Custom fallback takes priority
    if (this.props.fallback != null) {
      return this.props.fallback
    }

    // Safe, user-visible error message (no stack leakage)
    const safeMessage =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again.'
        : (this.state.error?.message ?? 'An unexpected error occurred.')

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 rounded-lg border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800/50 dark:bg-amber-950/20"
      >
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h3>
          <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">{safeMessage}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/dashboard'
            }}
            className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7m-9 10V10m6 4v6"
              />
            </svg>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
