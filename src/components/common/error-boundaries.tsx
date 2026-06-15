'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showRetry?: boolean
  showHome?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip anything that looks like a file path or internal detail from error messages. */
function sanitizeError(message: string): string {
  return message
    .replace(/at\s+[\w$]+.*\n?/g, '')
    .replace(/\/[^\s)]+/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
}

// ---------------------------------------------------------------------------
// 1. ErrorBoundary – Generic class-component wrapper
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback takes priority
      if (this.props.fallback) {
        return this.props.fallback
      }

      const message = sanitizeError(this.state.error?.message ?? 'An unexpected error occurred.')
      const { showRetry = true, showHome = true } = this.props

      return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 text-center min-h-[200px]">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground max-w-md">{message}</p>
          </div>

          <div className="flex items-center gap-3">
            {showRetry && (
              <Button variant="outline" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {showHome && (
              <Button variant="default" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// 2. PageErrorBoundary – Full-page centered error UI
// ---------------------------------------------------------------------------

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <PageErrorBoundaryClass>{children}</PageErrorBoundaryClass>
}

// Re-export the class as a named component for direct usage with full-page UI
export class PageErrorBoundaryClass extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[PageErrorBoundary]', error, errorInfo)
  }

  private handleRetry = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      const message = sanitizeError(this.state.error?.message ?? 'An unexpected error occurred.')

      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
          <div className="flex flex-col items-center gap-6 max-w-lg text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground leading-relaxed">{message}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="default" size="lg" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// 3. SectionErrorBoundary – Compact error card within a section/panel
// ---------------------------------------------------------------------------

export class SectionErrorBoundary extends Component<
  {
    children: ReactNode
    sectionName?: string
    onRetry?: () => void
  },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; sectionName?: string; onRetry?: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary${this.props.sectionName ? ` – ${this.props.sectionName}` : ''}]`, error, errorInfo)
  }

  private handleRetry = () => {
    // If the consumer provided an onRetry (e.g. refetch data), call it first
    this.props.onRetry?.()
    // Then reset the boundary state so React re-renders children
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {this.props.sectionName
                  ? `This section (${this.props.sectionName}) failed to load`
                  : 'This section failed to load'}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {sanitizeError(this.state.error?.message ?? 'An unexpected error occurred.')}
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={this.handleRetry}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}