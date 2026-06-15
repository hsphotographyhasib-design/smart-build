'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Newspaper,
  Award,
  BookOpen,
  Map,
  PlayCircle,
  Download,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/* ─────────────────────── data ─────────────────────── */

const categories = [
  {
    title: 'Blog',
    description: 'Industry insights, tips, and company news',
    icon: Newspaper,
    href: '/blog',
    count: 24,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Case Studies',
    description: 'Real customer success stories',
    icon: Award,
    href: '/resources',
    count: 12,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Documentation',
    description: 'Complete guides and API docs',
    icon: BookOpen,
    href: '/documentation',
    count: 86,
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
  },
  {
    title: 'Guides',
    description: 'Step-by-step tutorials',
    icon: Map,
    href: '/documentation',
    count: 34,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Videos',
    description: 'Webinars and demos',
    icon: PlayCircle,
    href: '#',
    count: 18,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    title: 'Downloads',
    description: 'Whitepapers, reports, and templates',
    icon: Download,
    href: '#',
    count: 15,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    title: 'Product Updates',
    description: "What's new in SmartBuild",
    icon: Sparkles,
    href: '#',
    count: 42,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    title: 'Industry News',
    description: 'Construction industry trends',
    icon: TrendingUp,
    href: '#',
    count: 30,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
]

const featuredResources = [
  {
    title: 'Complete Guide to Construction Project Management',
    type: 'Blog',
    description:
      'Master every phase of construction project management — from pre-construction planning and scheduling to closeout. This comprehensive guide covers best practices, tools, and strategies that top contractors use to deliver projects on time and within budget.',
    imageGradient: 'from-amber-400 to-orange-500',
    href: '/blog',
  },
  {
    title: 'How ABC Construction Reduced Costs by 35%',
    type: 'Case Study',
    description:
      'Learn how ABC Construction, a mid-size commercial builder, used SmartBuild to streamline procurement, automate invoicing, and gain real-time cost visibility — resulting in a 35% reduction in project overruns and 20% faster project delivery.',
    imageGradient: 'from-stone-600 to-stone-800',
    href: '/resources',
  },
  {
    title: 'SmartBuild API Documentation v3.0',
    type: 'Documentation',
    description:
      'Everything you need to integrate SmartBuild with your existing tools. Covers authentication, REST endpoints, webhooks, and SDK examples in Python, JavaScript, and cURL for all major modules.',
    imageGradient: 'from-emerald-500 to-teal-600',
    href: '/documentation',
  },
]

const latestPosts = [
  {
    title: '5 Ways Construction Tech Is Changing in 2025',
    category: 'Industry News',
    date: 'Jan 12, 2025',
    readTime: '6 min read',
    excerpt:
      'From AI-powered scheduling to drone-based site surveys, the construction industry is undergoing a major technology transformation. Here are the five trends that will define the year ahead.',
    href: '/blog',
  },
  {
    title: 'How to Reduce Material Waste on Your Job Sites',
    category: 'Guide',
    date: 'Jan 8, 2025',
    readTime: '8 min read',
    excerpt:
      'Material waste accounts for up to 30% of construction costs. Learn proven strategies for tracking, reducing, and recycling materials across your projects.',
    href: '/documentation',
  },
  {
    title: 'SmartBuild 4.2 Release: AI Cost Forecasting & More',
    category: 'Product Updates',
    date: 'Jan 3, 2025',
    readTime: '4 min read',
    excerpt:
      'The latest SmartBuild release includes AI-driven cost forecasting, improved Gantt chart views, and a redesigned mobile dashboard for faster on-site decision making.',
    href: '#',
  },
  {
    title: 'Client Communication Best Practices for Contractors',
    category: 'Blog',
    date: 'Dec 28, 2024',
    readTime: '5 min read',
    excerpt:
      'Strong client communication can make or break a project. Discover how top contractors use portals, automated updates, and transparent reporting to build lasting client relationships.',
    href: '/blog',
  },
]

const categoryColorMap: Record<string, string> = {
  'Industry News': 'bg-pink-100 text-pink-700',
  Guide: 'bg-emerald-100 text-emerald-700',
  'Product Updates': 'bg-cyan-100 text-cyan-700',
  Blog: 'bg-amber-100 text-amber-700',
}

/* ─────────────────────── main page ─────────────────────── */

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 to-white py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #d97706 1px, transparent 1px), linear-gradient(to bottom, #d97706 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Resources
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Resources Hub
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Everything you need to get the most from SmartBuild
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-8 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles, guides, case studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 rounded-xl border-gray-200 bg-white text-base shadow-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Resource Categories ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Find the resources most relevant to your needs
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, index) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={cat.href}
                    className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`inline-flex rounded-lg p-2.5 ${cat.bgColor}`}>
                        <Icon className={`h-5 w-5 ${cat.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-100">
                        {cat.count} Articles
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Resources ── */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Resources
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Hand-picked content to help you succeed
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={resource.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image placeholder with gradient */}
                  <div
                    className={`h-48 bg-gradient-to-br ${resource.imageGradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 flex items-center gap-2 text-white/90">
                      <BookOpen className="h-8 w-8" />
                      <span className="text-sm font-medium uppercase tracking-wider">
                        {resource.type}
                      </span>
                    </div>
                    {/* Decorative shapes */}
                    <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-white/5" />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <Badge variant="secondary" className="mb-3 w-fit text-xs">
                      {resource.type}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors leading-snug">
                      {resource.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-gray-500 leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-amber-600">
                      Read more
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Blog Posts ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Latest from the Blog
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                Stay up to date with the latest insights and news
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="gap-1.5">
                View all posts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {latestPosts.map((post, index) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={post.href}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-amber-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium ${categoryColorMap[post.category] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{post.date}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-gray-500 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-amber-600">
                    Read article
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="bg-gradient-to-br from-stone-800 to-stone-900 py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center rounded-full bg-amber-500/10 p-3 mb-6">
              <Mail className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Stay in the Loop
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-stone-400">
              Get the latest construction management insights, product updates, and industry tips delivered to your inbox every week. No spam, ever.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 rounded-xl"
              />
              <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold rounded-xl h-12 px-6">
                Subscribe
              </Button>
            </div>
            <p className="mt-3 text-xs text-stone-500">
              Join 12,000+ construction professionals. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}