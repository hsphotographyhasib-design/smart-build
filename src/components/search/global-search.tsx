'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Clock,
  Plus,
  ArrowRight,
  FolderKanban,
  AlertTriangle,
  Wrench,
  Users,
  FileText,
  Receipt,
  ShoppingCart,
  Package,
  UserCheck,
  ClipboardList,
  ShieldCheck,
  Mic,
  MicOff,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import { useGlobalSearch, SEARCH_CATEGORIES, type SearchResultItem, type SearchCategoryResults } from '@/hooks/use-global-search'
import { useVoiceSearch } from '@/hooks/use-voice-search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────────────
// Category icon map
// ─────────────────────────────────────────────────────────────────────

const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  projects: { icon: FolderKanban, bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  complaints: { icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400' },
  work_orders: { icon: Wrench, bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  customers: { icon: Users, bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400' },
  invoices: { icon: FileText, bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  payments: { icon: Receipt, bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400' },
  purchase_orders: { icon: ShoppingCart, bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400' },
  suppliers: { icon: Users, bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
  inventory: { icon: Package, bg: 'bg-stone-100 dark:bg-stone-800/40', text: 'text-stone-600 dark:text-stone-400' },
  employees: { icon: UserCheck, bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-600 dark:text-pink-400' },
  assets: { icon: Wrench, bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400' },
  tasks: { icon: ClipboardList, bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
  audit_logs: { icon: ShieldCheck, bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-600 dark:text-gray-400' },
}

// ─────────────────────────────────────────────────────────────────────
// Status badge color mapping
// ─────────────────────────────────────────────────────────────────────

function getStatusClasses(status?: string): string {
  if (!status) return ''
  const s = status.toLowerCase()
  if (['active', 'completed', 'approved', 'paid', 'resolved', 'closed'].includes(s)) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
  }
  if (['in progress', 'in_progress', 'pending review', 'processing', 'submitted'].includes(s)) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
  }
  if (['pending', 'draft', 'open', 'new', 'requested'].includes(s)) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  }
  if (['overdue', 'rejected', 'cancelled', 'failed', 'critical', 'high'].includes(s)) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
}

// ─────────────────────────────────────────────────────────────────────
// Quick actions
// ─────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Create Complaint', page: 'client-complaints' as AppPage },
  { label: 'Create Invoice', page: 'invoices' as AppPage },
  { label: 'Create Project', page: 'projects' as AppPage },
  { label: 'Create Purchase Request', page: 'purchase-requests' as AppPage },
]

// ─────────────────────────────────────────────────────────────────────
// Browse categories
// ─────────────────────────────────────────────────────────────────────

const BROWSE_CATEGORIES = [
  { label: 'Projects', category: 'projects', page: 'projects' as AppPage },
  { label: 'Complaints', category: 'complaints', page: 'client-complaints' as AppPage },
  { label: 'Work Orders', category: 'work_orders', page: 'work-orders' as AppPage },
  { label: 'Customers', category: 'customers', page: 'customers' as AppPage },
  { label: 'Invoices', category: 'invoices', page: 'invoices' as AppPage },
  { label: 'Assets', category: 'assets', page: 'assets' as AppPage },
  { label: 'Employees', category: 'employees', page: 'employees' as AppPage },
]

// ─────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.15 },
}

const slideDown = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
}

// ─────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="space-y-1 px-2 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Category icon component
// ─────────────────────────────────────────────────────────────────────

function CategoryIcon({ category, size = 'sm' }: { category: string; size?: 'sm' | 'md' }) {
  const config = CATEGORY_ICON_MAP[category]
  const IconComponent = config?.icon || Search

  const sizeClasses = size === 'sm'
    ? 'h-7 w-7 rounded-md'
    : 'h-8 w-8 rounded-lg'

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className={cn('flex items-center justify-center shrink-0', sizeClasses, config?.bg || 'bg-gray-100 dark:bg-gray-800')}>
      <IconComponent className={cn(iconSize, config?.text || 'text-gray-600')} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Search result item
// ─────────────────────────────────────────────────────────────────────

function SearchResultRow({ item, onSelect }: { item: SearchResultItem; onSelect: (item: SearchResultItem) => void }) {
  return (
    <motion.button
      key={item.id}
      onClick={() => onSelect(item)}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left',
        'hover:bg-accent/60 transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:bg-accent/60'
      )}
      {...fadeIn}
    >
      <CategoryIcon category={item.category} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
      </div>
      {item.status && (
        <Badge
          variant="secondary"
          className={cn('text-[10px] px-1.5 py-0 h-5 border-0 shrink-0', getStatusClasses(item.status))}
        >
          {item.status}
        </Badge>
      )}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Category group
// ─────────────────────────────────────────────────────────────────────

function SearchCategoryGroup({ group }: { group: SearchCategoryResults }) {
  return (
    <motion.div
      key={group.category.id}
      className="py-1"
      {...slideDown}
    >
      <div className="flex items-center gap-2 px-3 py-1.5">
        <CategoryIcon category={group.category.id} size="sm" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.category.label}
        </h3>
        <span className="text-[10px] text-muted-foreground/60">
          {group.items.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SearchResultRow key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────

export function GlobalSearchDialog() {
  const {
    isOpen,
    query,
    results,
    recentSearches,
    selectedCategory,
    isLoading,
    open,
    close,
    setQuery,
    clearQuery,
    addRecentSearch,
    clearRecentSearches,
    setSelectedCategory,
    navigateToResult,
  } = useGlobalSearch()

  const { isListening, isSupported: isVoiceSupported, startListening } = useVoiceSearch()
  const navigate = useAppStore((s) => s.navigate)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ── Keyboard shortcut ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  function toggle() {
    if (isOpen) close()
    else open()
  }

  // ── Auto-focus on open ──
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the dialog animate in
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // ── Clear query when dialog closes ──
  useEffect(() => {
    if (!isOpen) {
      // Reset category filter
      setSelectedCategory(null)
    }
  }, [isOpen, setSelectedCategory])

  // ── Voice search handler ──
  const handleVoiceSearch = useCallback(async () => {
    if (!isVoiceSupported) return
    if (isListening) return

    try {
      const transcript = await startListening()
      if (transcript) {
        setQuery(transcript)
      }
    } catch {
      // Voice search failed silently
    }
  }, [isVoiceSupported, isListening, startListening, setQuery])

  // ── Recent search click ──
  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setQuery(recentQuery)
  }, [setQuery])

  // ── Quick action click ──
  const handleQuickAction = useCallback((page: AppPage) => {
    navigate(page)
    close()
  }, [navigate, close])

  // ── Browse category click ──
  const handleBrowseCategory = useCallback((page: AppPage) => {
    navigate(page)
    close()
  }, [navigate, close])

  // ── Filtered results by category ──
  const filteredCategories = React.useMemo(() => {
    if (!results) return []
    if (!selectedCategory || selectedCategory === 'all') return results.categories
    return results.categories.filter((c) => c.category.id === selectedCategory)
  }, [results, selectedCategory])

  // ── Total filtered count ──
  const totalFiltered = React.useMemo(() => {
    return filteredCategories.reduce((sum, c) => sum + c.items.length, 0)
  }, [filteredCategories])

  // ── Category tabs to show (only categories that have results) ──
  const activeCategoryTabs = React.useMemo(() => {
    if (!results) return []
    const ids = results.categories.map((c) => c.category.id)
    return SEARCH_CATEGORIES.filter((c) => c.id === 'all' || ids.includes(c.id))
  }, [results])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close() }}>
      <DialogHeader className="sr-only">
        <DialogTitle>Global Search</DialogTitle>
        <DialogDescription>Search projects, complaints, invoices, assets and more</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'overflow-hidden p-0 gap-0 rounded-xl',
          // Full screen on mobile
          'max-w-[calc(100vw-1rem)] sm:max-w-2xl',
          'top-[5%] sm:top-[12%] translate-y-0',
          'max-h-[90vh] sm:max-h-[70vh]',
          'backdrop-blur-sm'
        )}
      >
        {/* ── Search Input ── */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, complaints, invoices, assets..."
            className="flex-1 h-8 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                close()
              }
            }}
          />

          {/* Voice search button */}
          {isVoiceSupported && (
            <button
              onClick={handleVoiceSearch}
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-md transition-colors shrink-0',
                isListening
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              )}
              aria-label={isListening ? 'Listening...' : 'Voice search'}
            >
              {isListening ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Clear button */}
          {query && (
            <button
              onClick={clearQuery}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Keyboard shortcut hint */}
          <kbd className="hidden sm:inline-flex pointer-events-none items-center gap-0.5 h-5 select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        {/* ── Content Area ── */}
        <div ref={listRef} className="overflow-hidden flex flex-col" style={{ maxHeight: 'calc(70vh - 56px)' }}>
          <ScrollArea className="flex-1 sb-custom-scrollbar" style={{ maxHeight: '50vh' }}>
            <AnimatePresence mode="wait">
              {/* ── Loading State ── */}
              {isLoading && (
                <motion.div key="loading" {...fadeIn}>
                  <SearchSkeleton />
                </motion.div>
              )}

              {/* ── Results State ── */}
              {!isLoading && query.trim() && results && (
                <motion.div key="results" {...fadeIn}>
                  {/* Category tabs */}
                  {activeCategoryTabs.length > 2 && (
                    <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto">
                      {activeCategoryTabs.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                            selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory)
                              ? 'bg-amber-600 text-white'
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results list */}
                  <div className="py-2 px-1">
                    {filteredCategories.length > 0 ? (
                      <>
                        {filteredCategories.map((group) => (
                          <SearchCategoryGroup key={group.category.id} group={group} />
                        ))}
                        <div className="px-3 py-2 text-[10px] text-muted-foreground/60 border-t mt-1">
                          {totalFiltered} result{totalFiltered !== 1 ? 's' : ''} found
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">
                          No results found for &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Try different keywords or browse by category
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Empty query / no results for search term ── */}
              {!isLoading && query.trim() && !results && (
                <motion.div key="no-results" {...fadeIn}>
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Try different keywords or browse by category
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Default State (No Query) ── */}
              {!isLoading && !query.trim() && (
                <motion.div key="default" {...fadeIn} className="py-2">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="px-2 pb-2">
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Recent
                          </span>
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Clear History
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {recentSearches.slice(0, 6).map((recent) => (
                          <button
                            key={recent}
                            onClick={() => handleRecentSearchClick(recent)}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors text-left cursor-pointer"
                          >
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-sm text-foreground truncate">{recent}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="px-2 py-2 border-t">
                    <div className="flex items-center gap-1.5 px-1 mb-1.5">
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Actions
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.page)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-amber-100 dark:bg-amber-900/40 shrink-0">
                            <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="text-sm text-foreground">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Browse Categories */}
                  <div className="px-2 py-2 border-t">
                    <div className="flex items-center gap-1.5 px-1 mb-2">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Browse Categories
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {BROWSE_CATEGORIES.map((cat) => {
                        const iconConfig = CATEGORY_ICON_MAP[cat.category]
                        const IconComponent = iconConfig?.icon || Search
                        return (
                          <button
                            key={cat.label}
                            onClick={() => handleBrowseCategory(cat.page)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                              'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                              'transition-colors cursor-pointer'
                            )}
                          >
                            <IconComponent className="h-3 w-3" />
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* ── Footer hints ── */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">esc</kbd>
                Close
              </span>
            </div>
            {isVoiceSupported && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <Mic className="h-3 w-3" />
                Voice search available
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}