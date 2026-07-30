export interface LandingSection {
  id: string
  type: string
  name: string
  order: number
  visible: boolean
  config: Record<string, any>
}

export interface Testimonial {
  id: string
  name: string
  company: string
  position: string
  rating: number
  content: string
  avatarUrl: string | null
}

export interface Partner {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
}

export interface Plan {
  id: string
  name: string
  price: string
  interval: string
  features: string
  description: string
  popular: boolean
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  authorName: string
  featured: boolean
}

export interface CaseStudy {
  id: string
  title: string
  slug: string
  client: string
  industry: string
  summary: string
  results: string
  coverImage: string | null
}

export interface HeroConfig {
  badge?: string
  headline?: string
  subheadline?: string
  primaryCta?: string
  secondaryCta?: string
  stats?: { label: string; value: string }[]
}

export interface MenuItem {
  id: string
  label: string
  url: string
  children?: MenuItem[]
}

export interface LandingData {
  page: {
    id: string
    slug: string
    title: string
    sections: LandingSection[]
    seoTitle: string
    seoDescription: string
  }
  testimonials: Testimonial[]
  partners: Partner[]
  plans: Plan[]
  faqs: Faq[]
  blogPosts: BlogPost[]
  caseStudies: CaseStudy[]
  menu: MenuItem[]
}
