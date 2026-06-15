import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SmartBuild Pricing - Plans for Every Team Size',
  description: 'Choose the right SmartBuild plan for your construction business. Starter, Professional, Enterprise, and Custom options.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}