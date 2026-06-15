'use client'

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  /** Whether the browser currently has network connectivity */
  isOnline: boolean
  /** Whether the connection is detected as slow (effectiveType 2g, slow-2g, or save-data enabled) */
  isSlow: boolean
  /** The effective connection type (e.g. '4g', '3g', '2g', 'slow-2g'), if available */
  effectiveType?: string
}

/**
 * Extends EventTarget to include the connection API types
 * that some browsers support via navigator.connection.
 */
interface NetworkConnection extends EventTarget {
  effectiveType?: string
  saveData?: boolean
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

/**
 * Detects the browser's online/offline status and connection speed
 * using the Network Information API (where available).
 *
 * Falls back gracefully when navigator.connection is not supported.
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
 * Determines whether a connection is considered "slow".
 * Slow connections include: slow-2g, 2g, or when save-data mode is on.
 */
function isConnectionSlow(conn: NetworkConnection): boolean {
  const type = conn.effectiveType
  return type === 'slow-2g' || type === '2g' || conn.saveData === true
}
