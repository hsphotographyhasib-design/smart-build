'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavigationScroller({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const dragStartRef = useRef({ x: 0, scrollLeft: 0 })

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const overflow = el.scrollWidth > el.clientWidth
    setIsOverflowing(overflow)

    if (overflow) {
      setShowLeftBtn(el.scrollLeft > 4)
      setShowRightBtn(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    } else {
      setShowLeftBtn(false)
      setShowRightBtn(false)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollBy({
          left: e.deltaY * 1.2,
          behavior: 'auto',
        })
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    checkScroll()

    const resizeObserver = new ResizeObserver(() => {
      checkScroll()
    })
    resizeObserver.observe(el)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    el.addEventListener('scroll', checkScroll)

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', checkScroll)
      resizeObserver.disconnect()
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || !isOverflowing) return
    if (e.button !== 0) return

    setIsDragging(true)
    dragStartRef.current = {
      x: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const el = scrollRef.current
      if (!el) return

      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - dragStartRef.current.x) * 1.5
      el.scrollLeft = dragStartRef.current.scrollLeft - walk
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const scrollByAmount = (amount: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      left: amount,
      behavior: 'smooth',
    })
  }

  return (
    <div ref={containerRef} className="relative flex items-center flex-1 min-w-0 select-none group/scroller">
      {showLeftBtn && (
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-start bg-gradient-to-r from-background via-background/70 to-transparent z-10 pointer-events-none">
          <button
            onClick={() => scrollByAmount(-220)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm shadow-md hover:bg-muted text-foreground pointer-events-auto transition-all cursor-pointer mr-1 scale-90 group-hover/scroller:scale-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-3 flex-1 min-w-0 scroll-smooth active:cursor-grabbing",
          isOverflowing ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
          "snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {React.Children.map(children, (child) => {
          if (!child) return null
          return (
            <div className="shrink-0 snap-center">
              {child}
            </div>
          )
        })}
      </div>

      {showRightBtn && (
        <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end bg-gradient-to-l from-background via-background/70 to-transparent z-10 pointer-events-none">
          <button
            onClick={() => scrollByAmount(220)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm shadow-md hover:bg-muted text-foreground pointer-events-auto transition-all cursor-pointer ml-1 scale-90 group-hover/scroller:scale-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
