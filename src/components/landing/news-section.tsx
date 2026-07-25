'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  title: string;
  description: string;
  date: string;
  category: string;
}

const defaultNews: NewsItem[] = [
  {
    title: 'SmartBuild Raises $120M Series D to Expand Global Operations',
    description:
      'The funding round, led by Accel Partners, will fuel international expansion and the development of next-gen AI project forecasting capabilities.',
    date: 'January 15, 2025',
    category: 'Company News',
  },
  {
    title: 'New OSHA Compliance Module Launched for 2025 Regulations',
    description:
      'Stay ahead of evolving safety requirements with our updated compliance toolkit, featuring automated reporting and real-time violation tracking.',
    date: 'January 8, 2025',
    category: 'Product Updates',
  },
  {
    title: 'Construction Industry Sees 18% Productivity Boost with Digital Tools',
    description:
      'A new McKinsey report highlights how integrated platforms like SmartBuild are driving measurable efficiency gains across commercial and residential projects.',
    date: 'December 22, 2024',
    category: 'Industry Insights',
  },
];

interface NewsSectionProps {
  config: Record<string, any>;
}

export function NewsSection({ config }: NewsSectionProps) {
  const items: NewsItem[] = config?.items?.length ? config.items : defaultNews;

  const headline = config?.headline || 'Latest News & Updates';
  const subheadline =
    config?.subheadline ||
    'Stay informed with the latest developments in construction technology and SmartBuild product news.';

  const categoryColors: Record<string, string> = {
    'Company News': 'bg-[#0B2345] text-white',
    'Product Updates': 'bg-[#F5A623] text-white',
    'Industry Insights': 'bg-[#0B2345]/10 text-[#0B2345]',
  };

  return (
    <section className="section-padding bg-[#F8FAFC]">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0B2345] sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            {subheadline}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const catColor = categoryColors[item.category] || 'bg-[#0B2345]/10 text-[#0B2345]'
            return (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary" className={"text-xs font-medium " + catColor}>
                  {item.category}
                </Badge>
                <ArrowUpRight className="h-4 w-4 text-[#0B2345]/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F5A623]" />
              </div>

              <h3 className="mb-3 font-heading text-lg font-semibold leading-tight text-[#0B2345] transition-colors duration-200 group-hover:text-[#F5A623]">
                {item.title}
              </h3>

              <p className="mb-4 font-body text-sm leading-relaxed text-[#0B2345]/60">
                {item.description}
              </p>

              <div className="flex items-center gap-1.5 text-[#0B2345]/40">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-body text-xs">{item.date}</span>
              </div>
            </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  );
}
