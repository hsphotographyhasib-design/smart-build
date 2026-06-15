'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * প্রদত্ত মিলিসেকেন্ড পর্যন্ত মান ডিবাউন্স করে।
 * মান পরিবর্তন না হলে প্রদত্ত মান প্রদান করে না।
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
 * প্রদত্ত কলব্যাকের একটি ডিবাউন্সড সংস্করণ প্রদান করা হচ্ছে।
 * কলব্যাকটি শুধুমাত্র নির্দিষ্ট ডিলে অতিবাহিত হওয়ার
 * পরে চলানোর পর আগে ফায়ার হবে।
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastArgsRef = useRef<Parameters<T> | null>(null)
  const callbackRef = useRef(callback)

  // কলব্যাক রেফ সতেজ রাখা হচ্ছে
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // আনমাউন্টের সময় পরিষ্কার করা হচ্ছে
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
