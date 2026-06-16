'use client'

import { useCallback, useRef, useEffect } from 'react'
import { create } from 'zustand'
import { api, useAppStore, type AppPage } from '@/lib/store'

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface SearchCategory {
  id: string
  label: string
  icon: string
}

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: string
  status?: string
  statusColor?: string
}

export interface SearchCategoryResults {
  category: SearchCategory
  items: SearchResultItem[]
}

export interface SearchResults {
  total: number
  categories: SearchCategoryResults[]
}

export interface UseGlobalSearchReturn {
  /** Whether the search dialog is open */
  isOpen: boolean
  /** Current raw query string */
  query: string
  /** Current search results */
  results: SearchResults | null
  /** Recent search queries from localStorage */
  recentSearches: string[]
  /** Currently selected category filter (null = all) */
  selectedCategory: string | null
  /** Whether a search request is in flight */
  isLoading: boolean
  /** Open the search dialog */
  open: () => void
  /** Close the search dialog */
  close: () => void
  /** Toggle the search dialog */
  toggle: () => void
  /** Set query (also triggers debounced search) */
  setQuery: (query: string) => void
  /** Clear the query */
  clearQuery: () => void
  /** Add a query to recent searches */
  addRecentSearch: (query: string) => void
  /** Clear all recent searches from localStorage */
  clearRecentSearches: () => void
  /** Set the active category filter */
  setSelectedCategory: (category: string | null) => void
  /** Navigate to a search result */
  navigateToResult: (item: SearchResultItem) => void
}

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

const RECENT_STORAGE_KEY = 'sb_search_history'
const MAX_RECENT = 10
const DEBOUNCE_MS = 300
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  results: SearchResults
  timestamp: number
}

// ─────────────────────────────────────────────────────────────────────
// Category configuration
// ─────────────────────────────────────────────────────────────────────

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'all', label: 'All', icon: 'search' },
  { id: 'projects', label: 'Projects', icon: 'folder-kanban' },
  { id: 'complaints', label: 'Complaints', icon: 'alert-triangle' },
  { id: 'work_orders', label: 'Work Orders', icon: 'wrench' },
  { id: 'customers', label: 'Customers', icon: 'users' },
  { id: 'invoices', label: 'Invoices', icon: 'file-text' },
  { id: 'payments', label: 'Payments', icon: 'receipt' },
  { id: 'purchase_orders', label: 'Purchase Orders', icon: 'shopping-cart' },
  { id: 'suppliers', label: 'Suppliers', icon: 'users' },
  { id: 'inventory', label: 'Inventory', icon: 'package' },
  { id: 'employees', label: 'Employees', icon: 'user-check' },
  { id: 'assets', label: 'Assets', icon: 'wrench' },
  { id: 'tasks', label: 'Tasks', icon: 'clipboard-list' },
  { id: 'audit_logs', label: 'Audit Logs', icon: 'shield-check' },
]

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentSearches(searches: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(searches))
  } catch {
    // Silently fail
  }
}

// Simple in-memory cache
const searchCache = new Map<string, CacheEntry>()

function getCachedResults(key: string): SearchResults | null {
  const entry = searchCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key)
    return null
  }
  return entry.results
}

function setCachedResults(key: string, results: SearchResults) {
  searchCache.set(key, { results, timestamp: Date.now() })
}

// Navigation mapping
const CATEGORY_NAV_MAP: Record<string, { page: AppPage; paramKey?: string }> = {
  projects: { page: 'project-detail', paramKey: 'id' },
  complaints: { page: 'client-complaints' },
  work_orders: { page: 'work-orders' },
  customers: { page: 'customers' },
  invoices: { page: 'invoices' },
  payments: { page: 'payments' },
  purchase_orders: { page: 'purchase-orders' },
  suppliers: { page: 'suppliers' },
  inventory: { page: 'inventory' },
  employees: { page: 'employees' },
  assets: { page: 'assets' },
  tasks: { page: 'project-tasks' },
  audit_logs: { page: 'audit-log' },
}

// ─────────────────────────────────────────────────────────────────────
// Shared Zustand store — single source of truth for search state
// ─────────────────────────────────────────────────────────────────────

interface GlobalSearchState {
  isOpen: boolean
  query: string
  results: SearchResults | null
  recentSearches: string[]
  selectedCategory: string | null
  isLoading: boolean

  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  clearQuery: () => void
  setResults: (results: SearchResults | null) => void
  setLoading: (loading: boolean) => void
  setSelectedCategory: (category: string | null) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  navigateToResult: (item: SearchResultItem) => void
}

