'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useAppStore } from '@/lib/store'
import { getFullRegionalConfig } from '@/lib/regional/regional-config'

export interface RegionConfig {
  country: {
    code: string
    name: string
    flagEmoji: string
    callingCode: string
    timezone: string
  } | null
  currency: {
    code: string
    name: string
    symbol: string
    symbolNative: string
    decimalDigits: number
  } | null
  language: { code: string; name: string; nativeName: string } | null
  timezone: string | null
  dateFormat: string
  taxRules: { name: string; rate: number; appliesTo: string } | null
  phonePlaceholder: string | null
  isLoaded: boolean
  updatePreference: (prefs: Record<string, string>) => Promise<void>
  changeCountry: (countryCode: string) => Promise<void>
}

const defaultConfig = getFullRegionalConfig('BN')

const defaultCtx: RegionConfig = {
  country: null,
  currency: null,
  language: null,
  timezone: null,
  dateFormat: 'DD/MM/YYYY',
  taxRules: null,
  phonePlaceholder: null,
  isLoaded: false,
  updatePreference: async () => {},
  changeCountry: async () => {},
}

const RegionalContext = createContext<RegionConfig>(defaultCtx)

export function RegionalProvider({ children }: { children: ReactNode }) {
  const setRegionConfig = useAppStore((s) => s.setRegionConfig)
  const token = useAppStore((s) => s.token)
  const regionConfig = useAppStore((s) => s.regionConfig)
  const regionLoaded = useAppStore((s) => s.regionLoaded)
  const initialized = useRef(false)

  // Fetch regional config from API
  const fetchRegion = useCallback(async (countryCode?: string) => {
    try {
      // Get browser timezone for detection
      let tz: string | null = null
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch { /* ignore */ }

      const url = countryCode
        ? `/api/regional/detect?country=${countryCode}`
        : '/api/regional/detect'

      const res = await fetch(url, {
        headers: { 'X-Timezone': tz ?? '' },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setRegionConfig(json.data)
        }
      }
    } catch (error) {
      console.error('Regional detection failed:', error)
      // Fallback: set Brunei defaults
      if (!regionLoaded) {
        setRegionConfig(defaultConfig)
      }
    }
  }, [setRegionConfig, regionLoaded])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    fetchRegion()
  }, [fetchRegion])

  // Update user preferences (for logged-in users)
  const updatePreference = useCallback(async (prefs: Record<string, string>) => {
    if (!token) return

    try {
      const res = await fetch('/api/regional/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(prefs),
      })

      if (res.ok) {
        await fetchRegion()
      }
    } catch (error) {
      console.error('Failed to update preference:', error)
    }
  }, [token, fetchRegion])

  // Change country (for non-logged-in visitors, stored in sessionStorage)
  const changeCountry = useCallback(async (countryCode: string) => {
    // Store preference in sessionStorage for visitors
    try {
      sessionStorage.setItem('sb_country', countryCode)
    } catch { /* ignore */ }

    // For logged-in users, update server preference
    if (token) {
      await updatePreference({ country: countryCode })
    } else {
      // For visitors, just update the local state
      const config = getFullRegionalConfig(countryCode)
      if (config) {
        setRegionConfig(config)
      }
    }
  }, [token, updatePreference, setRegionConfig])

  // Build context value from store
  const ctxValue: RegionConfig = useMemo(() => ({
    country: regionConfig?.country ?? null,
    currency: regionConfig?.currency ?? null,
    language: regionConfig?.language ?? null,
    timezone: regionConfig?.timezone ?? null,
    dateFormat: regionConfig?.dateFormat ?? 'DD/MM/YYYY',
    taxRules: regionConfig?.taxRules ?? null,
    phonePlaceholder: regionConfig?.phonePlaceholder ?? null,
    isLoaded: regionLoaded,
    updatePreference,
    changeCountry,
  }), [regionConfig, regionLoaded, updatePreference, changeCountry])

  return (
    <RegionalContext.Provider value={ctxValue}>
      {children}
    </RegionalContext.Provider>
  )
}

export function useRegion() {
  return useContext(RegionalContext)
}
