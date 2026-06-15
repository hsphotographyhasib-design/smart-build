// ---------------------------------------------------------------------------
// Client-side error monitoring utility
// ---------------------------------------------------------------------------

export interface ErrorEvent {
  type: 'api' | 'render' | 'interaction' | 'network'
  message: string
  stack?: string
  url?: string
  timestamp: number
  userAgent?: string
  severity: 'critical' | 'warning' | 'info'
}

// ---------------------------------------------------------------------------
// ErrorMonitor class
// ---------------------------------------------------------------------------

class ErrorMonitor {
  private errors: ErrorEvent[] = []
  private maxErrors: number = 100

  /** Record an error event. */
  log(event: ErrorEvent): void {
    this.errors.push(event)

    // Evict oldest entries when we exceed the cap
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Always echo to the native console for developer tooling
    if (event.severity === 'critical') {
      console.error(`[ErrorMonitor][${event.type}]`, event.message, event.stack ?? '')
    } else if (event.severity === 'warning') {
      console.warn(`[ErrorMonitor][${event.type}]`, event.message)
    } else {
      console.info(`[ErrorMonitor][${event.type}]`, event.message)
    }
  }

  /** Return the most recent N errors (newest first). */
  getErrors(limit?: number): ErrorEvent[] {
    if (!limit || limit >= this.errors.length) {
      return [...this.errors].reverse()
    }
    return this.errors.slice(-limit).reverse()
  }

  /** Return a count of errors grouped by type. */
  getCountByType(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const e of this.errors) {
      counts[e.type] = (counts[e.type] ?? 0) + 1
    }
    return counts
  }

  /** Clear all stored errors. */
  clear(): void {
    this.errors = []
  }

  /** Get a compact summary of the current error state. */
  getSummary(): { total: number; critical: number; byType: Record<string, number> } {
    let critical = 0
    const byType: Record<string, number> = {}

    for (const e of this.errors) {
      if (e.severity === 'critical') critical++
      byType[e.type] = (byType[e.type] ?? 0) + 1
    }

    return { total: this.errors.length, critical, byType }
  }
}

/** Singleton error monitor instance. */
export const errorMonitor = new ErrorMonitor()

// ---------------------------------------------------------------------------
// React hook – convenient error handler for components
// ---------------------------------------------------------------------------

export function useErrorHandler(): {
  handleError: (error: Error, context?: string) => void
} {
  return {
    handleError: (error: Error, context?: string) => {
      errorMonitor.log({
        type: 'interaction',
        message: context ? `${context}: ${error.message}` : error.message,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        severity: 'critical',
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Global unhandled error listeners
// ---------------------------------------------------------------------------

/**
 * Initialise global error listeners.
 * Call once in a client layout (e.g. inside a `useEffect`).
 * Returns a cleanup function that removes all listeners.
 */
export function initErrorMonitoring(): () => void {
  // --- Unhandled promise rejections ---
  const handleRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault()
    const message =
      event.reason instanceof Error ? event.reason.message : String(event.reason)
    const stack = event.reason instanceof Error ? event.reason.stack : undefined

    errorMonitor.log({
      type: 'api',
      message,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity: 'critical',
    })
  }

  // --- Uncaught runtime errors ---
  // Use globalThis.ErrorEvent to avoid shadowing by our own exported ErrorEvent interface
  const handleError = (event: globalThis.ErrorEvent) => {
    // DOM ErrorEvent – `event.error` may be an Error object
    const errorObj = (event as unknown as { error?: Error }).error
    const message = errorObj instanceof Error ? errorObj.message : event.message
    const stack = errorObj instanceof Error ? errorObj.stack : undefined
    const filename = (event as unknown as { filename?: string }).filename

    errorMonitor.log({
      type: 'render',
      message,
      stack,
      url: filename ?? (typeof window !== 'undefined' ? window.location.href : undefined),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity: 'critical',
    })
  }

  window.addEventListener('unhandledrejection', handleRejection as EventListener)
  window.addEventListener('error', handleError as EventListener)

  // Return cleanup function
  return () => {
    window.removeEventListener('unhandledrejection', handleRejection as EventListener)
    window.removeEventListener('error', handleError as EventListener)
  }
}