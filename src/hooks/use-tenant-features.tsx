'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureLimits {
  maxUsers: number
  maxProjects: number
  currentUsers: number
  currentProjects: number
  plan: string[]
}

interface FeatureContextValue {
  features: Record<string, boolean>
  enabledSet: Set<string>
  isEnabled: (module: string) => boolean
  limits: FeatureLimits | null
  loading: boolean
  isSuperAdmin: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const FeatureContext = createContext<FeatureContextValue>({
  features: {},
  enabledSet: new Set(),
  isEnabled: () => false,
  limits: null,
  loading: true,
  isSuperAdmin: false,
})

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [limits, setLimits] = useState<FeatureLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (fetched) return
    setFetched(true)

    fetch('/api/features')
      .then((res) => res.json())
      .then((data) => {
        setFeatures(data.features ?? {})
        setLimits(data.limits ?? null)
        setIsSuperAdmin(data.isSuperAdmin ?? false)
      })
      .catch((err) => {
        console.error('[FeatureProvider] Failed to fetch features:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [fetched])

  const enabledSet = useMemo(() => {
    const set = new Set<string>()
    for (const [key, value] of Object.entries(features)) {
      if (value) set.add(key)
    }
    return set
  }, [features])

  const isEnabled = useCallback(
    (module: string): boolean => {
      // Super Admin has access to everything
      if (isSuperAdmin) return true
      return features[module] ?? false
    },
    [features, isSuperAdmin]
  )

  const value = useMemo<FeatureContextValue>(
    () => ({ features, enabledSet, isEnabled, limits, loading, isSuperAdmin }),
    [features, enabledSet, isEnabled, limits, loading, isSuperAdmin]
  )

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTenantFeatures(): FeatureContextValue {
  return useContext(FeatureContext)
}
