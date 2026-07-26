import {
  LandingHeader,
  LandingHero,
  LandingTrust,
  LandingFeatures,
  LandingIndustries,
  LandingWorkflow,
  LandingPlatform,
  LandingAI,
  LandingStatistics,
  LandingTestimonials,
  LandingCaseStudies,
  LandingFAQ,
  LandingCTA,
  LandingFooter,
} from '@/components/landing-v2'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingTrust />
        <LandingFeatures />
        <LandingIndustries />
        <LandingWorkflow />
        <LandingPlatform />
        <LandingAI />
        <LandingStatistics />
        <LandingTestimonials />
        <LandingCaseStudies />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'SmartBuild — Enterprise Construction ERP Platform',
    description:
      'The all-in-one enterprise construction management platform. Plan, execute, and monitor every project from a single command center. 17 integrated modules with AI-powered analytics.',
    keywords: [
      'construction management', 'enterprise project management', 'EPPM',
      'Primavera alternative', 'project portfolio management', 'construction ERP',
      'cost management', 'scheduling software', 'HSE management', 'document control',
      'AI construction', 'SmartBuild',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'SmartBuild EPPM',
      title: 'SmartBuild — Enterprise Construction ERP Platform',
      description:
        'The all-in-one enterprise construction management platform. 17 integrated modules with AI-powered analytics for total project control.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SmartBuild — Enterprise Construction ERP Platform',
      description:
        'The all-in-one enterprise construction management platform with AI-powered analytics.',
    },
    robots: { index: true, follow: true },
  }
}
