'use client'

import { LayoutDashboard, Briefcase, Search, Menu, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { categoryForView } from '@/lib/navigation'

interface BottomNavProps {
  currentView: View
  onNavigate: (v: View) => void
  onOpenDrawer: () => void
  onTriggerSearch: () => void
}

export function BottomNav({ currentView, onNavigate, onOpenDrawer, onTriggerSearch }: BottomNavProps) {
  const cat = categoryForView(currentView)
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, active: currentView === 'dashboard', action: () => onNavigate('dashboard') },
    { id: 'projects', label: 'Projects', icon: Briefcase, active: cat === 'projects', action: () => onNavigate('projects') },
    { id: 'reports', label: 'Reports', icon: BarChart3, active: cat === 'reports', action: () => onNavigate('reports') },
    { id: 'menu', label: 'Menu', icon: Menu, active: false, action: onOpenDrawer },
  ]

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] flex h-14 w-[90%] max-w-md -translate-x-1/2 select-none items-center justify-between rounded-full border border-border bg-background/70 px-5 shadow-2xl backdrop-blur-2xl lg:hidden">
      {items.slice(0, 2).map((item) => <BottomItem key={item.id} {...item} />)}

      {/* Raised center search */}
      <button
        onClick={onTriggerSearch}
        aria-label="Search"
        className="grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
      >
        <Search className="h-5 w-5" />
      </button>

      {items.slice(2).map((item) => <BottomItem key={item.id} {...item} />)}
    </div>
  )
}

function BottomItem({ label, icon: Icon, active, action }: { label: string; icon: typeof Menu; active: boolean; action: () => void }) {
  return (
    <button
      onClick={action}
      className={cn(
        'flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-200',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform', active && 'scale-110')} />
      <span className="text-[9px] font-bold tracking-tight">{label}</span>
    </button>
  )
}
