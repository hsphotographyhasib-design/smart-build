'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardList,
  ShoppingCart,
  Package,
  DollarSign,
  Target,
  UserCog,
  Wallet,
  Wrench,
  CalendarRange,
  Building,
  Smartphone,
  BarChart3,
  Brain,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const features: {
  title: string
  description: string
  icon: LucideIcon
  slug: string
  color: string
}[] = [
  {
    title: 'Project Management',
    description:
      'Plan, execute, and track construction projects with full visibility',
    icon: LayoutDashboard,
    slug: 'project-management',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Resource Management',
    description:
      'Optimize workforce, equipment, and materials across all projects',
    icon: Users,
    slug: 'resource-management',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Complaint Management',
    description:
      'Handle client complaints with automated workflows and SLA tracking',
    icon: MessageSquare,
    slug: 'complaint-management',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Work Orders',
    description:
      'Generate, assign, and track work orders from creation to completion',
    icon: ClipboardList,
    slug: 'work-orders',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'Preventive Maintenance',
    description:
      'Schedule and automate preventive maintenance to reduce downtime',
    icon: CalendarRange,
    slug: 'preventive-maintenance',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Procurement',
    description:
      'Manage purchase requests, orders, suppliers, and delivery tracking',
    icon: ShoppingCart,
    slug: 'procurement',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Inventory',
    description:
      'Track materials, equipment, and tools with real-time stock levels',
    icon: Package,
    slug: 'inventory',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Finance',
    description:
      'Complete financial management with invoicing, payments, and cashflow',
    icon: DollarSign,
    slug: 'finance',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'Cost Control',
    description:
      'Monitor budgets, track costs, forecast expenses, and manage change orders',
    icon: Target,
    slug: 'cost-control',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'HR Management',
    description:
      'Employee records, leave management, and workforce administration',
    icon: UserCog,
    slug: 'hr',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Payroll',
    description:
      'Automated payroll processing with attendance integration',
    icon: Wallet,
    slug: 'payroll',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Asset Management',
    description:
      'Track and manage all company assets throughout their lifecycle',
    icon: Wrench,
    slug: 'asset-management',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'Scheduling',
    description:
      'Gantt charts, critical path, and resource-loaded scheduling',
    icon: CalendarRange,
    slug: 'scheduling',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Client Portal',
    description:
      'Give clients visibility into project progress, invoices, and documents',
    icon: Building,
    slug: 'client-portal',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Mobile App',
    description:
      'Full-featured mobile app with offline support and GPS tracking',
    icon: Smartphone,
    slug: 'mobile-app',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Reporting & Analytics',
    description:
      'Generate custom reports with PDF/Excel export and real-time dashboards',
    icon: BarChart3,
    slug: 'reporting',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'AI Assistant',
    description:
      'AI-powered insights, predictions, and automated recommendations',
    icon: Brain,
    slug: 'ai-assistant',
    color: 'bg-amber-100 text-amber-600',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Everything You Need to{' '}
            <span className="text-amber-400">Build Smarter</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300">
            Comprehensive tools designed for the modern construction industry
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-neutral-400 sm:gap-6">
            {['16+ Modules', '99.9% Uptime', '500+ Companies'].map(
              (stat) => (
                <span key={stat} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {stat}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${feature.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 transition-colors group-hover:text-amber-700">
                    Learn More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            See SmartBuild in Action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            Schedule a personalized demo and discover how SmartBuild can
            transform your construction operations.
          </p>
          <Link
            href="/request-demo"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            Request a Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}