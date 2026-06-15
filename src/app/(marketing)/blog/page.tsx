'use client'

import Link from 'next/link'
import { BookOpen, Clock, User, ArrowRight, Tag, TrendingUp, DollarSign, Cpu, HardHat, Wrench, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const categories = ['All', 'Project Management', 'Finance', 'Technology', 'Industry', 'Product Updates']

const featuredPost = {
  title: 'How AI Is Transforming Construction Project Management in 2025',
  excerpt: 'Artificial intelligence is no longer a futuristic concept for the construction industry. From predictive scheduling to automated risk assessment, discover how leading contractors are leveraging AI to deliver projects faster, under budget, and with fewer safety incidents. We break down the top 5 AI applications making a real impact on job sites today.',
  category: 'Technology',
  date: 'January 12, 2025',
  author: 'Sarah Chen',
  readTime: '12 min read',
}

const blogPosts = [
  {
    title: '5 Strategies to Reduce Construction Cost Overruns by 20%',
    excerpt: 'Cost overruns remain the number one challenge for construction firms worldwide. Learn proven strategies that top-performing contractors use to keep projects on budget, from early-stage estimation to real-time cost tracking.',
    category: 'Finance',
    date: 'January 8, 2025',
    author: 'Michael Torres',
    readTime: '8 min read',
  },
  {
    title: 'The Complete Guide to Construction Project Scheduling',
    excerpt: 'Master the fundamentals of construction scheduling, from Gantt charts and critical path analysis to resource leveling and milestone tracking. Includes downloadable templates and best practices from 50+ successful projects.',
    category: 'Project Management',
    date: 'January 3, 2025',
    author: 'David Park',
    readTime: '15 min read',
  },
  {
    title: 'SmartBuild 4.2: Maintenance Management Module Now Available',
    excerpt: 'We are excited to announce the release of SmartBuild 4.2, featuring our all-new Maintenance Management module. This addition includes work order management, preventive maintenance scheduling, and technician dispatch capabilities.',
    category: 'Product Updates',
    date: 'December 28, 2024',
    author: 'SmartBuild Team',
    readTime: '5 min read',
  },
  {
    title: 'Building Information Modeling: From BIM to Digital Twins',
    excerpt: 'Explore how BIM technology has evolved from 3D modeling to full digital twins, enabling real-time collaboration between architects, engineers, and contractors throughout the entire building lifecycle.',
    category: 'Technology',
    date: 'December 20, 2024',
    author: 'Emily Rodriguez',
    readTime: '10 min read',
  },
  {
    title: 'Navigating Construction Labor Shortages: A Data-Driven Approach',
    excerpt: 'With the construction industry facing a critical labor shortage projected to reach 2.1 million unfilled positions by 2026, learn how data-driven workforce planning can help your firm attract, retain, and optimize your most valuable asset.',
    category: 'Industry',
    date: 'December 15, 2024',
    author: 'James Liu',
    readTime: '9 min read',
  },
  {
    title: 'How to Implement Earned Value Management in Your Projects',
    excerpt: 'Earned Value Management (EVM) provides a powerful framework for measuring project performance. This step-by-step guide walks you through implementing EVM in your construction projects with practical examples and KPIs.',
    category: 'Project Management',
    date: 'December 10, 2024',
    author: 'Sarah Chen',
    readTime: '11 min read',
  },
]

const categoryColors: Record<string, string> = {
  'Project Management': 'bg-emerald-50 text-emerald-700',
  Finance: 'bg-amber-50 text-amber-700',
  Technology: 'bg-violet-50 text-violet-700',
  Industry: 'bg-rose-50 text-rose-700',
  'Product Updates': 'bg-stone-100 text-stone-700',
}

const categoryIcons: Record<string, typeof TrendingUp> = {
  'Project Management': TrendingUp,
  Finance: DollarSign,
  Technology: Cpu,
  Industry: HardHat,
  'Product Updates': Package,
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((post) => post.category === activeCategory)

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">
            Insights & Updates
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
            Expert perspectives on construction management, industry trends, product updates, and best practices from the SmartBuild team and community.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 md:p-12">
          <Badge className={`${categoryColors[featuredPost.category]} mb-4`}>
            {featuredPost.category}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            {featuredPost.title}
          </h2>
          <p className="text-stone-300 text-lg mb-6 leading-relaxed">
            {featuredPost.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400 mb-6">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {featuredPost.author}
            </span>
            <span>{featuredPost.date}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {featuredPost.readTime}
            </span>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Read Full Article
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Categories + Blog Grid */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => {
            const Icon = categoryIcons[post.category] || Wrench
            return (
              <article
                key={post.title}
                className="group rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-stone-100 flex items-center justify-center relative">
                  <div className="absolute top-3 left-3">
                    <Badge className={`${categoryColors[post.category]} text-xs`}>
                      {post.category}
                    </Badge>
                  </div>
                  <Icon className="w-16 h-16 text-stone-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-stone-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No posts found in this category. Check back soon!</p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-10">
            <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
              Load More Articles
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Tag className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">Stay in the Loop</h2>
          <p className="text-stone-500 text-lg mb-8 max-w-xl mx-auto">
            Get the latest construction industry insights, product updates, and expert tips delivered to your inbox every two weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-stone-400 mt-3">No spam, unsubscribe anytime. Read our <Link href="/privacy-policy" className="underline hover:text-stone-600">Privacy Policy</Link>.</p>
        </div>
      </section>
    </div>
  )
}