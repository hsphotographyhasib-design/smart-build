'use client'

import { useState, useCallback, useRef, useMemo } from 'react'

export interface UseSearchOptions {
  /** Debounce delay in milliseconds (default: 400) */
  debounceMs?: number
  /** Initial search query value (default: '') */
  initialQuery?: string
}

export interface UseSearchReturn {
  /** The current raw query string as typed by the user */
  query: string
  /** The debounced version of the query – use this for API calls */
  debouncedQuery: string
  /** Update the search query */
  setQuery: (query: string) => void
  /** Clear the search query */
  clearSearch: () => void
  /** Whether the debounced value is still catching up to the raw query */
  isDebouncing: boolean
}

/**
 * Combined search state management with built-in debouncing.
 *
 * Provides both the raw query (for controlled inputs) and a
 * debounced version (for API calls), so the user gets instant
 * typing feedback while avoiding excessive network requests.
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
