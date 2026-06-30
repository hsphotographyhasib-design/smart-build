'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function KpiCard({
  label, value, sub, icon: Icon, tone = 'default', trend,
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: any; tone?: 'default' | 'emerald' | 'amber' | 'rose' | 'sky'
  trend?: { value: number; up: boolean }
}) {
  const toneCls = {
    default: 'text-muted-foreground bg-muted/50',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    sky: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400',
  }[tone]
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
            {sub && <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{sub}</div>}
          </div>
          <div className={cn('grid h-9 w-9 place-items-center rounded-lg shrink-0', toneCls)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>
        {trend && (
          <div className={cn('mt-2 inline-flex items-center gap-1 text-[11px] font-medium', trend.up ? 'text-emerald-600' : 'text-rose-600')}>
            {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value).toFixed(1)}% vs last period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
