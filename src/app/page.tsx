import { SectionRenderer } from '@/components/landing/section-renderer'
import type { LandingData } from '@/components/landing/types'

async function getLandingData(): Promise<LandingData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/cms/landing`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return { page: { id: '', slug: 'home', title: 'SmartBuild', sections: [], seoTitle: '', seoDescription: '' }, testimonials: [], partners: [], plans: [], faqs: [], blogPosts: [], caseStudies: [], menu: [] } as LandingData
  }
}

export default async function HomePage() {
  const data = await getLandingData()
  const sections = data.page.sections?.filter((s) => s.visible).sort((a, b) => a.order - b.order) || []

  return (
    <main>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          extra={{
            testimonials: data.testimonials,
            partners: data.partners,
            plans: data.plans,
            faqs: data.faqs,
            blogPosts: data.blogPosts,
            caseStudies: data.caseStudies,
            menu: data.menu,
          }}
        />
      ))}
    </main>
  )
}

export async function generateMetadata() {
  const data = await getLandingData()
  return {
    title: data.page.seoTitle || 'SmartBuild — Enterprise Construction ERP Platform',
    description: data.page.seoDescription || 'The all-in-one enterprise construction management platform. Plan, execute, and monitor every project from a single command center.',
    openGraph: { title: data.page.seoTitle || 'SmartBuild', description: data.page.seoDescription, type: 'website' },
    twitter: { card: 'summary_large_image', title: data.page.seoTitle || 'SmartBuild' },
  }
}
