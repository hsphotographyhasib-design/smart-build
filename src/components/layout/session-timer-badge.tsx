'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionTimer } from '@/hooks/use-session-timer'
import { useAppStore } from '@/lib/store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ─────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-500',
    pill:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900',
    pulse: true,
  },
  idle: {
    label: 'Idle',
    dot: 'bg-amber-500',
    pill:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900',
    pulse: false,
  },
  away: {
    label: 'Away',
    dot: 'bg-orange-500',
    pill:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900',
    pulse: false,
  },
} as const

// ─────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────

export function SessionTimerBadge() {
  const {
    formattedTime,
    mobileFormattedTime,
    status,
    showWarning,
    warningCountdown,
    dismissWarning,
  } = useSessionTimer()
  const logout = useAppStore((s) => s.logout)

  const cfg = STATUS_CONFIG[status]

  return (
    <>
      {/* Desktop badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 cursor-default transition-colors select-none',
              cfg.pill,
              cfg.hover
            )}
          >
            {/* Status dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              {cfg.pulse && (
                <span
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-75',
                    cfg.dot
                  )}
                />
              )}
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  cfg.dot
                )}
              />
            </span>

            {/* Clock icon */}
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />

            {/* Label + time */}
            <span className="text-xs font-mono tracking-tight whitespace-nowrap">
              {cfg.label} {formattedTime}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>
            Session: <span className="font-mono">{formattedTime}</span>
          </p>
          <p>
            Status:{' '}
            <span className="font-medium capitalize">{cfg.label}</span>
          </p>
          {showWarning && (
            <p className="text-destructive font-medium">
              Auto-logout in {warningCountdown}s
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* Mobile compact badge — dot + time only */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'sm:hidden flex items-center gap-1 rounded-full border px-2 py-0.5 cursor-default transition-colors select-none',
              cfg.pill,
              cfg.hover
            )}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {cfg.pulse && (
                <span
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-75',
                    cfg.dot
                  )}
                />
              )}
              <span
                className={cn(
                  'relative inline-flex h-1.5 w-1.5 rounded-full',
                  cfg.dot
                )}
              />
            </span>
            <span className="text-[11px] font-mono tracking-tight whitespace-nowrap">
              {mobileFormattedTime}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>
            Session: <span className="font-mono">{formattedTime}</span>
          </p>
          <p>
            Status:{' '}
            <span className="font-medium capitalize">{cfg.label}</span>
          </p>
          {showWarning && (
            <p className="text-destructive font-medium">
              Auto-logout in {warningCountdown}s
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* ── Idle warning dialog (non-blocking overlay) ──────────── */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-orange-200 bg-white p-6 shadow-2xl dark:border-orange-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Session Expiring
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You&apos;ve been idle for a while
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Your session will automatically end due to inactivity.
            </p>
            <p className="text-2xl font-mono font-bold text-center my-3 text-orange-600 dark:text-orange-400">
              {String(Math.floor(warningCountdown / 60)).padStart(2, '0')}:
              {String(warningCountdown % 60).padStart(2, '0')}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
                onClick={dismissWarning}
              >
                Continue Session
              </button>
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}