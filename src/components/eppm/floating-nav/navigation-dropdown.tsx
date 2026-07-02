'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

export interface DropdownItem {
  id: View
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

interface NavigationDropdownProps {
  label: string
  active: boolean
  items: DropdownItem[]
  onNavigate: (v: View) => void
}

export function NavigationDropdown({
  label,
  active,
  items,
  onNavigate,
}: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 150)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 1024) {
      setIsOpen(!isOpen)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className="relative"
    >
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-200 focus:outline-none hover:scale-103 cursor-pointer",
          active
            ? "text-primary bg-primary/10"
            : "text-foreground/80 hover:bg-background/45 hover:text-foreground"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 opacity-60 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 mt-2.5 w-64 rounded-2xl border border-border bg-background/80 backdrop-blur-2xl p-2.5 shadow-2xl z-50 origin-top"
          >
            <div className="grid gap-0.5">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setIsOpen(false)
                    }}
                    className="flex items-start gap-3 w-full text-left rounded-xl p-2 hover:bg-foreground/5 transition-colors duration-150 group cursor-pointer"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="text-xs font-semibold text-foreground/90 group-hover:text-foreground truncate transition-colors">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-[10px] text-muted-foreground group-hover:text-muted-foreground/90 truncate mt-0.5 leading-normal">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
