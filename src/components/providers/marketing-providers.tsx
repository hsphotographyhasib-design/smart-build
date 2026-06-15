'use client'

import { RegionalProvider } from '@/components/providers/regional-provider'

export function MarketingProviders({ children }: { children: React.ReactNode }) {
  return (
    <RegionalProvider>
      {children}
    </RegionalProvider>
  )
}
