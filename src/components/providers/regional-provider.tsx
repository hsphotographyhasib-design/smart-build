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

  // API থেকে আঞ্চলিক কনফিগ আনা হচ্ছে
  const fetchRegion = useCallback(async (countryCode?: string) => {
    try {
      // সনাক্তকরণের জন্য ব্রাউজার টাইমজোন প্রাপ্ত হচ্ছে
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
      // ফলব্যাক: ব্রুনাই ডিফল্ট সেট করা হচ্ছে
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

  // ব্যবহারকারীর পছন্দ হালনাগাদ করা হচ্ছে (লগইন ব্যবহারকারীদের জন্য)
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

  // দেশ পরিবর্তন (লগইন না করা দর্শকদের জন্য, sessionStorage-এ সংরক্ষিত)
  const changeCountry = useCallback(async (countryCode: string) => {
    // দর্শকদের জন্য sessionStorage-এ পছন্দ সংরক্ষণ করা হচ্ছে
    try {
      sessionStorage.setItem('sb_country', countryCode)
    } catch { /* ignore */ }

    // লগইন ব্যবহারকারীদের জন্য, সার্ভার পছন্দ হালনাগাদ করুন
    if (token) {
      await updatePreference({ country: countryCode })
    } else {
      // দর্শকদের জন্য, শুধুমাত্র স্থানীয় অবস্থা হালনাগাদ করুন
      const config = getFullRegionalConfig(countryCode)
      if (config) {
        setRegionConfig(config)
      }
    }
  }, [token, updatePreference, setRegionConfig])

  // স্টোর থেকে কনটেক্সট মান তৈরি করা হচ্ছে
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
