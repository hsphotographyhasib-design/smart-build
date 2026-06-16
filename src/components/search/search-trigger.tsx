'use client'

import { Search } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGlobalSearchStore } from '@/hooks/use-global-search'

/**
 * Compact search trigger button for the app header.
 * Desktop: Shows a search bar with placeholder text and ⌘K shortcut hint.
 * Mobile: Shows just a search icon button.
 */
export function SearchTrigger() {
  const isMobile = useIsMobile()
  const open = useGlobalSearchStore((s) => s.open)

  if (isMobile) {
    return (
      <button
        onClick={open}
        className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 h-9 px-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground min-w-0 sm:min-w-[200px] cursor-pointer"
      aria-label="Open search (⌘K)"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}