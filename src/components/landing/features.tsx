'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Users,
  Wrench,
  Globe,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  {
    id: 'project',
    label: 'Project Mgmt',
    icon: LayoutDashboard,
    title: 'Project Management',
    description:
      'Plan, execute, and track every project from groundbreaking to handover with full visibility and control.',
    bullets: [
      'Interactive Gantt charts with drag-and-drop scheduling',
      'Milestone tracking with automated alerts',
      'Centralized document management with version control',
      'RFI workflows with approval chains',
      'Portfolio dashboard for multi-project oversight',
    ],
    metrics: [
      { label: 'Projects Managed', value: '2,400+' },
      { label: 'Avg. On-Time Rate', value: '94%' },
      { label: 'Active Users', value: '18,500' },
      { label: 'RFIs Resolved/Mo', value: '3,200' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    title: 'Financial Management',
    description:
      'Real-time financial oversight with automated invoicing, multi-currency support, and comprehensive reporting.',
    bullets: [
      'Real-time budget tracking with variance analysis',
      'Automated invoicing and payment processing',
      'Multi-currency support for global projects',
      'Comprehensive financial reporting suite',
      'Progress billing tied to project milestones',
    ],
    metrics: [
      { label: 'Invoices Processed', value: '$1.2B' },
      { label: 'Avg. Approval Time', value: '1.2 Days' },
      { label: 'Cost Accuracy', value: '99.1%' },
      { label: 'Currencies Supported', value: '45' },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingCart,
    title: 'Procurement & Supply Chain',
    description:
      'Streamline purchasing, manage vendors, and track inventory from order to delivery.',
    bullets: [
      'Digital purchase order creation and tracking',
      'Vendor management with performance scoring',
      'Real-time inventory tracking across sites',
      'Material requisition workflows',
      'Automated bid analysis and comparison',
    ],
    metrics: [
      { label: 'POs Processed/Mo', value: '8,500' },
      { label: 'Vendor Network', value: '12,000+' },
      { label: 'Avg. Lead Time', value: '3.4 Days' },
      { label: 'Cost Savings', value: '18%' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce',
    icon: Users,
    title: 'Workforce Management',
    description:
      'Manage attendance, payroll, labour allocation, and performance analytics across all project sites.',
    bullets: [
      'Biometric and GPS-based attendance tracking',
      'Automated payroll processing with compliance',
      'Labour group allocation and scheduling',
      'Skill-based matching for task assignment',
      'Performance analytics and reporting',
    ],
    metrics: [
      { label: 'Workers Tracked', value: '85,000' },
      { label: 'Payroll Accuracy', value: '99.8%' },
      { label: 'Sites Connected', value: '1,200' },
      { label: 'Compliance Rate', value: '100%' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Wrench,
    title: 'Asset & Equipment Management',
    description:
      'Track equipment lifecycle, schedule maintenance, and optimize asset utilization across all projects.',
    bullets: [
      'Full equipment lifecycle tracking',
      'Preventive maintenance scheduling',
      'Real-time GPS tracking and geofencing',
      'Tool check-in/check-out management',
      'Automated depreciation calculations',
    ],
    metrics: [
      { label: 'Assets Tracked', value: '34,000' },
      { label: 'Utilization Rate', value: '87%' },
      { label: 'Downtime Reduced', value: '45%' },
      { label: 'Maintenance Alerts', value: '2,100/mo' },
    ],
  },
  {
    id: 'portal',
    label: 'Client Portal',
    icon: Globe,
    title: 'Client Portal',
    description:
      'Give clients real-time visibility into project progress, documents, and financials through a branded portal.',
    bullets: [
      'Real-time project progress visibility',
      'Secure document access and sharing',
      'Invoice review and approval workflows',
      'Integrated communication threads',
      'Milestone-based progress tracking',
    ],
    metrics: [
      { label: 'Client Satisfaction', value: '96%' },
      { label: 'Response Time', value: '<2 hrs' },
      { label: 'Documents Shared', value: '1.8M' },
      { label: 'Active Portals', value: '4,200' },
    ],
  },
]

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
}

export function Features() {
  const [active, setActive] = useState('project')
  const current = tabs.find((t) => t.id === active)!

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            Comprehensive{' '}
            <span className="text-[#ff5201]">Construction Management</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#595552]">
            Every tool your team needs, integrated into one platform
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActive(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#ff5201]/10 text-black'
                    : 'text-[#595552] hover:bg-gray-100 hover:text-black'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="feature-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5201] rounded-full"
                  />
                )}
              </Button>
            )
          })}
        </div>

        {/* Content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Left: Description + Bullets */}
          <AnimatePresence mode="wait">
            <motion.div key={current.id} {...fadeIn} className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-black">
                {current.title}
              </h3>
              <p className="mt-3 text-[#595552] leading-relaxed">
                {current.description}
              </p>
              <ul className="mt-5 space-y-3">
                {current.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#1a202c]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5201]" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Right: Metrics */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + '-metrics'}
              {...fadeIn}
              className="grid grid-cols-2 gap-4"
            >
              {current.metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <p className="text-3xl font-bold text-black">{m.value}</p>
                  <p className="mt-1 text-sm text-[#595552]">{m.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}