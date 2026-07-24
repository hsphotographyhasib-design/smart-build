'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'
import type { NavCategory, NavLeaf, BadgeKey } from '@/lib/navigation'
import { useNav } from '@/components/eppm/nav/nav-context'
import { NotificationBadge } from '@/components/eppm/nav/notification-badge'

interface MegaMenuProps {
  category: NavCategory
  currentView: View
  onNavigate: (v: View) => void
  onClose: () => void
  badges: Record<BadgeKey, number>
}

function MegaItem({
  leaf, active, badgeCount, onSelect, favorite, onToggleFav,
}: {
  leaf: NavLeaf
  active: boolean
  badgeCount: number
  onSelect: () => void
  favorite: boolean
  onToggleFav: () => void
}) {
  const Icon = leaf.icon
  return (
    <div
      role="menuitem"
      tabIndex={leaf.soon ? -1 : 0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      className={cn(
        'group/item relative flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors',
        leaf.soon ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-primary/8 focus:bg-primary/10 focus:outline-none',
        active && 'bg-primary/10 ring-1 ring-primary/25',
      )}
    >
      <div className={cn(
        'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors',
        active ? 'border-primary/30 bg-primary/15 text-primary' : 'border-border bg-muted/50 text-muted-foreground group-hover/item:text-primary',
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('truncate text-xs font-semibold', active ? 'text-primary' : 'text-foreground')}>{leaf.label}</span>
          {leaf.soon && <span className="rounded-full bg-muted px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-muted-foreground">Soon</span>}
          {badgeCount > 0 && <NotificationBadge count={badgeCount} tone="rose" />}
        </div>
        {leaf.description && <div className="truncate text-[10.5px] leading-tight text-muted-foreground">{leaf.description}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-1 self-center">
        {leaf.shortcut && (
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-foreground/70 xl:inline-block">{leaf.shortcut}</kbd>
        )}
        {leaf.view && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFav() }}
            className={cn(
              'grid h-6 w-6 place-items-center rounded-md transition-all',
              favorite ? 'text-amber-500' : 'text-muted-foreground/40 opacity-0 hover:text-amber-500 group-hover/item:opacity-100',
            )}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('h-3.5 w-3.5', favorite && 'fill-current')} />
          </button>
        )}
      </div>
    </div>
  )
}

export function MegaMenu({ category, currentView, onNavigate, onClose, badges }: MegaMenuProps) {
  const { isFavorite, toggleFavorite } = useNav()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const columns = category.columns ?? []

  const select = (leaf: NavLeaf) => {
    if (leaf.soon || !leaf.view) {
      toast.message(`${leaf.label} is coming soon`, { description: 'This module is part of the roadmap.' })
      return
    }
    onNavigate(leaf.view)
    onClose()
  }

  // In-menu quick filter across all columns.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return columns
    return columns
      .map((col) => ({
        ...col,
        items: col.items.filter((it) =>
          it.label.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q) ||
          it.keywords?.some((k) => k.includes(q)),
        ),
      }))
      .filter((col) => col.items.length > 0)
  }, [columns, query])

  const colCount = Math.min(Math.max(filtered.length, 1), 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.985 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-[min(92vw,880px)] overflow-hidden rounded-3xl border border-border/70 bg-background/85 shadow-2xl backdrop-blur-2xl"
      role="menu"
      aria-label={`${category.label} menu`}
    >
      {/* Header + in-menu search */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
          <category.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold leading-tight">{category.label}</div>
          {category.description && <div className="truncate text-[11px] text-muted-foreground">{category.description}</div>}
        </div>
        <div className="relative w-44">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${category.label}…`}
            className="h-7 w-full rounded-full border border-border bg-background/70 pl-7 pr-2 text-[11px] outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Columns */}
      <div
        className={cn('grid gap-x-3 gap-y-1 p-3', {
          'grid-cols-1': colCount === 1,
          'grid-cols-2': colCount === 2,
          'grid-cols-2 lg:grid-cols-3': colCount === 3,
          'grid-cols-2 lg:grid-cols-4': colCount >= 4,
        })}
      >
        {filtered.map((col) => (
          <div key={col.id} className="min-w-0">
            <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{col.title}</div>
            <div className="space-y-0.5">
              {col.items.map((leaf) => (
                <MegaItem
                  key={leaf.id}
                  leaf={leaf}
                  active={leaf.view === currentView}
                  badgeCount={leaf.badgeKey ? badges[leaf.badgeKey] : 0}
                  favorite={leaf.view ? isFavorite(leaf.view) : false}
                  onToggleFav={() => leaf.view && toggleFavorite(leaf.view)}
                  onSelect={() => select(leaf)}
                />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-1 py-8 text-center text-muted-foreground">
            <Sparkles className="h-5 w-5 opacity-50" />
            <span className="text-xs">No items match “{query}”.</span>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-1.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Tab & arrow keys to navigate · Esc to close</span>
        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> Star to pin favorites</span>
      </div>
    </motion.div>
  )
}
