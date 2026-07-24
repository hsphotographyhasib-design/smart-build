'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Search, Star, Clock, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import { filterNav, flattenLeaves, type NavLeaf } from '@/lib/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { useNav } from '@/components/eppm/nav/nav-context'

interface NavigationDrawerProps {
  open: boolean
  onClose: () => void
  currentView: View
  onNavigate: (v: View) => void
}

export function NavigationDrawer({ open, onClose, currentView, onNavigate }: NavigationDrawerProps) {
  const { user } = useAuth()
  const { favorites, recents } = useNav()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const nav = useMemo(() => filterNav(user?.role), [user?.role])
  const leafByView = useMemo(() => {
    const m = new Map<View, NavLeaf & { categoryLabel: string }>()
    flattenLeaves().forEach((l) => { if (l.view) m.set(l.view, l) })
    return m
  }, [])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return flattenLeaves(user?.role).filter((l) =>
      l.label.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.keywords?.some((k) => k.includes(q)),
    ).slice(0, 30)
  }, [query, user?.role])

  const go = (leaf: { view?: View; label: string; soon?: boolean }) => {
    if (leaf.soon || !leaf.view) { toast.message(`${leaf.label} is coming soon`); return }
    onNavigate(leaf.view)
    onClose()
  }

  const favItems = favorites.map((v) => leafByView.get(v)).filter(Boolean) as (NavLeaf & { categoryLabel: string })[]
  const recentItems = recents.map((v) => leafByView.get(v)).filter(Boolean) as (NavLeaf & { categoryLabel: string })[]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-overlay)] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col border-r border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-4 w-4" /></div>
                <div className="leading-none">
                  <div className="text-sm font-extrabold">HJSB</div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Enterprise</div>
                </div>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label="Close menu"><X className="h-4.5 w-4.5" /></button>
            </div>

            {/* Search */}
            <div className="border-b px-3 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages…"
                  className="h-9 w-full rounded-xl border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scroll-thin px-2 py-2">
              {query ? (
                /* Search results */
                <div className="space-y-0.5">
                  {searchResults.length === 0 && <div className="px-3 py-6 text-center text-xs text-muted-foreground">No pages match “{query}”.</div>}
                  {searchResults.map((leaf) => {
                    const Icon = leaf.icon
                    return (
                      <button key={`${leaf.categoryLabel}-${leaf.id}`} onClick={() => go(leaf)} disabled={leaf.soon} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm', leaf.soon ? 'opacity-50' : 'hover:bg-muted')}>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{leaf.label}</span>
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
                      {favItems.map((l) => <QuickChip key={l.id} leaf={l} active={l.view === currentView} onClick={() => go(l)} />)}
                    </Section>
                  )}
                  {recentItems.length > 0 && (
                    <Section title="Recently Visited" icon={<Clock className="h-3.5 w-3.5" />}>
                      {recentItems.map((l) => <QuickChip key={l.id} leaf={l} active={l.view === currentView} onClick={() => go(l)} />)}
                    </Section>
                  )}

                  {/* Accordion */}
                  <div className="mt-1 space-y-0.5">
                    {nav.map((cat) => {
                      const Icon = cat.icon
                      const isOpen = expanded === cat.id
                      const directOnly = !cat.columns
                      const catActive = !!cat.view && cat.view === currentView
                      return (
                        <div key={cat.id}>
                          <button
                            onClick={() => directOnly ? go({ view: cat.view, label: cat.label }) : setExpanded(isOpen ? null : cat.id)}
                            className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold', catActive ? 'text-primary' : 'text-foreground hover:bg-muted')}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-left">{cat.label}</span>
                            {!directOnly && <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />}
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && !directOnly && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="ml-3 border-l pl-2 pb-1">
                                  {cat.columns!.map((col) => (
                                    <div key={col.id} className="py-1">
                                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{col.title}</div>
                                      {col.items.map((leaf) => {
                                        const LeafIcon = leaf.icon
                                        const active = leaf.view === currentView
                                        return (
                                          <button key={leaf.id} onClick={() => go(leaf)} disabled={leaf.soon} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px]', leaf.soon ? 'opacity-50' : 'hover:bg-muted', active && 'bg-primary/10 text-primary')}>
                                            <LeafIcon className="h-3.5 w-3.5" />
                                            <span className="flex-1 truncate">{leaf.label}</span>
                                            {leaf.soon && <span className="rounded-full bg-muted px-1.5 text-[8px] font-bold uppercase text-muted-foreground">Soon</span>}
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
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{icon} {title}</div>
      <div className="flex flex-wrap gap-1.5 px-2">{children}</div>
    </div>
  )
}

function QuickChip({ leaf, active, onClick }: { leaf: NavLeaf; active: boolean; onClick: () => void }) {
  const Icon = leaf.icon
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', active ? 'border-primary/40 bg-primary/10 text-primary' : 'bg-muted/40 hover:bg-muted')}>
      <Icon className="h-3 w-3" /> {leaf.label}
    </button>
  )
}
