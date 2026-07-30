'use client'

import { FloatingNavbar } from '@/components/eppm/floating-nav/floating-navbar'
import { BottomNav } from '@/components/eppm/floating-nav/bottom-nav'
import { BrandFooter } from '@/components/brand'
import type { View } from '@/lib/eppm'

interface AppShellProps {
  view: View
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
  children: React.ReactNode
}

export function AppShell({
  view, onNavigate, onOpenProject, mobileDrawerOpen, setMobileDrawerOpen, children,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-muted/20 pb-24 lg:pb-0">
      {/* Floating glassmorphism header — replaces both header + subnav */}
      <FloatingNavbar
        view={view}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      {/* Main content area — no need for --content-gap since nav is a single floating bar */}
      <main className="min-w-0 flex-1 px-4 pb-6 pt-4 lg:px-6">
        <div className="mx-auto min-w-0 max-w-[1600px]">{children}</div>
      </main>

      <BrandFooter />

      {/* Mobile bottom nav bar (hidden on lg+) */}
      <BottomNav
        currentView={view}
        onNavigate={onNavigate}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />
    </div>
  )
}
