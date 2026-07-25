import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BrandBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'default'
}

export function BrandBadge({ variant = 'default', className, ...props }: BrandBadgeProps) {
  const styles: Record<string, string> = {
    navy: 'bg-[#0B2345] text-white hover:bg-[#0B2345]/90',
    gold: 'bg-[#F5A623] text-white hover:bg-[#F5A623]/90',
    success: 'bg-emerald-600 text-white hover:bg-emerald-600/90',
    warning: 'bg-amber-500 text-white hover:bg-amber-500/90',
    danger: 'bg-rose-600 text-white hover:bg-rose-600/90',
    default: '',
  }
  return <Badge className={cn(styles[variant], className)} {...props} />
}
