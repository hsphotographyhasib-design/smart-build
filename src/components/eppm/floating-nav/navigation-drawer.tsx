'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

interface DrawerItem {
  id: View
  label: string
  icon: any
}

interface DrawerGroup {
  title: string
  items: DrawerItem[]
}

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  groups: DrawerGroup[]
  currentView: View
  onNavigate: (v: View) => void
}

export function NavigationDrawer({
  isOpen,
  onClose,
  groups,
  currentView,
  onNavigate,
}: NavigationDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[10000] lg:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={{ left: 0.05, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -80 || info.velocity.x < -300) {
                onClose()
              }
            }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background border-r border-border p-4 shadow-2xl z-[10001] flex flex-col lg:hidden select-none touch-pan-y"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold tracking-tight">SmartBuild</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Portfolio Control</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scroll-thin pr-1 pb-6 space-y-5">
              {groups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {group.title}
                  </h3>
                  <div className="grid gap-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = currentView === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id)
                            onClose()
                          }}
                          className={cn(
                            "flex items-center gap-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "" : "text-muted-foreground")} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