export const useGlobalSearchStore = create<GlobalSearchState>((set, get) => ({
  isOpen: false,
  query: '',
  results: null,
  recentSearches: typeof window !== 'undefined' ? loadRecentSearches() : [],
  selectedCategory: null,
  isLoading: false,

  open: () => set({ isOpen: true, recentSearches: loadRecentSearches() }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => {
    if (!s.isOpen) return { isOpen: true, recentSearches: loadRecentSearches() }
    return { isOpen: false }
  }),

  setQuery: (newQuery: string) => {
    set({ query: newQuery })
    if (!newQuery.trim()) {
      set({ results: null, isLoading: false })
    }
    // Debounced search is handled in the hook via useEffect
  },

  clearQuery: () => set({
    query: '',
    results: null,
    isLoading: false,
    selectedCategory: null,
  }),

  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addRecentSearch: (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    set((s) => {
      const filtered = s.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT)
      saveRecentSearches(updated)
      return { recentSearches: updated }
    })
  },

  clearRecentSearches: () => {
    saveRecentSearches([])
    set({ recentSearches: [] })
  },

  navigateToResult: (item: SearchResultItem) => {
    get().addRecentSearch(item.title)

    const navInfo = CATEGORY_NAV_MAP[item.category]
    if (navInfo) {
      if (navInfo.paramKey && item.id) {
        useAppStore.getState().navigate(navInfo.page, { [navInfo.paramKey]: item.id })
      } else {
        useAppStore.getState().navigate(navInfo.page)
      }
    }

    set({ isOpen: false, query: '', results: null })
  },
}))

// ─────────────────────────────────────────────────────────────────────
// React hook with debounced search + keyboard shortcut
// ─────────────────────────────────────────────────────────────────────

export function useGlobalSearch(): UseGlobalSearchReturn {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const isOpen = useGlobalSearchStore((s) => s.isOpen)
  const query = useGlobalSearchStore((s) => s.query)
  const results = useGlobalSearchStore((s) => s.results)
  const recentSearches = useGlobalSearchStore((s) => s.recentSearches)
  const selectedCategory = useGlobalSearchStore((s) => s.selectedCategory)
  const isLoading = useGlobalSearchStore((s) => s.isLoading)

  const open = useGlobalSearchStore((s) => s.open)
  const close = useGlobalSearchStore((s) => s.close)
  const toggle = useGlobalSearchStore((s) => s.toggle)
  const setSelectedCategory = useGlobalSearchStore((s) => s.setSelectedCategory)
  const addRecentSearch = useGlobalSearchStore((s) => s.addRecentSearch)
  const clearRecentSearches = useGlobalSearchStore((s) => s.clearRecentSearches)
  const navigateToResult = useGlobalSearchStore((s) => s.navigateToResult)

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!query.trim()) {
      useGlobalSearchStore.getState().setResults(null)
      useGlobalSearchStore.getState().setLoading(false)
      return
    }

    const currentCategory = useGlobalSearchStore.getState().selectedCategory
    const cacheKey = `${query.trim().toLowerCase()}__${currentCategory || 'all'}`
    const cached = getCachedResults(cacheKey)

    if (cached) {
      useGlobalSearchStore.getState().setResults(cached)
      useGlobalSearchStore.getState().setLoading(false)
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      useGlobalSearchStore.getState().setLoading(true)

      try {
        const cat = useGlobalSearchStore.getState().selectedCategory
        const params = new URLSearchParams()
        params.set('q', query.trim())
        if (cat && cat !== 'all') {
          params.set('category', cat)
        }
        params.set('limit', '20')

        const response = await api.get<SearchResults>(`/api/search?${params.toString()}`)

        if (controller.signal.aborted) return

        if (response.success && response.data) {
          useGlobalSearchStore.getState().setResults(response.data)
          setCachedResults(cacheKey, response.data)
        } else {
          useGlobalSearchStore.getState().setResults(null)
        }
      } catch {
        if (!controller.signal.aborted) {
          useGlobalSearchStore.getState().setResults(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          useGlobalSearchStore.getState().setLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  // Re-search when category changes (if there's already a query)
  useEffect(() => {
    if (query.trim() && selectedCategory !== null) {
      // Clear cache for category change
      const cacheKey = `${query.trim().toLowerCase()}__${selectedCategory || 'all'}`
      const cached = getCachedResults(cacheKey)
      if (cached) {
        useGlobalSearchStore.getState().setResults(cached)
      } else {
        // Trigger a new search by re-setting the query
        // We need to directly call the search logic
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        if (abortRef.current) {
          abortRef.current.abort()
        }
        const controller = new AbortController()
        abortRef.current = controller

        useGlobalSearchStore.getState().setLoading(true)

        api.get<SearchResults>(`/api/search?q=${encodeURIComponent(query.trim())}&category=${selectedCategory || 'all'}&limit=20`)
          .then((response) => {
            if (controller.signal.aborted) return
            if (response.success && response.data) {
              const newCacheKey = `${query.trim().toLowerCase()}__${selectedCategory || 'all'}`
              useGlobalSearchStore.getState().setResults(response.data)
              setCachedResults(newCacheKey, response.data)
            } else {
              useGlobalSearchStore.getState().setResults(null)
            }
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              useGlobalSearchStore.getState().setResults(null)
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              useGlobalSearchStore.getState().setLoading(false)
            }
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  const setQuery = useCallback((newQuery: string) => {
    useGlobalSearchStore.getState().setQuery(newQuery)
  }, [])

  const clearQuery = useCallback(() => {
    useGlobalSearchStore.getState().clearQuery()
  }, [])

  return {
    isOpen,
    query,
    results,
    recentSearches,
    selectedCategory,
    isLoading,
    open,
    close,
    toggle,
    setQuery,
    clearQuery,
    addRecentSearch,
    clearRecentSearches,
    setSelectedCategory,
    navigateToResult,
  }
}