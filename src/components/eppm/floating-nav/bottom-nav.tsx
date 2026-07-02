'use client'

import { LayoutDashboard, Briefcase, Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

interface BottomNavProps {
  currentView: View
  onNavigate: (v: View) => void
  onOpenDrawer: () => void
  onTriggerSearch: () => void
}

export function BottomNav({
  currentView,
  onNavigate,
  onOpenDrawer,
  onTriggerSearch,
}: BottomNavProps) {
  const items = [
    {
      id: 'dashboard' as View,
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'projects' as View,
      label: 'Projects',
      icon: Briefcase,
      action: () => onNavigate('projects'),
    },
    {
      id: 'search' as any,
      label: 'Search',
      icon: Search,
      action: onTriggerSearch,
    },
    {
      id: 'menu' as any,
      label: 'Menu',
      icon: Menu,
      action: onOpenDrawer,
    },
  ]

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-14 rounded-full border border-border bg-background/70 backdrop-blur-2xl shadow-2xl z-[9999] flex items-center justify-around px-4 select-none lg:hidden">
      {items.map((item) => {
        const Icon = item.icon
        const active = currentView === item.id

        return (
          <button
            key={item.label}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full transition-all duration-200 cursor-pointer",
              active
                ? "text-primary scale-115"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
