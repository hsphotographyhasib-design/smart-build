'use client'

import { useEffect, useState } from 'react'
import { FloatingNavbar } from '@/components/eppm/floating-nav/floating-navbar'
import { BottomNav } from '@/components/eppm/floating-nav/bottom-nav'
import { GlobalSearch } from '@/components/eppm/global-search'
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

export function AppShell({ view, onNavigate, onOpenProject, mobileDrawerOpen, setMobileDrawerOpen, children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-muted/20 pb-28 lg:pb-0">
      <FloatingNavbar
        view={view}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      <main className="min-w-0 flex-1 px-4 pb-6 pt-[var(--content-gap)] lg:px-6">
        <div className="mx-auto min-w-0 max-w-[1600px]">{children}</div>
      </main>

      <BrandFooter />

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
