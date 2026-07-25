import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface BrandCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  accent?: 'navy' | 'gold' | 'none'
  compact?: boolean
}

export function BrandCard({ accent = 'none', compact, className, children, ...props }: BrandCardProps) {
  return (
    <Card
      className={cn(
        'border-border/60 shadow-sm transition-shadow hover:shadow-md',
        accent === 'navy' && 'border-l-4 border-l-[#0B2345]',
        accent === 'gold' && 'border-l-4 border-l-[#F5A623]',
        compact && 'p-0',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

export function BrandCardHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof CardHeader>) {
  return <CardHeader className={cn(className)} {...props} />
}

export function BrandCardTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof CardTitle>) {
  return <CardTitle className={cn('text-sm font-bold tracking-tight', className)} {...props} />
}

export function BrandCardDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof CardDescription>) {
  return <CardDescription className={cn('text-xs', className)} {...props} />
}