'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Horizontal scroller for the category strip. Supports:
 *  - mouse-wheel / trackpad vertical → horizontal scroll
 *  - drag-to-scroll (pointer)
 *  - edge scroll buttons + fade masks
 *  - touch swipe (native overflow)
 */
export function NavigationScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const onScroll = () => update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    // Convert vertical wheel to horizontal (non-passive so we can preventDefault).
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const atStart = el.scrollLeft <= 0 && e.deltaY < 0
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth && e.deltaY > 0
        if (!atStart && !atEnd) {
          el.scrollLeft += e.deltaY
          e.preventDefault()
        }
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollByDir = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })

  // Drag-to-scroll
  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }
  const endDrag = () => { drag.current.down = false }

  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      {/* Left button + fade */}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background/90 to-transparent" />
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={cn(
          'flex items-center gap-0.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Reserve room so category labels never sit under the scroll buttons.
          canLeft && 'pl-8',
          canRight && 'pr-8',
        )}
      >
        {children}
      </div>

      {/* Right button + fade */}
      {canRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background/90 to-transparent" />
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
