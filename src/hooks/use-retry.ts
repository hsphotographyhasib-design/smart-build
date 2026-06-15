'use client'

import { useState, useCallback, useRef } from 'react'

export interface RetryConfig {
  /** সর্বোচ্চ পুনঃচেষ্টার সংখ্যা (ডিফল্ট: ৩) */
  maxRetries: number
  /** প্রথম পুনঃচেষ্টার আগে বেস ডিলে মিলিসেকেন্ড (ডিফল্ট: 1000) */
  baseDelay: number
  /** সর্বোচ্চ ডিলে ক্যাপ মিলিসেকেন্ড (ডিফল্ট: 30000) */
  maxDelay: number
  /** এক্সপোনেনশিয়াল ব্যাকঅফের জন্য গুণক (ডিফল্ট: ২) */
  backoffFactor: number
}

export interface RetryState {
  /** বর্তমানে যত পুনঃচেষ্টা করা হয়েছে */
  retryCount: number
  /** পুনঃচেষ্টা ট্রিগার করে এই শেষ ত্রুটিটি, বা null */
  lastError: Error | null
  /** একটি পুনঃচেষ্টা বর্তমানে চলমান আছে কিনা */
  isRetrying: boolean
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
}

/**
 * অ্যাসিংক অপারেশনের জন্য এক্সপোনেনশিয়াল ব্যাকঅফ সহ একটি হুক।
 *
 * @example
 * const { execute, retryState, reset, canRetry } = useRetry({ maxRetries: 5 })
 *
 * // একটি ইভেন্ট হ্যান্ডলারে:
 * const result = await execute(() => fetch('/api/data'))
 *
 * // JSX-এ অবস্থান পরীক্ষা:
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
          // কার্যকলাপ চেষ্টা করা হচ্ছে
          const result = await fn()

          // সফল – অবস্থা পুনরায় সেট করা হচ্ছে
          retryCountRef.current = 0
          setRetryState({
            retryCount: 0,
            lastError: null,
            isRetrying: false,
          })

          return result
        } catch (error: any) {
          const currentAttempt = retryCountRef.current

          // বাতিল হলে বা পুনঃচেষ্টা বাকি না থাকলে নিক্ষেপ করা হচ্ছে
          if (abortRef.current || currentAttempt >= resolvedConfig.maxRetries) {
            setRetryState({
              retryCount: currentAttempt,
              lastError: error instanceof Error ? error : new Error(String(error)),
              isRetrying: false,
            })
            throw error
          }

          // পুনঃচেষ্টার অবস্থা আপডেট করা হচ্ছে
          retryCountRef.current += 1
          setRetryState({
            retryCount: retryCountRef.current,
            lastError: error instanceof Error ? error : new Error(String(error)),
            isRetrying: true,
          })

          // এক্সপোনেনশিয়াল ব্যাকঅফ সহ পুনঃচেষ্টা করার আগে অপেক্ষমা করা হচ্ছে
          const delay = calculateDelay(currentAttempt)

          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              if (!abortRef.current) {
                resolve()
              }
            }, delay)

            // প্রয়োজন হলে টাইমার পরিষ্কার করতে সংরক্ষণ করা হচ্ছে
            return () => clearTimeout(timer)
          })
        }
      }

      // এটি পৌঁছানো উচিত নয়, তবে সতর্কতার জন্য
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
