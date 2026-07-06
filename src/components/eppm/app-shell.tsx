'use client'

import { useEffect, useState } from 'react'
import { FloatingNavbar } from '@/components/eppm/floating-nav/floating-navbar'
import { BottomNav } from '@/components/eppm/floating-nav/bottom-nav'
import { GlobalSearch } from '@/components/eppm/global-search'
import type { View } from '@/lib/eppm'

interface AppShellProps {
  view: View
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  /** Drawer state lives in the page so content (e.g. mobile home) can open it. */
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
  children: React.ReactNode
}

/**
 * Unified application shell — the single place that owns chrome layout:
 *
 *   Top Header (sticky, --header-h, z: --z-header)
 *     ↓ --nav-gap (16px)
 *   Floating Navigation (sticky below header, z: --z-nav, desktop only)
 *     ↓ --content-gap (24px)
 *   Main Content (flows below both sticky layers — no hardcoded offsets)
 *     ↓
 *   Footer
 *
 * Mobile swaps the floating nav for the hamburger drawer + bottom nav.
 * Pages must never define their own top spacing or header offsets.
 */
export function AppShell({ view, onNavigate, onOpenProject, mobileDrawerOpen, setMobileDrawerOpen, children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  // Client-only clock — avoids SSR/CSR hydration mismatch on the footer timestamp.
  const [lastSync, setLastSync] = useState('')
  useEffect(() => {
    const tick = () => setLastSync(new Date().toLocaleTimeString())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-muted/20 pb-28 lg:pb-0">
      <FloatingNavbar
        view={view}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      {/* Content offset derives from the shell flow (sticky layers stay in
          flow), so pages start below header + floating nav automatically. */}
      <main className="min-w-0 flex-1 px-4 pb-6 pt-[var(--content-gap)] lg:px-6">
        <div className="mx-auto min-w-0 max-w-[1600px]">{children}</div>
      </main>

      <footer className="mt-auto border-t bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-1 text-[11px] text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <span>© 2025 HJSB EPPM · Enterprise Project Portfolio Management v4.2.1</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Primavera P6-class engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational</span>
            <span className="hidden sm:inline">API &lt;300ms</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline" suppressHydrationWarning>Last sync {lastSync || '—'}</span>
          </div>
        </div>
      </footer>

      <BottomNav
        currentView={view}
        onNavigate={onNavigate}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />
      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
      />
    </div>
  )
}
