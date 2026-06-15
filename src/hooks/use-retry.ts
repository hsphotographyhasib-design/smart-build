'use client'

import { useState, useCallback, useRef } from 'react'

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number
  /** Base delay in milliseconds before the first retry (default: 1000) */
  baseDelay: number
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelay: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffFactor: number
}

export interface RetryState {
  /** Current number of retries that have been attempted */
  retryCount: number
  /** The last error that triggered a retry, or null */
  lastError: Error | null
  /** Whether a retry is currently in flight */
  isRetrying: boolean
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
}

/**
 * Provides retry logic with exponential backoff for async operations.
 *
 * @example
 * const { execute, retryState, reset, canRetry } = useRetry({ maxRetries: 5 })
 *
 * // In an event handler:
 * const result = await execute(() => fetch('/api/data'))
 *
 * // Check state in JSX:
 * if (retryState.isRetrying) return <Spinner />
 * if (retryState.lastError) return <Error error={retryState.lastError} />
 */
export function useRetry(config?: Partial<RetryConfig>): {
  retryState: RetryState
  execute: (fn: () => Promise<any>) => Promise<any>
  reset: () => void
  canRetry: boolean
} {
  const resolvedConfig = { ...DEFAULT_CONFIG, ...config }

  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    lastError: null,
    isRetrying: false,
  })

  const retryCountRef = useRef(0)
  const abortRef = useRef(false)

  const canRetry = retryState.retryCount < resolvedConfig.maxRetries

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay =
        resolvedConfig.baseDelay * Math.pow(resolvedConfig.backoffFactor, attempt)
      return Math.min(delay, resolvedConfig.maxDelay)
    },
    [
      resolvedConfig.baseDelay,
      resolvedConfig.backoffFactor,
      resolvedConfig.maxDelay,
    ]
  )

  const execute = useCallback(
    async (fn: () => Promise<any>): Promise<any> => {
      abortRef.current = false

      while (retryCountRef.current <= resolvedConfig.maxRetries) {
        try {
          // Attempt the operation
          const result = await fn()

          // Success – reset state
          retryCountRef.current = 0
          setRetryState({
            retryCount: 0,
            lastError: null,
            isRetrying: false,
          })

          return result
        } catch (error: any) {
          const currentAttempt = retryCountRef.current

          // If aborted or no retries left, throw
          if (abortRef.current || currentAttempt >= resolvedConfig.maxRetries) {
            setRetryState({
              retryCount: currentAttempt,
              lastError: error instanceof Error ? error : new Error(String(error)),
              isRetrying: false,
            })
            throw error
          }

          // Update retry state
          retryCountRef.current += 1
          setRetryState({
            retryCount: retryCountRef.current,
            lastError: error instanceof Error ? error : new Error(String(error)),
            isRetrying: true,
          })

          // Wait before retrying with exponential backoff
          const delay = calculateDelay(currentAttempt)

          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              if (!abortRef.current) {
                resolve()
              }
            }, delay)

            // Store timer so we can clean up if needed
            return () => clearTimeout(timer)
          })
        }
      }

      // This should not be reached, but just in case
      throw new Error('Max retries exceeded')
    },
    [resolvedConfig.maxRetries, calculateDelay]
  )

  const reset = useCallback(() => {
    abortRef.current = true
    retryCountRef.current = 0
    setRetryState({
      retryCount: 0,
      lastError: null,
      isRetrying: false,
    })
  }, [])

  return {
    retryState,
    execute,
    reset,
    canRetry,
  }
}
