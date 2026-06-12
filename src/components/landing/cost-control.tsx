'use client'

import { motion } from 'framer-motion'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Tag,
  FileText,
  BarChart3,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const costFeatures = [
  {
    icon: Calculator,
    title: 'Budget Tracking',
    description:
      'Set, track, and compare budgets across all projects with real-time variance analysis.',
  },
  {
    icon: TrendingUp,
    title: 'Profitability Analysis',
    description:
      'Monitor profit margins, forecast completion costs, and identify savings opportunities.',
  },
  {
    icon: DollarSign,
    title: 'Cash Flow Management',
    description:
      'Manage incoming and outgoing payments with detailed cash flow forecasting.',
  },
  {
    icon: Tag,
    title: 'Cost Codes',
    description:
      'Organize costs by trade, phase, or activity with flexible cost code hierarchies.',
  },
  {
    icon: FileText,
    title: 'Change Orders',
    description:
      'Track change requests, approvals, and cost impacts with full audit trail.',
  },
  {
    icon: BarChart3,
    title: 'Forecasting',
    description:
      'AI-powered forecasting to predict final costs and identify budget risks early.',
  },
]

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const gridItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function CostDashboardMockup() {
  const budgetItems = [
    { name: 'Foundation', budget: 100, actual: 88, budgetColor: 'bg-blue-200', actualColor: 'bg-blue-600' },
    { name: 'Structure', budget: 100, actual: 95, budgetColor: 'bg-blue-200', actualColor: 'bg-blue-600' },
    { name: 'MEP', budget: 100, actual: 72, budgetColor: 'bg-blue-200', actualColor: 'bg-orange-500' },
    { name: 'Finishing', budget: 100, actual: 45, budgetColor: 'bg-blue-200', actualColor: 'bg-blue-500' },
    { name: 'Landscaping', budget: 100, actual: 30, budgetColor: 'bg-blue-200', actualColor: 'bg-blue-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-xl shadow-gray-200/50 md:p-8"
    >
      {/* Dashboard header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Project Cost Overview</h4>
          <p className="text-xs text-gray-400">Riverside Tower — Phase 2</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            <span className="text-[10px] text-gray-500">Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-[10px] text-gray-500">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-[10px] text-gray-500">Overrun</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Budget vs Actual bars */}
        <div className="space-y-3 md:col-span-2">
          {budgetItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-600">{item.name}</span>
                <span className="text-[10px] text-gray-400">
                  ${(item.actual * 12.5).toFixed(0)}k / ${(item.budget * 12.5).toFixed(0)}k
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-blue-100/50">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.08 }}
                  className={`absolute left-0 top-0 h-3 rounded-full ${item.budgetColor}`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.actual}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.6 + index * 0.08 }}
                  className={`absolute left-0 top-0 h-3 rounded-full ${item.actualColor}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right column: Pie chart + stat */}
        <div className="flex flex-col items-center gap-6">
          {/* CSS Pie chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative"
          >
            <div
              className="h-32 w-32 rounded-full"
              style={{
                background: `conic-gradient(
                  #2563eb 0deg 108deg,
                  #f97316 108deg 187deg,
                  #22c55e 187deg 252deg,
                  #a855f7 252deg 310deg,
                  #06b6d4 310deg 360deg
                )`,
              }}
            >
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Total Spent</div>
                  <div className="text-lg font-bold text-gray-800">$4.1M</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
            {[
              { label: 'Foundation', color: '#2563eb', pct: '30%' },
              { label: 'Structure', color: '#f97316', pct: '22%' },
              { label: 'MEP', color: '#22c55e', pct: '18%' },
              { label: 'Finishing', color: '#a855f7', pct: '16%' },
              { label: 'Landscape', color: '#06b6d4', pct: '14%' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.06 }}
                className="flex items-center gap-1.5"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-gray-500">
                  {item.label} <span className="font-medium text-gray-700">{item.pct}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom stat banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 1 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 px-6 py-4 sm:flex-row sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <ArrowDown className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-green-800">23% Cost Reduction Average</div>
            <div className="text-xs text-green-600">Across all projects using SmartBuild</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-200 bg-white text-green-700 hover:bg-green-50 shrink-0"
        >
          View Report
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

export function CostControl() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Complete <span className="text-blue-600">Cost Control</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Track every dollar from budget to completion
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {costFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={gridItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:border-blue-100"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Cost dashboard mockup */}
        <CostDashboardMockup />
      </div>
    </section>
  )
}