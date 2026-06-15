'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface ScrollableCardProps {
  title?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
  maxHeight?: string  // e.g. "max-h-96", "max-h-[400px]"
  children: React.ReactNode
  headerClassName?: string
}

export function ScrollableCard({
  title,
  icon: Icon,
  action,
  className,
  maxHeight = 'max-h-96',
  children,
  headerClassName
}: ScrollableCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      {(title || action) && (
        <CardHeader className={cn('pb-0', headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('flex-1 min-h-0', maxHeight, 'overflow-y-auto')}>
        {children}
      </CardContent>
    </Card>
  )
}

// WidgetCard - ড্যাশবোর্ড KPI উইজেটের জন্য
interface WidgetCardProps {
  title?: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: string; positive: boolean }
  className?: string
}

export function WidgetCard({ title, value, description, icon: Icon, trend, className }: WidgetCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        </div>
      )}
    </Card>
  )
}

// ResponsiveGrid - প্রমিত গ্রিড লেআউট
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: string
  className?: string
}

export function ResponsiveGrid({ children, cols = 4, gap = 'gap-4', className }: ResponsiveGridProps) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid', colsMap[cols], gap, className)}>
      {children}
    </div>
  )
}

// ContentPanel - পূর্ণ পৃষ্ঠা বিষয়বস্তু র‍্যাপার
interface ContentPanelProps {
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}

export function ContentPanel({ children, className, scrollable = true }: ContentPanelProps) {
  return (
    <div className={cn(
      'flex-1 min-h-0',
      scrollable && 'overflow-y-auto',
      className
    )}>
      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}