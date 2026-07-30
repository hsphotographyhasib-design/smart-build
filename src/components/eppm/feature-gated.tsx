'use client'

import { Lock, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FeatureGatedProps {
  feature: string
  featureLabel?: string
  children: React.ReactNode
  enabled?: boolean
  className?: string
}

export function FeatureGated({ feature, featureLabel, children, enabled, className = '' }: FeatureGatedProps) {
  // If enabled is true or undefined, show children
  if (enabled !== false) return <>{children}</>

  const label = featureLabel || feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <Card className="max-w-md w-full mx-4 text-center">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{label} is Not Available</h3>
          <p className="text-sm text-muted-foreground mb-6">
            This module is not included in your current subscription plan.
            Contact your administrator or upgrade to access this feature.
          </p>
          <Button variant="outline" className="gap-2">
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
