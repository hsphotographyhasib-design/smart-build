'use client'

import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count?: number
  dot?: boolean
  tone?: 'primary' | 'rose' | 'amber' | 'emerald' | 'sky'
  className?: string
}

// 700-level fills keep white 10px text at >=4.5:1 contrast (WCAG AA).
const TONES: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  rose: 'bg-rose-700 text-white',
  amber: 'bg-amber-700 text-white',
  emerald: 'bg-emerald-700 text-white',
  sky: 'bg-sky-700 text-white',
}

/** Small realtime count/dot badge — attaches to icons or menu rows. */
export function NotificationBadge({ count = 0, dot, tone = 'rose', className }: NotificationBadgeProps) {
  if (!dot && count <= 0) return null
  if (dot) {
    return <span className={cn('inline-block h-2 w-2 rounded-full ring-2 ring-background', TONES[tone].split(' ')[0], className)} />
  }
  return (
    <span
      className={cn(
        'inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-[18px] tabular-nums shadow-sm',
        TONES[tone],
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
