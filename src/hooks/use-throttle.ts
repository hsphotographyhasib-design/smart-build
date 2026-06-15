'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Throttles a value by the given interval in milliseconds.
 * The returned value updates at most once per interval.
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecutedRef = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastExecutedRef.current

    let timer: ReturnType<typeof setTimeout> | null = null

    if (elapsed >= interval) {
      lastExecutedRef.current = now
      setThrottledValue(value)
    } else {
      const remaining = interval - elapsed
      timer = setTimeout(() => {
        lastExecutedRef.current = Date.now()
        setThrottledValue(value)
      }, remaining)
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
    }
  }, [value, interval])

  return throttledValue
}

/**
 * Returns a throttled version of the given callback.
 * The callback will fire at most once per interval.
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number
): T {
  const lastExecutedRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastArgsRef = useRef<Parameters<T> | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (interval <= 0) {
        callbackRef.current(...args)
        return
      }

      const now = Date.now()
      const elapsed = now - lastExecutedRef.current
      lastArgsRef.current = args

      if (elapsed >= interval) {
        lastExecutedRef.current = now
        callbackRef.current(...args)
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      } else if (timerRef.current === null) {
        const remaining = interval - elapsed
        timerRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now()
          if (lastArgsRef.current !== null) {
            callbackRef.current(...lastArgsRef.current)
          }
          timerRef.current = null
        }, remaining)
      }
    },
    [interval]
  ) as T
}

/**
 * Runs an effect at most once per interval.
 */
export function useThrottledEffect(
  effect: () => void | (() => void),
  deps: any[],
  interval: number
): void {
  const lastExecutedRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cleanupRef = useRef<(() => void) | void>(undefined)
  const effectRef = useRef(effect)

  useEffect(() => {
    effectRef.current = effect
  }, [effect])

  useEffect(() => {
    const runEffect = (): void => {
      const result = effectRef.current()
      if (typeof result === 'function') {
        cleanupRef.current = result
      } else {
        cleanupRef.current = undefined
      }
    }

    const runCleanup = (): void => {
      const cleanup = cleanupRef.current
      cleanupRef.current = undefined
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }

    if (interval <= 0) {
      runCleanup()
      runEffect()
      return
    }

    const now = Date.now()
    const elapsed = now - lastExecutedRef.current

    if (elapsed >= interval) {
      runCleanup()
      lastExecutedRef.current = now
      runEffect()
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    } else if (timerRef.current === null) {
      const remaining = interval - elapsed
      timerRef.current = setTimeout(() => {
        runCleanup()
        lastExecutedRef.current = Date.now()
        runEffect()
        timerRef.current = null
      }, remaining)
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = undefined
      }
    }
  }, deps)
}
