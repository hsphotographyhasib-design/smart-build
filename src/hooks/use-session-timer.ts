'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────

const IDLE_THRESHOLD = 5 * 60 * 1000        // 5 minutes
const AWAY_THRESHOLD = 15 * 60 * 1000       // 15 minutes
const WARNING_THRESHOLD = 25 * 60 * 1000    // 25 minutes – show warning
const AUTO_LOGOUT_THRESHOLD = 30 * 60 * 1000 // 30 minutes – logout
const HEARTBEAT_INTERVAL = 30 * 1000         // 30 seconds
const IDLE_CHECK_INTERVAL = 10 * 1000        // 10 seconds
const SESSION_KEY = 'sb_session_start'

// ─────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────

type SessionStatus = 'active' | 'idle' | 'away'

export interface SessionTimerState {
  formattedTime: string
  mobileFormattedTime: string
  status: SessionStatus
  elapsedSeconds: number
  showWarning: boolean
  warningCountdown: number
  dismissWarning: () => void
  resetIdle: () => void
}

// ─────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────

function formatHHMMSS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return [m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// ─────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────

export function useSessionTimer(): SessionTimerState {
  const { isAuthenticated, logout } = useAppStore()

  // Refs — avoid re-binding on every render
  const loginTimeRef = useRef<number>(0)
  const lastActivityRef = useRef<number>(Date.now())
  const statusRef = useRef<SessionStatus>('active')
  const showWarningRef = useRef(false)
  const loggedOutRef = useRef(false)

  // State — triggers re-renders
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [status, setStatus] = useState<SessionStatus>('active')
  const [showWarning, setShowWarning] = useState(false)
  const [warningCountdown, setWarningCountdown] = useState(0)

  // ── Initialise / restore login time ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(SESSION_KEY)
      loggedOutRef.current = false
      return
    }

    // Restore or create login time
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      loginTimeRef.current = Number(stored)
    } else {
      loginTimeRef.current = Date.now()
      localStorage.setItem(SESSION_KEY, String(loginTimeRef.current))
    }
    lastActivityRef.current = Date.now()
    statusRef.current = 'active'
    showWarningRef.current = false
    loggedOutRef.current = false
  }, [isAuthenticated])

  // ── Activity handler (debounced via ref) ─────────────────────────
  const handleActivity = useCallback(() => {
    const now = Date.now()
    // Throttle: only update at most once per second
    if (now - lastActivityRef.current < 1000) return
    lastActivityRef.current = now
  }, [])

  // Stable ref for the activity handler so event listeners never need re-binding
  const handleActivityRef = useRef(handleActivity)
  handleActivityRef.current = handleActivity

  // ── Attach / detach event listeners ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'] as const
    const opts: AddEventListenerOptions = { passive: true, capture: true }

    const handler = () => handleActivityRef.current()
    events.forEach((e) => window.addEventListener(e, handler, opts))

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler, opts))
    }
  }, [isAuthenticated])

  // ── Dismiss warning — extend session by resetting idle ───────────
  const dismissWarning = useCallback(() => {
    lastActivityRef.current = Date.now()
    showWarningRef.current = false
    setShowWarning(false)
    setWarningCountdown(0)
    statusRef.current = 'active'
    setStatus('active')
  }, [])

  // ── Manual idle reset ────────────────────────────────────────────
  const resetIdle = useCallback(() => {
    lastActivityRef.current = Date.now()
    showWarningRef.current = false
    setShowWarning(false)
    setWarningCountdown(0)
    statusRef.current = 'active'
    setStatus('active')
  }, [])

  // ── 1-second tick: update elapsed time ───────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setElapsedSeconds(0)
      return
    }

    const tick = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - loginTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)
    }

    tick() // immediate
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isAuthenticated])

  // ── 10-second idle status check ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const check = () => {
      const now = Date.now()
      const idleTime = now - lastActivityRef.current

      if (loggedOutRef.current) return

      // Warning at 25 min idle
      if (idleTime >= WARNING_THRESHOLD && !showWarningRef.current) {
        showWarningRef.current = true
        setShowWarning(true)
      }

      // Dismiss warning if user became active again
      if (showWarningRef.current && idleTime < WARNING_THRESHOLD) {
        showWarningRef.current = false
        setShowWarning(false)
        setWarningCountdown(0)
      }

      // Update countdown while warning is showing
      if (showWarningRef.current) {
        const remaining = Math.ceil((AUTO_LOGOUT_THRESHOLD - idleTime) / 1000)
        setWarningCountdown(Math.max(0, remaining))
      }

      // Status determination
      let newStatus: SessionStatus = 'active'
      if (idleTime >= AWAY_THRESHOLD) {
        newStatus = 'away'
      } else if (idleTime >= IDLE_THRESHOLD) {
        newStatus = 'idle'
      }

      if (newStatus !== statusRef.current) {
        statusRef.current = newStatus
        setStatus(newStatus)
      }

      // Auto-logout at 30 min idle
      if (idleTime >= AUTO_LOGOUT_THRESHOLD && !loggedOutRef.current) {
        loggedOutRef.current = true
        // Fire-and-forget heartbeat update before logout
        try {
          fetch('/api/sessions/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'auto-logout' }),
          }).catch(() => {})
        } catch { /* ignore */ }
        try {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {})
        } catch { /* ignore */ }
        localStorage.removeItem(SESSION_KEY)
        logout()
      }
    }

    const id = setInterval(check, IDLE_CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [isAuthenticated, logout])

  // ── 30-second heartbeat ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const sendHeartbeat = async () => {
      if (loggedOutRef.current) return
      try {
        const idleTime = Date.now() - lastActivityRef.current
        let sessionStatus: string = 'active'
        if (idleTime >= AWAY_THRESHOLD) sessionStatus = 'away'
        else if (idleTime >= IDLE_THRESHOLD) sessionStatus = 'idle'

        await fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: sessionStatus }),
        })
      } catch {
        // Silently fail — heartbeat is non-critical
      }
    }

    sendHeartbeat() // immediate on mount
    const id = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
    return () => clearInterval(id)
  }, [isAuthenticated])

  return {
    formattedTime: formatHHMMSS(elapsedSeconds),
    mobileFormattedTime: formatMMSS(elapsedSeconds),
    status,
    elapsedSeconds,
    showWarning,
    warningCountdown,
    dismissWarning,
    resetIdle,
  }
}