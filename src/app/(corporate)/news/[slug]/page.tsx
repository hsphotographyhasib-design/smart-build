'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Building, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import SectionHeader from '@/components/corporate/section-header'

const articlesMeta: Record<string, { title: string; date: string; category: string }> = {
  'landmark-infrastructure-completion': {
    title: 'HASANUR JAYA Completes Landmark Infrastructure Project',
    date: 'March 15, 2026',
    category: 'Project Update',
  },
  'iso-45001-certification': {
    title: 'Company Achieves ISO 45001 Certification',
    date: 'February 28, 2026',
    category: 'Company News',
  },
  'community-school-building': {
    title: 'Community Outreach: Building Schools for the Future',
    date: 'January 20, 2026',
    category: 'Press Release',
  },
  'sustainable-materials-partnership': {
    title: 'New Partnership with Leading Sustainable Materials Supplier',
    date: 'December 10, 2025',
    category: 'Industry Insight',
  },
  'safety-milestone-million-hours': {
    title: 'Record Safety Milestone: 1 Million Hours Without Incident',
    date: 'November 5, 2025',
    category: 'Company News',
  },
  'best-construction-firm-award': {
    title: 'HASANUR JAYA Wins Best Construction Firm Award 2025',
    date: 'October 12, 2025',
    category: 'Press Release',
  },
}

const relatedArticles = [
  {
    title: 'Record Safety Milestone: 1 Million Hours Without Incident',
    slug: 'safety-milestone-million-hours',
    date: 'November 5, 2025',
  },
  {
    title: 'New Partnership with Leading Sustainable Materials Supplier',
    slug: 'sustainable-materials-partnership',
    date: 'December 10, 2025',
  },
  {
    title: 'Community Outreach: Building Schools for the Future',
    slug: 'community-school-building',
    date: 'January 20, 2026',
  },
]

export default function NewsArticlePage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const meta = articlesMeta[slug]

  if (!meta) {
    notFound()
  }

  return (
    <main>
      {/* Hero Banner */}
      <section className="relative bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-charcoal/90 via-corp-charcoal/80 to-corp-green/30" />
        <div className="container-corp section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-corp-gold font-heading font-medium text-sm hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {meta.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-body">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {meta.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                {meta.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4" />
                HASANUR JAYA Communications
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section-padding">
        <div className="container-corp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              {/* Featured image placeholder */}
              <div className="w-full h-64 md:h-80 rounded-2xl bg-gradient-to-br from-corp-charcoal to-corp-green/40 flex items-center justify-center mb-8">
                <Building className="w-16 h-16 text-white/30" />
              </div>

              <div className="font-body text-gray-700 leading-relaxed space-y-5">
                <p className="text-lg font-heading font-semibold text-corp-charcoal">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                  ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id est
                  laborum. Sed ut perspiciatis unde omnis iste natus error sit
                  voluptatem accusantium doloremque laudantium.
                </p>
                <p>
                  Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
                  quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
                  voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                </p>
                <p>
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui
                  blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
                  et quas molestias excepturi sint occaecati cupiditate non provident.
                </p>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-8">
                {/* Category */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <h3 className="font-heading text-sm font-semibold text-corp-charcoal uppercase tracking-wider mb-4">
                    Category
                  </h3>
                  <span className="inline-block text-sm font-heading font-semibold px-3 py-1.5 rounded-full bg-corp-green/10 text-corp-green">
                    {meta.category}
                  </span>
                </div>

                {/* Related Articles */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <h3 className="font-heading text-sm font-semibold text-corp-charcoal uppercase tracking-wider mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles
                      .filter((a) => a.slug !== slug)
                      .slice(0, 3)
                      .map((article) => (
                        <Link
                          key={article.slug}
                          href={`/news/${article.slug}`}
                          className="block group"
                        >
                          <p className="font-body text-sm text-gray-700 group-hover:text-corp-green transition-colors leading-snug">
                            {article.title}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block font-body">
                            {article.date}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Share */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <h3 className="font-heading text-sm font-semibold text-corp-charcoal uppercase tracking-wider mb-4">
                    Share
                  </h3>
                  <p className="font-body text-sm text-gray-500">
                    Share this article with your network.
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </main>
  )
}
