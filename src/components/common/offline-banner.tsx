'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState<boolean | null>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to online/offline events; set state only in event callbacks
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    // Set initial state via the current navigator value passed through a timer
    // to avoid synchronous setState in the effect body
    const initTimer = setTimeout(() => {
      setIsOffline(!navigator.onLine)
    }, 0)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearTimeout(initTimer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current)
      }
    }
  }, [])

  // Don't render anything while initializing or when online
  if (isOffline === null || !isOffline) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] animate-slide-down"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-md">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>You are currently offline. Please check your internet connection.</span>
      </div>
    </div>
  )
}
