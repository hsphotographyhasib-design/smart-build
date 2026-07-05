'use client'

import { useEffect, useRef, useState } from 'react'
import { Home, ClipboardList, Bell, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { categoryForView } from '@/lib/navigation'
import { useNavBadges } from '@/components/eppm/nav/nav-context'

interface BottomNavProps {
  currentView: View
  onNavigate: (v: View) => void
  onOpenDrawer: () => void
}

// Floating pill bottom navigation (mobile) — matches the HJSB mobile reference:
// Home · Work · [+ Complaint] · Notifications · Profile. Auto-hides on scroll
// down and reappears on scroll up.
export function BottomNav({ currentView, onNavigate, onOpenDrawer }: BottomNavProps) {
  const cat = categoryForView(currentView)
  const badges = useNavBadges()
  const unread = (badges.workOrders ?? 0) + (badges.approvals ?? 0)

  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastY.current && y > 80) setHidden(true)
      else setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const left = [
    { id: 'home', label: 'Home', icon: Home, active: currentView === 'dashboard', action: () => onNavigate('dashboard') },
    { id: 'work', label: 'Work', icon: ClipboardList, active: currentView === 'work-orders' || cat === 'maintenance', action: () => onNavigate('work-orders') },
  ]
  const right = [
    { id: 'alerts', label: 'Notifications', icon: Bell, active: currentView === 'workflow-engine', action: () => onNavigate('workflow-engine'), badge: unread },
    { id: 'profile', label: 'Profile', icon: User, active: currentView === 'admin', action: () => onNavigate('admin') },
  ]

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-[9999] flex h-16 w-[92%] max-w-md -translate-x-1/2 select-none items-center justify-between rounded-[26px] border border-border bg-background/80 px-3 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:hidden',
        hidden ? 'translate-y-24' : 'translate-y-0',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {left.map((i) => <BottomItem key={i.id} {...i} />)}

      {/* Center action — create complaint */}
      <button
        onClick={() => onNavigate('complaints')}
        aria-label="Create complaint"
        className="grid h-14 w-14 -translate-y-4 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-90"
      >
        <Plus className="h-6 w-6" />
      </button>

      {right.map((i) => <BottomItem key={i.id} {...i} />)}
    </div>
  )
}

function BottomItem({
  label, icon: Icon, active, action, badge = 0,
}: { label: string; icon: typeof Home; active: boolean; action: () => void; badge?: number }) {
  return (
    <button
      onClick={action}
      className={cn(
        'relative flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span className="relative">
        <Icon className={cn('h-5 w-5 shrink-0 transition-transform', active && 'scale-110')} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className="text-[9px] font-bold tracking-tight">{label}</span>
    </button>
  )
}
