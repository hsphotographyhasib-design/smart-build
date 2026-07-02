'use client'

import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Building, Users, HardHat, Award } from 'lucide-react'
import Link from 'next/link'
import SectionHeader from '@/components/corporate/section-header'

const newsItems = [
  {
    title: 'HASANUR JAYA Completes Landmark Infrastructure Project',
    date: 'March 15, 2026',
    category: 'Project Update',
    excerpt:
      'We are proud to announce the successful completion of the new highway interchange project, delivered ahead of schedule and within budget.',
    slug: 'landmark-infrastructure-completion',
    icon: Building,
  },
  {
    title: 'Company Achieves ISO 45001 Certification',
    date: 'February 28, 2026',
    category: 'Company News',
    excerpt:
      'HASANUR JAYA SDN BHD has been awarded ISO 45001 certification, reinforcing our commitment to occupational health and safety.',
    slug: 'iso-45001-certification',
    icon: Award,
  },
  {
    title: 'Community Outreach: Building Schools for the Future',
    date: 'January 20, 2026',
    category: 'Press Release',
    excerpt:
      'Our CSR initiative this quarter focused on constructing two new primary schools in rural Brunei, supporting education infrastructure.',
    slug: 'community-school-building',
    icon: Users,
  },
  {
    title: 'New Partnership with Leading Sustainable Materials Supplier',
    date: 'December 10, 2025',
    category: 'Industry Insight',
    excerpt:
      'We have signed a strategic partnership to incorporate eco-friendly building materials across all upcoming projects.',
    slug: 'sustainable-materials-partnership',
    icon: Building,
  },
  {
    title: 'Record Safety Milestone: 1 Million Hours Without Incident',
    date: 'November 5, 2025',
    category: 'Company News',
    excerpt:
      'Our teams across all active sites have achieved an unprecedented 1 million work-hours without a single lost-time incident.',
    slug: 'safety-milestone-million-hours',
    icon: HardHat,
  },
  {
    title: 'HASANUR JAYA Wins Best Construction Firm Award 2025',
    date: 'October 12, 2025',
    category: 'Press Release',
    excerpt:
      'We are honored to receive the Best Construction Firm award at the Brunei Business Excellence Awards 2025.',
    slug: 'best-construction-firm-award',
    icon: Award,
  },
]

const categoryColors: Record<string, string> = {
  'Press Release': 'bg-blue-100 text-blue-700',
  'Project Update': 'bg-corp-green/10 text-corp-green',
  'Company News': 'bg-corp-gold/10 text-corp-gold',
  'Industry Insight': 'bg-purple-100 text-purple-700',
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function NewsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-charcoal/90 via-corp-charcoal/80 to-corp-green/30" />
        <div className="container-corp section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-corp-gold font-heading font-semibold text-sm tracking-widest uppercase mb-4">
              Media Centre
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              News &amp; Updates
            </h1>
            <p className="text-gray-300 font-body text-lg md:text-xl leading-relaxed max-w-2xl">
              Stay informed with the latest company announcements, project milestones,
              and industry insights from HASANUR JAYA SDN BHD.
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="section-padding">
        <div className="container-corp">
          <SectionHeader
            title="Latest News"
            subtitle="Catch up on what is happening across our company and projects."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {newsItems.map((item, i) => (
              <motion.article
                key={item.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-corp-charcoal to-corp-green/60 flex items-center justify-center">
                  <item.icon className="w-12 h-12 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full font-heading ${
                        categoryColors[item.category] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-body">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-corp-charcoal group-hover:text-corp-green transition-colors duration-300 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3">
                    {item.excerpt}
                  </p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-corp-green font-heading font-medium text-sm mt-4 hover:gap-2 transition-all"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
