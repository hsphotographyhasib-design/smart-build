'use client'

import React, { useEffect, useState } from 'react'
import { AppLogo } from './app-logo'
import { BRAND } from './brand-tokens'
import { cn } from '@/lib/utils'

export function BrandFooter({ className }: { className?: string }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString())
    t()
    const id = setInterval(t, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className={cn('mt-auto border-t bg-background/95 px-4 py-2.5 backdrop-blur', className)}>
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-1 text-[11px] text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-3">
          <AppLogo variant="app-light" size="xs" />
          <span>{BRAND.copyright}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
            All systems operational
          </span>
          <span className="hidden sm:inline">API &lt;300ms</span>
          <span className="hidden sm:inline" suppressHydrationWarning>
            Last sync {time || '—'}
          </span>
        </div>
      </div>
    </footer>
  )
}
