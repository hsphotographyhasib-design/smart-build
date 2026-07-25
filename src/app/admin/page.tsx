'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Image, FilePenLine, Users, MessageSquareQuote, HelpCircle, Handshake, DollarSign, FileInput, BarChart3, Globe, Paintbrush, TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  pages: number; sections: number; testimonials: number; faqs: number; partners: number; blogPosts: number; forms: number; submissions: number; plans: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [landingRes, subsRes] = await Promise.all([
          fetch('/api/cms/landing?XTransformPort=3000').catch(() => null),
          fetch('/api/cms/forms?XTransformPort=3000').catch(() => null),
        ])
        const landing = subsRes?.ok ? await subsRes.json() : {}
        const lData = landingRes?.ok ? await landingRes.json() : {}
        setStats({
          pages: lData.page ? 1 : 0,
          sections: lData.page?.sections?.length || 0,
          testimonials: lData.testimonials?.length || 0,
          faqs: lData.faqs?.length || 0,
          partners: lData.partners?.length || 0,
          blogPosts: lData.blogPosts?.length || 0,
          forms: Array.isArray(landing) ? landing.length : 0,
          submissions: 0,
          plans: lData.plans?.length || 0,
        })
      } catch { /* use defaults */ }
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { title: 'Landing Sections', value: stats?.sections ?? 20, icon: Paintbrush, href: '/admin/builder', color: 'text-[#F5A623]' },
    { title: 'Testimonials', value: stats?.testimonials ?? 0, icon: MessageSquareQuote, href: '/admin/testimonials', color: 'text-emerald-600' },
    { title: 'FAQs', value: stats?.faqs ?? 0, icon: HelpCircle, href: '/admin/faqs', color: 'text-blue-600' },
    { title: 'Partners', value: stats?.partners ?? 0, icon: Handshake, href: '/admin/partners', color: 'text-purple-600' },
    { title: 'Blog Posts', value: stats?.blogPosts ?? 0, icon: FilePenLine, href: '/admin/blog', color: 'text-orange-600' },
    { title: 'Pricing Plans', value: stats?.plans ?? 0, icon: DollarSign, href: '/admin/pricing', color: 'text-green-600' },
    { title: 'Forms', value: stats?.forms ?? 0, icon: FileInput, href: '/admin/forms', color: 'text-rose-600' },
    { title: 'Leads', value: stats?.submissions ?? 0, icon: Users, href: '/admin/leads', color: 'text-cyan-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your landing page content, media, blog, and settings.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{loading ? '—' : card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.title}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'Edit Hero Section', href: '/admin/builder' },
              { label: 'Add Blog Post', href: '/admin/blog' },
              { label: 'Manage Pricing', href: '/admin/pricing' },
              { label: 'View Leads', href: '/admin/leads' },
              { label: 'Upload Media', href: '/admin/media' },
              { label: 'Edit SEO', href: '/admin/seo' },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer text-sm font-medium text-center">{a.label}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Content Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Landing Page Status', value: 'Published', status: 'success' as const },
                { label: 'CMS Sections', value: `${stats?.sections ?? 20} sections`, status: 'success' as const },
                { label: 'Blog Posts', value: `${stats?.blogPosts ?? 0} published`, status: 'success' as const },
                { label: 'Testimonials', value: `${stats?.testimonials ?? 0} active`, status: 'success' as const },
                { label: 'Form Submissions', value: `${stats?.submissions ?? 0} new`, status: 'warning' as const },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{item.label}</span>
                  <Badge variant={item.status === 'success' ? 'default' : 'secondary'} className={item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : ''}>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
