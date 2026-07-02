'use client'

import { useState, useEffect } from 'react'
import { Search, QrCode } from 'lucide-react'
import { GlobalSearch } from '../global-search'
import type { View } from '@/lib/eppm'
import { cn } from '@/lib/utils'

export function NavigationSearch({
  onNavigate,
  onOpenProject,
}: {
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [focused, setFocused] = useState(false)

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
      <div className="relative flex items-center select-none">
        <button
          onClick={() => setSearchOpen(true)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-background/30 backdrop-blur-md px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-300 hover:bg-background/60 hover:border-foreground/20 focus:outline-none focus:ring-1 focus:ring-primary/30",
            focused ? "w-40 sm:w-48 lg:w-60 border-primary/30 shadow-inner" : "w-10 sm:w-40 lg:w-48"
          )}
          aria-label="Search portfolio"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
          <span className="hidden sm:inline text-left truncate flex-1 text-[11px] text-muted-foreground/75">
            Search...
          </span>
          <kbd className="hidden lg:inline-flex h-4 items-center gap-0.5 rounded border bg-background/60 px-1 font-mono text-[8px] text-muted-foreground/60 scale-90">
            ⌘K
          </kbd>
        </button>

        <button 
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex ml-1 h-8 w-8 items-center justify-center rounded-full border border-transparent hover:border-border hover:bg-background/40 text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Scan QR Code"
        >
          <QrCode className="h-3.5 w-3.5" />
        </button>
      </div>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
      />
    </>
  )
}
