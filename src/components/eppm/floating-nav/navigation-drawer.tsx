'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Search, Star, Clock, Lock, Crown } from 'lucide-react'
import { BrandAvatar } from '@/components/brand'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { flattenLeaves, type NavLeaf } from '@/lib/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { useNav } from '@/components/eppm/nav/nav-context'
import { useTenantFeatures } from '@/hooks/use-tenant-features'

interface NavigationDrawerProps {
  open: boolean
  onClose: () => void
  currentView: View
  onNavigate: (v: View) => void
}

export function NavigationDrawer({ open, onClose, currentView, onNavigate }: NavigationDrawerProps) {
  const { user } = useAuth()
  const { favorites, recents, filteredNav: nav } = useNav()
  const { isSuperAdmin, isEnabled } = useTenantFeatures()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const leafByView = useMemo(() => {
    const m = new Map<View, NavLeaf & { categoryLabel: string }>()
    flattenLeaves(user?.role).forEach((l) => { if (l.view) m.set(l.view, l) })
    return m
  }, [user?.role])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return flattenLeaves(user?.role).filter((l) =>
      l.label.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.keywords?.some((k) => k.includes(q)),
    ).slice(0, 30)
  }, [query, user?.role])

  const isFeatureDisabled = (feature?: string): boolean => {
    if (!feature) return false
    if (isSuperAdmin) return false
    return !isEnabled(feature)
  }

  const go = (leaf: { view?: View; label: string; soon?: boolean; feature?: string }) => {
    if (leaf.soon || !leaf.view) { toast.message(`${leaf.label} is coming soon`); return }
    if (isFeatureDisabled(leaf.feature)) {
      toast.error(`${leaf.label} requires a higher plan`, { description: 'Upgrade your subscription to access this module.' })
      return
    }
    onNavigate(leaf.view)
    onClose()
  }

  const favItems = favorites.map((v) => leafByView.get(v)).filter(Boolean) as (NavLeaf & { categoryLabel: string })[]
  const recentItems = recents.map((v) => leafByView.get(v)).filter(Boolean) as (NavLeaf & { categoryLabel: string })[]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
          {/* Glassmorphism overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className={cn(
              'absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col shadow-2xl',
              'bg-white/90 backdrop-blur-2xl border-r border-white/20',
              'dark:bg-gray-900/90 dark:border-white/10',
            )}
          >
            {/* Header with brand + tenant */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <BrandAvatar size="sm" />
                <div className="leading-none">
                  <div className="text-sm font-extrabold">{user?.tenant?.name ?? 'SmartBuild'}</div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">EPPM Platform</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages…"
                  className="h-9 w-full rounded-xl border-white/20 bg-white/40 pl-9 pr-3 text-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                />
              </div>
            </div>

            <Separator className="bg-white/20 dark:bg-white/10" />

            <ScrollArea className="flex-1 px-2 py-2">
              {query ? (
                /* Search results */
                <div className="space-y-0.5">
                  {searchResults.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No pages match &ldquo;{query}&rdquo;.
                    </div>
                  )}
                  {searchResults.map((leaf) => {
                    const Icon = leaf.icon
                    const disabled = isFeatureDisabled(leaf.feature)
                    return (
                      <button
                        key={`${leaf.categoryLabel}-${leaf.id}`}
                        onClick={() => go(leaf)}
                        disabled={leaf.soon || disabled}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          (leaf.soon || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer',
                          leaf.view === currentView && 'bg-primary/10 text-primary',
                        )}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{leaf.label}</span>
                        {disabled && (
                          <Badge variant="outline" className="gap-0.5 h-4 px-1 text-[8px] border-amber-300/60 text-amber-700 dark:border-amber-700/40 dark:text-amber-400">
                            <Lock className="h-2.5 w-2.5" />
                          </Badge>
                        )}
                        <span className="text-[9px] text-muted-foreground/70">{leaf.categoryLabel}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <>
                  {/* Favorites & Recents */}
                  {favItems.length > 0 && (
                    <Section title="Favorites" icon={<Star className="h-3.5 w-3.5 text-amber-500" />}>
                      {favItems.map((l) => (
                        <QuickChip key={l.id} leaf={l} active={l.view === currentView} onClick={() => go(l)} />
                      ))}
                    </Section>
                  )}
                  {recentItems.length > 0 && (
                    <Section title="Recently Visited" icon={<Clock className="h-3.5 w-3.5" />}>
                      {recentItems.map((l) => (
                        <QuickChip key={l.id} leaf={l} active={l.view === currentView} onClick={() => go(l)} />
                      ))}
                    </Section>
                  )}

                  {/* Accordion tree */}
                  <div className="mt-1 space-y-0.5">
                    {nav.map((cat) => {
                      const Icon = cat.icon
                      const isOpen = expanded === cat.id
                      const directOnly = !cat.columns
                      const catActive = !!cat.view && cat.view === currentView
                      return (
                        <div key={cat.id}>
                          <button
                            onClick={() =>
                              directOnly
                                ? go({ view: cat.view, label: cat.label, feature: cat.feature })
                                : setExpanded(isOpen ? null : cat.id)
                            }
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                              catActive
                                ? 'text-primary bg-primary/5'
                                : 'text-foreground hover:bg-white/40 dark:hover:bg-white/5',
                            )}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-left">{cat.label}</span>
                            {!directOnly && (
                              <ChevronDown className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                isOpen && 'rotate-180',
                              )} />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && !directOnly && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-3 border-l border-white/20 pl-2 pb-1 dark:border-white/10">
                                  {cat.columns!.map((col) => (
                                    <div key={col.id} className="py-1">
                                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                        {col.title}
                                      </div>
                                      {col.items.map((leaf) => {
                                        const LeafIcon = leaf.icon
                                        const active = leaf.view === currentView
                                        const disabled = isFeatureDisabled(leaf.feature)
                                        return (
                                          <button
                                            key={leaf.id}
                                            onClick={() => go(leaf)}
                                            disabled={leaf.soon || disabled}
                                            className={cn(
                                              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors',
                                              (leaf.soon || disabled)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-white/40 cursor-pointer dark:hover:bg-white/5',
                                              active && 'bg-primary/10 text-primary',
                                            )}
                                          >
                                            <LeafIcon className="h-3.5 w-3.5" />
                                            <span className="flex-1 truncate">{leaf.label}</span>
                                            {leaf.soon && (
                                              <span className="rounded-full bg-muted px-1.5 text-[8px] font-bold uppercase text-muted-foreground">
                                                Soon
                                              </span>
                                            )}
                                            {disabled && !leaf.soon && (
                                              <Badge
                                                variant="outline"
                                                className="gap-0.5 h-4 px-1 text-[8px] border-amber-300/60 text-amber-700 dark:border-amber-700/40 dark:text-amber-400"
                                              >
                                                <Lock className="h-2.5 w-2.5" />
                                              </Badge>
                                            )}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </ScrollArea>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      <div className="flex flex-wrap gap-1.5 px-2">{children}</div>
    </div>
  )
}

function QuickChip({ leaf, active, onClick }: { leaf: NavLeaf; active: boolean; onClick: () => void }) {
  const Icon = leaf.icon
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'bg-white/40 border-white/20 hover:bg-white/60 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10',
      )}
    >
      <Icon className="h-3 w-3" /> {leaf.label}
    </button>
  )
}
