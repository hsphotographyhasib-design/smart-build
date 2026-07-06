'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { View } from '@/lib/eppm'
import type { BadgeKey } from '@/lib/navigation'
import { useDashboardData } from '@/components/eppm/use-data'
import { useWorkflowSafe } from '@/components/eppm/workflow/workflow-context'

const FAV_KEY = 'sb:nav:favorites'
const RECENT_KEY = 'sb:nav:recents'
const MAX_RECENTS = 10

interface NavContextValue {
  favorites: View[]
  recents: View[]
  isFavorite: (v: View) => boolean
  toggleFavorite: (v: View) => void
  moveFavorite: (v: View, dir: -1 | 1) => void
  pushRecent: (v: View) => void
  clearRecents: () => void
  commandOpen: boolean
  setCommandOpen: (o: boolean) => void
}

const NavContext = createContext<NavContextValue | null>(null)

function readList(key: string): View[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as View[]) : []
  } catch {
    return []
  }
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<View[]>([])
  const [recents, setRecents] = useState<View[]>([])
  const [commandOpen, setCommandOpen] = useState(false)

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    setFavorites(readList(FAV_KEY))
    setRecents(readList(RECENT_KEY))
  }, [])

  const persist = (key: string, val: View[]) => {
    try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore quota */ }
  }

  const toggleFavorite = useCallback((v: View) => {
    setFavorites((prev) => {
      const next = prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
      persist(FAV_KEY, next)
      return next
    })
  }, [])

  const moveFavorite = useCallback((v: View, dir: -1 | 1) => {
    setFavorites((prev) => {
      const i = prev.indexOf(v)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      persist(FAV_KEY, next)
      return next
    })
  }, [])

  const pushRecent = useCallback((v: View) => {
    setRecents((prev) => {
      const next = [v, ...prev.filter((x) => x !== v)].slice(0, MAX_RECENTS)
      persist(RECENT_KEY, next)
      return next
    })
  }, [])

  const clearRecents = useCallback(() => {
    setRecents([])
    persist(RECENT_KEY, [])
  }, [])

  const isFavorite = useCallback((v: View) => favorites.includes(v), [favorites])

  const value = useMemo<NavContextValue>(
    () => ({ favorites, recents, isFavorite, toggleFavorite, moveFavorite, pushRecent, clearRecents, commandOpen, setCommandOpen }),
    [favorites, recents, isFavorite, toggleFavorite, moveFavorite, pushRecent, clearRecents, commandOpen],
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavigationProvider')
  return ctx
}

/** Live notification-badge counts — dashboard KPIs + workflow engine state. */
export function useNavBadges(): Record<BadgeKey, number> {
  const data = useDashboardData()
  const wf = useWorkflowSafe()
  const k = data?.kpis
  return {
    risks: k?.openRisks ?? 0,
    changes: k?.pendingChanges ?? 0,
    delays: k?.delayedActivities ?? 0,
    workOrders: wf?.counts.fieldActive ?? 0,
    approvals: wf?.counts.pendingApprovals ?? 0,
  }
}
