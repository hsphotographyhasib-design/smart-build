'use client'

import { useState, useCallback, useRef, useMemo } from 'react'

export interface UseSearchOptions {
  /** মিলিসেকেন্ড ডিলে (ডিফল্ট: 400) */
  debounceMs?: number
  /** প্রারম্ভিক অনুসন্ধান কোয়েরি মান (ডিফল্ট: '') */
  initialQuery?: string
}

export interface UseSearchReturn {
  /** ব্যবহারকারীর দ্বারা টাইপ করা কোয়েরি স্ট্রিং */
  query: string
  /** কোয়েরির ডিবাউন্সড সংস্করণ – API কলের জন্য এটি ব্যবহার করুন */
  debouncedQuery: string
  /** অনুসন্ধান কোয়েরি আপডেট করুন */
  setQuery: (query: string) => void
  /** অনুসন্ধান কোয়েরি মুছুন */
  clearSearch: () => void
  /** ডিবাউন্সড মান এখনও কাঁচা করছে কিনা তা প্রামাণ কোয়েরির সাথে ধরতে আছে */
  isDebouncing: boolean
}

/**
 * অন্তর্ন্নীয় ডিবাউন্স সহ অনুসন্ধান অবস্থা পরিচালনা।
 *
 * উভয় কাঁচা কোয়েরি (কন্ট্রোলড ইনপুটের জন্য) এবং একটি
 * ডিবাউন্সড সংস্করণ (API কলের জন্য) প্রদান করে, যাতে ব্যবহারকারী তাৎক্ষণিক টাইপিং প্রতিক্রিয়া পায়
 * এবং অতিরিক্ত নেটওয়ার্ক অনুরোধ এড়ায়।
 */
export function useSearch(options?: UseSearchOptions): UseSearchReturn {
  const { debounceMs = 400, initialQuery = '' } = options ?? {}

  const [query, setQueryState] = useState<string>(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery)
  const [isDebouncing, setIsDebouncing] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)

    // Clear any pending timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (debounceMs <= 0) {
      setDebouncedQuery(newQuery)
      setIsDebouncing(false)
      return
    }

    setIsDebouncing(true)

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(newQuery)
      setIsDebouncing(false)
      timerRef.current = null
    }, debounceMs)
  }, [debounceMs])

  const clearSearch = useCallback(() => {
    setQueryState('')
    setDebouncedQuery('')
    setIsDebouncing(false)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    isDebouncing,
  }
}
