import LandingPage from '@/components/landing-v3/LandingPage'

export default function HomePage() {
  return <LandingPage />
}

export async function generateMetadata() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.hasanurjaya.com'
  return {
    title: 'SmartBuild — Enterprise Construction & Maintenance Management Platform',
    description:
      'The all-in-one enterprise platform for construction companies. Manage projects, scheduling, maintenance, finance, assets, procurement, and operations from a single command center.',
    keywords: [
      'construction management', 'enterprise project management', 'EPPM',
      'Primavera alternative', 'project portfolio management', 'construction ERP',
      'maintenance management', 'facility management', 'asset management',
      'procurement software', 'cost management', 'scheduling software',
      'HSE management', 'document control', 'AI construction', 'SmartBuild',
      'construction platform Malaysia', 'enterprise SaaS construction',
    ],
    metadataBase: new URL(BASE_URL),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: BASE_URL,
      siteName: 'SmartBuild',
      title: 'SmartBuild — Enterprise Construction & Maintenance Management Platform',
      description:
        'Manage construction projects, maintenance, teams, finances, and operations from a single enterprise platform. Used by 180+ companies across 16 countries.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SmartBuild — Enterprise Construction Platform',
      description:
        'The all-in-one enterprise construction management platform used by 180+ companies worldwide.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: BASE_URL },
  }
}
