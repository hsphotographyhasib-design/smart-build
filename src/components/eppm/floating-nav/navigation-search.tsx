'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { GlobalSearch } from '../global-search'
import type { View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

export function NavigationSearch({
  onNavigate,
  onOpenProject,
  variant = 'compact',
}: {
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  /** 'full' → large centred pill (header row); 'compact' → icon/small button. */
  variant?: 'full' | 'compact'
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        aria-label="Search"
        className={cn(
          'group flex items-center rounded-full border border-border bg-muted/50 text-muted-foreground transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40',
          variant === 'full'
            ? 'w-full gap-3 px-4 py-2.5 text-sm'
            : 'w-10 justify-center gap-2 px-2.5 py-2 sm:w-auto sm:justify-start sm:px-3.5 sm:py-2 text-xs',
        )}
      >
        <Search className={cn('shrink-0 text-muted-foreground/80', variant === 'full' ? 'h-4.5 w-4.5' : 'h-4 w-4')} />
        <span className={cn('flex-1 truncate text-left', variant === 'full' ? 'inline' : 'hidden sm:inline text-[13px]')}>
          {variant === 'full' ? 'Search equipment, customers, work orders…' : 'Search…'}
        </span>
        <kbd className={cn(
          'items-center gap-0.5 rounded-md border bg-background/70 px-1.5 font-mono text-muted-foreground/70',
          variant === 'full' ? 'hidden md:inline-flex h-5 text-[10px]' : 'hidden lg:inline-flex h-4 text-[9px]',
        )}>
          ⌘K
        </kbd>
      </button>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
      />
    </>
  )
}
