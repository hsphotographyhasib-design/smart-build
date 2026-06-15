'use client'

import Link from 'next/link'
import {
  BookOpen, Rocket, Code2, Terminal, Blocks, BarChart3,
  CreditCard, ListTodo, Wrench, Users, Smartphone, Puzzle,
  ChevronRight, ArrowRight, CheckCircle, ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const quickStartSteps = [
  {
    step: '1',
    title: 'Create Your Account',
    desc: 'Sign up for a free SmartBuild account. Choose your plan (Starter is free for up to 10 users) and verify your email address to get started.',
  },
  {
    step: '2',
    title: 'Set Up Your First Project',
    desc: 'Create a new project, define your budget and timeline, add team members, and configure project phases. Import existing data from CSV or connect via API.',
  },
  {
    step: '3',
    title: 'Start Building',
    desc: 'Begin creating tasks, tracking progress, managing documents, and collaborating with your team. Explore reports and integrations to maximize productivity.',
  },
]

const productDocs = [
  { icon: ListTodo, title: 'Project Management', desc: 'Projects, tasks, milestones, Gantt charts, dependencies, and resource allocation.' },
  { icon: CreditCard, title: 'Financial Management', desc: 'Budgets, cost estimation, invoicing, payment tracking, and financial reports.' },
  { icon: Users, title: 'HR & Workforce', desc: 'Employee management, attendance, payroll, and performance reviews.' },
  { icon: Wrench, title: 'Maintenance Management', desc: 'Work orders, preventive maintenance, SLA tracking, and technician dispatch.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Custom dashboards, KPI tracking, data export, and business intelligence.' },
  { icon: Blocks, title: 'Inventory & Assets', desc: 'Material management, equipment tracking, procurement, and warehouse operations.' },
  { icon: Smartphone, title: 'Mobile App', desc: 'iOS and Android apps for on-site project management and field data collection.' },
  { icon: Puzzle, title: 'Integrations', desc: 'Connect with QuickBooks, Procore, AutoDesk, Zapier, and custom webhooks.' },
]

const recentReleases = [
  {
    version: 'v4.2.0',
    date: 'December 28, 2024',
    title: 'Maintenance Management Module',
    changes: [
      'New work order management with auto-numbering',
      'Preventive maintenance scheduling with PM templates',
      'Technician dispatch center with real-time availability',
      'SLA tracking with breach alerts and escalation rules',
      'Material request workflow with multi-level approval',
    ],
  },
  {
    version: 'v4.1.0',
    date: 'November 15, 2024',
    title: 'Enhanced Reporting Engine',
    changes: [
      'New report builder with drag-and-drop interface',
      'Scheduled report delivery via email',
      'Custom KPI widgets for dashboards',
      'Export to PDF, Excel, and CSV with custom templates',
      'Performance improvements: 3x faster report generation',
    ],
  },
  {
    version: 'v4.0.0',
    date: 'October 1, 2024',
    title: 'SmartBuild 4.0 — Complete Redesign',
    changes: [
      'Entirely new user interface with improved navigation',
      'Real-time collaboration with live cursors and presence',
      'AI-powered project risk assessment and cost prediction',
      'New mobile app with offline support and photo sync',
      'Role-based access control with custom permission sets',
    ],
  },
]

export default function DocumentationPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">
            Documentation
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
            Comprehensive guides, API reference, and technical resources to help you get the most out of SmartBuild.
          </p>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Quick Start Guide</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {quickStartSteps.map((item) => (
            <div key={item.step} className="relative p-6 rounded-xl border border-stone-200 bg-white">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-stone-900 text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            Read Full Getting Started Guide
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Product Documentation */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-stone-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Product Documentation</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {productDocs.map((doc) => (
              <div
                key={doc.title}
                className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                  <doc.icon className="w-5 h-5 text-stone-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{doc.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-1 group-hover:text-emerald-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-stone-200" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">API Reference</h2>
        </div>
        <div className="bg-stone-900 rounded-2xl p-6 md:p-8 overflow-hidden">
          <div className="space-y-6">
            {/* Base URL */}
            <div>
              <p className="text-stone-400 text-sm mb-2">Base URL</p>
              <code className="text-emerald-400 text-sm md:text-base font-mono">
                https://api.smartbuild.com/v1
              </code>
            </div>

            {/* Auth */}
            <div>
              <p className="text-stone-400 text-sm mb-2">Authentication</p>
              <p className="text-stone-300 text-sm leading-relaxed">
                All API requests require a Bearer token in the Authorization header. Generate your API key from{' '}
                <span className="text-emerald-400">Settings &gt; API Keys</span> in your SmartBuild dashboard.
              </p>
              <div className="mt-3 bg-stone-800 rounded-lg p-4 overflow-x-auto">
                <code className="text-stone-300 text-xs md:text-sm font-mono whitespace-nowrap">
                  Authorization: Bearer {'<'}your-api-key{'>'}
                </code>
              </div>
            </div>

            {/* Example Endpoints */}
            <div>
              <p className="text-stone-400 text-sm mb-3">Example Endpoints</p>
              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/projects', desc: 'List all projects' },
                  { method: 'POST', path: '/projects', desc: 'Create a new project' },
                  { method: 'GET', path: '/projects/:id/tasks', desc: 'List tasks for a project' },
                  { method: 'PUT', path: '/tasks/:id', desc: 'Update a task' },
                  { method: 'GET', path: '/reports/financial', desc: 'Generate financial report' },
                ].map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="flex items-center gap-3 bg-stone-800 rounded-lg px-4 py-2.5"
                  >
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      endpoint.method === 'GET' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-stone-300 text-xs md:text-sm font-mono flex-1">
                      {endpoint.path}
                    </code>
                    <span className="text-stone-500 text-xs hidden sm:inline">{endpoint.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Docs Link */}
            <div className="pt-2">
              <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full API Reference
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs & Libraries */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-stone-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">SDKs & Libraries</h2>
          </div>
          <p className="text-stone-500 mb-8 max-w-2xl">
            Official client libraries to help you integrate SmartBuild into your applications faster. All SDKs are open-source and available on GitHub.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'JavaScript / Node.js', pkg: '@smartbuild/sdk', desc: 'Full-featured SDK for Node.js and browsers with TypeScript support.' },
              { name: 'Python', pkg: 'smartbuild-python', desc: 'Python client library with async support and Pydantic models.' },
              { name: 'REST API', pkg: 'OpenAPI 3.0 Spec', desc: 'Complete OpenAPI specification for generating clients in any language.' },
            ].map((sdk) => (
              <div key={sdk.name} className="bg-white rounded-xl p-5 border border-stone-100">
                <h3 className="font-semibold text-stone-900 mb-1">{sdk.name}</h3>
                <code className="text-emerald-600 text-xs font-mono">{sdk.pkg}</code>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">{sdk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Release Notes */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Release Notes</h2>
        </div>
        <div className="space-y-6">
          {recentReleases.map((release) => (
            <div key={release.version} className="border border-stone-200 rounded-xl p-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-emerald-50 text-emerald-700 font-mono text-xs">{release.version}</Badge>
                <h3 className="font-semibold text-stone-900">{release.title}</h3>
                <span className="text-sm text-stone-400">{release.date}</span>
              </div>
              <ul className="space-y-2">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-emerald-500 mt-1 shrink-0">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
            View All Release Notes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Need More Help?</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            If you can&apos;t find what you&apos;re looking for, our support team and community are here to assist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 px-6 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Read the Blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}