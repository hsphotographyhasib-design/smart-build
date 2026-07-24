'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

export function KpiCard({
  label, value, sub, icon: Icon, tone = 'default', trend, animateValue,
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: any; tone?: 'default' | 'emerald' | 'amber' | 'rose' | 'sky'
  trend?: { value: number; up: boolean }
  animateValue?: number  // numeric value to count-up; when provided, `value` is used as format hint
}) {
  const toneCls = {
    default: 'text-muted-foreground bg-muted/50',
    emerald: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    sky: 'text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400',
  }[tone]
  const toneBar = {
    default: 'from-muted-foreground/40',
    emerald: 'from-emerald-500/60',
    amber: 'from-amber-500/60',
    rose: 'from-rose-500/60',
    sky: 'from-sky-500/60',
  }[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow group">
        {/* top accent bar */}
        <div className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent', toneBar)} />
        {/* subtle hover sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
              {sub && <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{sub}</div>}
            </div>
            <motion.div
              className={cn('grid h-9 w-9 place-items-center rounded-lg shrink-0', toneCls)}
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </motion.div>
          </div>
          {trend && (
            <div className={cn('mt-2 inline-flex items-center gap-1 text-[11px] font-medium', trend.up ? 'text-emerald-700' : 'text-rose-700')}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value).toFixed(1)}% vs last period
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
