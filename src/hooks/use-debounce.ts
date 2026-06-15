'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Debounces a value by the given delay in milliseconds.
 * Only updates the returned value after the delay has passed
 * without the value changing.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Returns a debounced version of the given callback.
 * The callback will only fire after the specified delay
 * has elapsed since the last invocation.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastArgsRef = useRef<Parameters<T> | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref fresh
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (delay <= 0) {
        callbackRef.current(...args)
        return
      }

      lastArgsRef.current = args

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        if (lastArgsRef.current !== null) {
          callbackRef.current(...lastArgsRef.current)
          lastArgsRef.current = null
        }
        timerRef.current = null
      }, delay)
    },
    [delay]
  ) as T
}
