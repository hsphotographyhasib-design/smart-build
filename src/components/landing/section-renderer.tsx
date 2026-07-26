'use client'
import type { LandingSection, Testimonial, Partner, Plan, Faq, BlogPost, CaseStudy, MenuItem } from './types'
import { HeaderSection } from './header-section'
import { HeroSection } from './hero-section'
import { TrustSection } from './trust-section'
import { PlatformOverviewSection } from './platform-overview-section'
import { FeaturesSection } from './features-section'
import { IndustriesSection } from './industries-section'
import { EnterpriseModulesSection } from './enterprise-modules-section'
import { WorkflowSection } from './workflow-section'
import AiFeaturesSection from './ai-features-section'
import { ScreenshotsSection } from './screenshots-section'
import { TestimonialsSection } from './testimonials-section'
import { CaseStudiesSection } from './case-studies-section'
import { StatisticsSection } from './statistics-section'
import { PricingSection } from './pricing-section'
import { FaqSection } from './faq-section'
import { NewsSection } from './news-section'
import { BlogSection } from './blog-section'
import { PartnersSection } from './partners-section'
import { CtaSection } from './cta-section'
import { FooterSection } from './footer-section'

interface ExtraData {
  testimonials: Testimonial[]; partners: Partner[]; plans: Plan[]; faqs: Faq[]
  blogPosts: BlogPost[]; caseStudies: CaseStudy[]; menu: MenuItem[]
}

export function SectionRenderer({ section, extra }: { section: LandingSection; extra: ExtraData }) {
  const c = section.config
  switch(section.type) {
    case 'header': return <HeaderSection config={c} menu={extra.menu} />
    case 'hero': return <HeroSection config={c} />
    case 'trusted-by': return <TrustSection config={c} partners={extra.partners} />
    case 'platform-overview': return <PlatformOverviewSection config={c} />
    case 'features': return <FeaturesSection config={c} />
    case 'industries': return <IndustriesSection config={c} />
    case 'enterprise-modules': return <EnterpriseModulesSection config={c} />
    case 'workflow': return <WorkflowSection config={c} />
    case 'ai-features': return <AiFeaturesSection config={c} />
    case 'screenshots': return <ScreenshotsSection config={c} />
    case 'testimonials': return <TestimonialsSection config={c} testimonials={extra.testimonials} />
    case 'case-studies': return <CaseStudiesSection config={c} caseStudies={extra.caseStudies} />
    case 'statistics': return <StatisticsSection config={c} />
    case 'pricing': return <PricingSection config={c} plans={extra.plans} />
    case 'faq': return <FaqSection config={c} faqs={extra.faqs} />
    case 'news': return <NewsSection config={c} />
    case 'blog': return <BlogSection config={c} blogPosts={extra.blogPosts} />
    case 'partners': return <PartnersSection config={c} partners={extra.partners} />
    case 'cta': return <CtaSection config={c} />
    case 'footer': return <FooterSection config={c} menu={extra.menu} />
    default: return null
  }
}
