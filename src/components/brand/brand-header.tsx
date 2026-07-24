'use client'

import { AppLogo } from './app-logo'
import { BRAND } from './brand-tokens'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BrandHeaderProps {
  className?: string
  showEnv?: boolean
  showVersion?: boolean
  compact?: boolean
  children?: React.ReactNode
}

export function BrandHeader({ className, showEnv = true, showVersion = true, compact, children }: BrandHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center gap-3 border-b bg-[#0B2345] px-4 lg:h-16 lg:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <AppLogo variant="app-dark" size={compact ? 'sm' : 'md'} themeContext="dark" />
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-bold tracking-tight text-white">{BRAND.name}</span>
          {showEnv && (
            <Badge variant="outline" className="border-white/20 bg-white/10 text-[10px] font-semibold text-white/80">
              {BRAND.envLabel}
            </Badge>
          )}
          {showVersion && <span className="text-[10px] text-white/50">{BRAND.version}</span>}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </header>
  )
}
