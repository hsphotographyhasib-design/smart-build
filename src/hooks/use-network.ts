'use client'

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  /** ব্রাউজার বর্তমানে নেটওয়ার্ক সংযোগ্যুন আছে কিনা */
  isOnline: boolean
  /** সংযোগ্যুন ধীনে ধীন সনাক্ত হলে (effectiveType 2g, slow-2g, সেভ-ডেটা সক্রিয় থাকলে) */
  isSlow: boolean
  /** কার্য়েক্ট সংযোগ্যুন (যেমন '4g', '3g', '2g', 'slow-2g'), থাকলে থাকলে */
  effectiveType?: string
}

  /**
 * navigator.connection অবজেক্ট সুবিধিতান প্রদান করা হচ্ছে,
 * ব্রাউজার-নির প্রিফিক্স বাস্তবায় বাস্তবায় ব্যবহার করার জন্য নির্ধারণ করা হচ্ছে।
 */
interface NetworkConnection extends EventTarget {
  effectiveType?: string
  saveData?: boolean
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

/**
 * Network Information API ব্যবহার করে ব্রাউজারের অনলাইন/অফলাইন অবস্থা সনাক্তকরণ করা হচ্ছে।
 *
 * navigator.connection সমর্থিত না থাকলে গ্রেসে ঝুলে সুবিধিত ফলব্যাক হবে।
 *
 * @example
 * const { isOnline, isSlow, effectiveType } = useNetworkStatus()
 *
 * if (!isOnline) return <OfflineBanner />
 * if (isSlow) return <LowBandwidthMode />
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const conn = getNavigatorConnection()

    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSlow: conn ? isConnectionSlow(conn) : false,
      effectiveType: conn?.effectiveType,
    }
  })

  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return

    const updateStatus = () => {
      const conn = getNavigatorConnection()

      setStatus({
        isOnline: navigator.onLine,
        isSlow: conn ? isConnectionSlow(conn) : false,
        effectiveType: conn?.effectiveType,
      })
    }

    // Listen for online/offline events
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    // Listen for connection changes (Network Information API)
    const conn = getNavigatorConnection()
    if (conn) {
      conn.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)

      if (conn) {
        conn.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return status
}

/**
 * Safely retrieves the navigator.connection object,
 * accounting for browser-specific prefixed implementations.
 */
function getNavigatorConnection(): NetworkConnection | null {
  if (typeof navigator === 'undefined') return null

  const nav = navigator as unknown as Record<string, unknown>

  return (
    (nav.connection as NetworkConnection) ??
    (nav.mozConnection as NetworkConnection) ??
    (nav.webkitConnection as NetworkConnection) ??
    null
  )
}

  /**
 * সংযোগ্যুন ধীন ধীনের স্লো হিস্ট কিনা তা নির্ধারণ করে কোড প্রদান করা হচ্ছে।
 * ধীন স্লো সহ ধীন ধীনের ধীন কে অপেক্ষম হলে ধীন ধীনে মধ্যম অনুযায় ধীন ধীন আছে।
 */
function isConnectionSlow(conn: NetworkConnection): boolean {
  const type = conn.effectiveType
  return type === 'slow-2g' || type === '2g' || conn.saveData === true
}
