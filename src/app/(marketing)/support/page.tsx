'use client'

import Link from 'next/link'
import { useFormat } from '@/hooks/use-format'
import {
  HelpCircle, Search, BookOpen, Code2, MessageSquare,
  FileText, CreditCard, ListTodo, BarChart3, Smartphone,
  Puzzle, Mail, Phone, MessageCircle, ChevronDown, ChevronUp,
  ExternalLink, Headphones
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const quickLinks = [
  { icon: BookOpen, title: 'Documentation', desc: 'Comprehensive guides and tutorials', href: '/documentation' },
  { icon: Code2, title: 'API Reference', desc: 'RESTful API docs and examples', href: '/documentation' },
  { icon: MessageSquare, title: 'Community Forum', desc: 'Connect with other users', href: '#' },
]

const helpTopics = [
  { icon: ListTodo, title: 'Getting Started', desc: 'Set up your account, create your first project, invite team members, and configure your workspace settings.', count: 12 },
  { icon: CreditCard, title: 'Account & Billing', desc: 'Manage subscriptions, update payment methods, view invoices, handle plan upgrades and downgrades.', count: 8 },
  { icon: ListTodo, title: 'Projects & Tasks', desc: 'Create projects, manage tasks and milestones, set dependencies, assign team members, and track progress.', count: 15 },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Build custom reports, configure dashboards, export data, and analyze project performance metrics.', count: 10 },
  { icon: Smartphone, title: 'Mobile App', desc: 'Install and configure the SmartBuild mobile app, manage offline access, and troubleshoot sync issues.', count: 7 },
  { icon: Puzzle, title: 'Integrations', desc: 'Connect with third-party tools like QuickBooks, Procore, AutoDesk, and custom webhooks.', count: 9 },
]

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password." Enter the email address associated with your account, and you\'ll receive a password reset link within a few minutes. The link expires after 24 hours. If you don\'t receive the email, check your spam folder or contact support for assistance.',
  },
  {
    question: 'Can I change my subscription plan at any time?',
    answer: 'Yes, you can upgrade or downgrade your subscription plan at any time from your Account Settings > Billing page. When upgrading, the new features become available immediately and you\'ll be charged a prorated amount for the remainder of your billing cycle. When downgrading, the change takes effect at the start of your next billing period.',
  },
  {
    question: 'How do I export my project data?',
    answer: 'You can export project data from the Projects section by selecting a project, clicking the "Export" button, and choosing your preferred format (CSV, Excel, or PDF). For bulk exports across multiple projects, use the Admin Dashboard > Data Export feature. Enterprise plan users can also access our REST API for automated data exports.',
  },
  {
    question: 'Is there a limit to the number of users on my account?',
    answer: 'User limits depend on your subscription plan: Starter (up to 10 users), Professional (up to 50 users), Business (up to 200 users), and Enterprise (unlimited users). You can view your current usage and limit on the Account Settings > Billing page. If you need additional seats, you can upgrade your plan or contact our sales team for custom pricing.',
  },
]

export default function SupportPage() {
  const { getCallingCode } = useFormat()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Headphones className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">
            How Can We Help?
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Find answers, get support, and learn how to get the most out of SmartBuild.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group flex items-center gap-4 p-5 rounded-xl border border-stone-200 hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <link.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">{link.title}</h3>
                <p className="text-sm text-stone-500">{link.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Help Topics */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8">Help Topics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpTopics.map((topic) => (
            <div
              key={topic.title}
              className="group p-5 rounded-xl border border-stone-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                <topic.icon className="w-5 h-5 text-stone-600 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">{topic.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-3">{topic.desc}</p>
              <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-xs">
                {topic.count} articles
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3 text-center">Contact Support</h2>
          <p className="text-stone-500 text-center mb-10 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you Monday through Friday, 8 AM to 8 PM EST.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">Email Support</h3>
              <p className="text-sm text-stone-500 mb-3">Response within 4 hours during business hours</p>
              <a href="mailto:support@smartbuild.com" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline">
                support@smartbuild.com
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 border border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">Phone Support</h3>
              <p className="text-sm text-stone-500 mb-3">Available for Business & Enterprise plans</p>
              <p className="text-emerald-600 text-sm font-medium">{getCallingCode()} 234 5678</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">Live Chat</h3>
              <p className="text-sm text-stone-500 mb-3">Chat with our team in real-time</p>
              <Button variant="outline" size="sm" className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs">
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-stone-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-stone-900">{faq.question}</span>
                </div>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 pl-13">
                  <div className="pl-8">
                    <p className="text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Still Need Help?</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            Our dedicated support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@smartbuild.com"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/documentation"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 px-6 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}