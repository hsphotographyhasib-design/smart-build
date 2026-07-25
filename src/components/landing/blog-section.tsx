'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from './types';

const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Construction Management Trends Shaping 2025',
    slug: 'construction-management-trends-2025',
    excerpt: 'From AI-powered scheduling to sustainable building practices, explore the top trends redefining how construction projects are planned and executed this year.',
    authorName: 'Sarah Mitchell',
    featured: true,
  },
  {
    id: '2',
    title: 'How to Reduce Project Overruns by 30% with Real-Time Tracking',
    slug: 'reduce-project-overruns-real-time-tracking',
    excerpt: 'Discover how real-time budget and schedule tracking can dramatically reduce cost overruns and keep your projects on the critical path.',
    authorName: 'James Rodriguez',
    featured: false,
  },
  {
    id: '3',
    title: 'The Complete Guide to Construction Safety Compliance',
    slug: 'construction-safety-compliance-guide',
    excerpt: 'Everything you need to know about OSHA requirements, site safety protocols, and how digital tools streamline compliance management.',
    authorName: 'Emily Chen',
    featured: false,
  },
];

interface BlogSectionProps {
  config: Record<string, any>;
  blogPosts?: BlogPost[];
}

export function BlogSection({ config, blogPosts }: BlogSectionProps) {
  const posts: BlogPost[] = blogPosts?.length ? blogPosts : defaultPosts;

  const headline = config?.headline || 'From Our Blog';
  const subheadline = config?.subheadline || 'Insights, best practices, and thought leadership from our team of construction technology experts.';

  return (
    <section className="section-padding bg-white">
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
          {posts.map((post, index) => (
            <motion.article
              key={post.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className={`group flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0B2345]/8 ${
                post.featured
                  ? 'border-l-4 border-l-[#F5A623] border-t-[#0B2345]/5 border-r-[#0B2345]/5 border-b-[#0B2345]/5'
                  : 'border-[#0B2345]/5'
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2345]">
                  <span className="font-heading text-sm font-semibold text-[#F5A623]">
                    {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <span className="font-body text-sm font-medium text-[#0B2345]/70">
                  {post.authorName}
                </span>
              </div>

              <h3 className="mb-3 font-heading text-lg font-semibold leading-tight text-[#0B2345] transition-colors duration-200 group-hover:text-[#F5A623]">
                {post.title}
              </h3>

              <p className="mb-6 flex-1 font-body text-sm leading-relaxed text-[#0B2345]/60">
                {post.excerpt}
              </p>

              <span className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-[#F5A623] transition-all duration-200 group-hover:gap-2.5">
                Read More
                <ArrowRight className="h-4 w-4" />
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
