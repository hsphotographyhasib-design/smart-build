import type { Metadata } from 'next'
import { MarketingNavbar } from '@/components/marketing/marketing-navbar'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { MarketingProviders } from '@/components/providers/marketing-providers'

export const metadata: Metadata = {
  title: 'SMARTBUILD - Construction Management ERP',
  description: 'Enterprise construction management platform for project tracking, financial management, resource planning, and more.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MarketingProviders>
      <div className="min-h-screen flex flex-col">
        <MarketingNavbar />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </MarketingProviders>
  )
}
