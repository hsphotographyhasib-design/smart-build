'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, FolderKanban, Bell, User, Plus, X, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { View } from '@/lib/eppm'
import { categoryForView, type NavCategory, type NavLeaf } from '@/lib/navigation'
import { useNav, useNavBadges } from '@/components/eppm/nav/nav-context'
import { useTenantFeatures } from '@/hooks/use-tenant-features'

type BottomNavItem = {
  id: string
  label: string
  icon: typeof Home
  view: View
  active: boolean
}

interface BottomNavProps {
  currentView: View
  onNavigate: (v: View) => void
  onOpenDrawer: () => void
}

export function BottomNav({ currentView, onNavigate, onOpenDrawer }: BottomNavProps) {
  const { filteredNav } = useNav()
  const badges = useNavBadges()
  const { isSuperAdmin, isEnabled } = useTenantFeatures()

  const unread = (badges.workOrders ?? 0) + (badges.approvals ?? 0) + (badges.risks ?? 0)
  const cat = categoryForView(currentView)

  const [hidden, setHidden] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
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

  // Determine the primary module for the center slot
  // Priority: Projects > Maintenance based on what's enabled
  const mainModule = useMemo<BottomNavItem | null>(() => {
    const projectsCat = filteredNav.find((c) => c.id === 'projects')
    if (projectsCat?.view) {
      return {
        id: 'projects',
        label: 'Projects',
        icon: FolderKanban,
        view: projectsCat.view,
        active: currentView === 'projects' || cat === 'projects',
      }
    }
    const maintCat = filteredNav.find((c) => c.id === 'maintenance')
    if (maintCat?.view) {
      return {
        id: 'maintenance',
        label: 'Maintenance',
        icon: Wrench,
        view: maintCat.view,
        active: currentView === 'maintenance' || cat === 'maintenance',
      }
    }
    return null
  }, [filteredNav, currentView, cat])

  const left: BottomNavItem[] = [
    { id: 'home', label: 'Home', icon: Home, view: 'dashboard', active: currentView === 'dashboard' },
    ...(mainModule ? [mainModule] : []),
  ]

  const right: BottomNavItem[] = [
    { id: 'alerts', label: 'Alerts', icon: Bell, view: 'notifications', active: currentView === 'notifications', badge: unread } as BottomNavItem & { badge: number },
    { id: 'profile', label: 'Profile', icon: User, view: 'admin', active: currentView === 'admin' },
  ]

  return (
    <>
      {/* ── Bottom Floating Bar ────────────────────────────────────────── */}
      <motion.div
        animate={{ y: hidden ? 120 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] select-none lg:hidden',
          'bg-white/90 border-t border-white/20 backdrop-blur-xl rounded-t-2xl',
          'dark:bg-gray-900/90 dark:border-white/10',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex h-16 max-w-[28rem] items-center justify-around px-2">
          {left.map((item) => (
            <BottomItem key={item.id} item={item} onNavigate={onNavigate} />
          ))}

          {/* Center FAB — opens quick-action sheet */}
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Quick actions"
            className="grid h-12 w-12 -translate-y-4 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-white dark:ring-gray-950 transition-transform active:scale-90 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
          </button>

          {right.map((item) => (
            <BottomItem
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              badge={'badge' in item ? (item as { badge: number }).badge : 0}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Quick Action Sheet ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSheetOpen(false)}
            />
            {/* Sheet panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              className={cn(
                'fixed inset-x-0 bottom-0 z-[var(--z-overlay)] max-h-[70dvh] rounded-t-3xl lg:hidden',
                'bg-white/90 backdrop-blur-2xl border-t border-white/20 shadow-2xl',
                'dark:bg-gray-900/90 dark:border-white/10',
              )}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <div className="text-base font-bold">Quick Access</div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Separator className="bg-white/20 dark:bg-white/10" />

              <ScrollArea className="h-[50dvh] px-3 py-3">
                <div className="grid grid-cols-3 gap-2">
                  {filteredNav.map((navCat) => {
                    if (!navCat.columns) {
                      // Direct-link category
                      const Icon = navCat.icon
                      return (
                        <button
                          key={navCat.id}
                          onClick={() => {
                            if (navCat.view) onNavigate(navCat.view)
                            setSheetOpen(false)
                          }}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-colors cursor-pointer',
                            navCat.view === currentView
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-white/40 dark:hover:bg-white/5',
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] font-semibold leading-tight text-center">{navCat.label}</span>
                        </button>
                      )
                    }

                    // Category with columns — show items as a sub-grid
                    return (
                      <div key={navCat.id} className="contents">
                        {navCat.columns.flatMap((col) =>
                          col.items.slice(0, 4).map((leaf) => {
                            const LeafIcon = leaf.icon
                            const isDisabled = !!(
                              leaf.feature && !isSuperAdmin && !isEnabled(leaf.feature)
                            )
                            return (
                              <button
                                key={leaf.id}
                                onClick={() => {
                                  if (isDisabled || leaf.soon || !leaf.view) return
                                  onNavigate(leaf.view)
                                  setSheetOpen(false)
                                }}
                                disabled={isDisabled || leaf.soon}
                                className={cn(
                                  'relative flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-colors',
                                  isDisabled || leaf.soon
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white/40 cursor-pointer dark:hover:bg-white/5',
                                  leaf.view === currentView && 'bg-primary/10 text-primary',
                                )}
                              >
                                <LeafIcon className="h-5 w-5" />
                                <span className="text-[10px] font-semibold leading-tight text-center">{leaf.label}</span>
                                {isDisabled && (
                                  <Badge
                                    variant="outline"
                                    className="absolute right-1 top-1 h-3.5 px-1 text-[7px] border-amber-300/60 text-amber-700 dark:border-amber-700/40 dark:text-amber-400"
                                  >
                                    Lock
                                  </Badge>
                                )}
                              </button>
                            )
                          }),
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function BottomItem({
  item, onNavigate, badge = 0,
}: {
  item: BottomNavItem
  onNavigate: (v: View) => void
  badge?: number
}) {
  const Icon = item.icon
  return (
    <button
      onClick={() => onNavigate(item.view)}
      className={cn(
        'relative flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 cursor-pointer',
        item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span className="relative">
        <Icon className={cn('h-5 w-5 shrink-0 transition-transform', item.active && 'scale-110')} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
    </button>
  )
}
