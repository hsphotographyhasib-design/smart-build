import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SmartBuild Resources - Guides, Documentation & More',
  description: "Access SmartBuild's library of resources including documentation, case studies, blog posts, and industry guides.",
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}