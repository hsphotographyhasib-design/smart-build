'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Clock,
  TrendingUp,
  Percent,
  Calculator,
  Users,
  Briefcase,
  Timer,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  return `$${value.toLocaleString('en-US')}`
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="tabular-nums"
      >
        {prefix}{formatNumber(Math.round(value))}{suffix}
      </motion.span>
    </AnimatePresence>
  )
}

interface InputFieldProps {
  id: string
  label: string
  icon: React.ElementType
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  min?: number
}

function InputField({ id, label, icon: Icon, value, onChange, prefix, suffix, min = 0 }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-blue-100 text-sm font-medium flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-300" />
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className={`
            bg-white/10 border-white/20 text-white placeholder:text-blue-300/50
            focus-visible:border-orange-400 focus-visible:ring-orange-400/30
            h-12 text-lg font-semibold
            ${prefix ? 'pl-8' : 'pl-3'}
            ${suffix ? 'pr-16' : 'pr-3'}
          `}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export function ROICalculator() {
  const [projectsPerYear, setProjectsPerYear] = useState(12)
  const [avgProjectValue, setAvgProjectValue] = useState(500000)
  const [numEmployees, setNumEmployees] = useState(25)
  const [adminHoursPerWeek, setAdminHoursPerWeek] = useState(40)

  const results = useMemo(() => {
    const timeSaved = adminHoursPerWeek * 0.35
    const costSaved = (numEmployees * 50000 * 0.25) + (projectsPerYear * 15000)
    const productivity = 28
    const roi = projectsPerYear > 0 ? (costSaved / (projectsPerYear * 250)) * 100 : 0

    const adminSavings = Math.round(timeSaved * 52 * 35) // hours/week * weeks * avg hourly rate
    const laborSavings = Math.round(numEmployees * 50000 * 0.25)
    const projectSavings = Math.round(projectsPerYear * 15000)
    const totalSavings = laborSavings + projectSavings

    return {
      timeSaved: Math.round(timeSaved * 10) / 10,
      costSaved: Math.round(totalSavings),
      productivity,
      roi: Math.round(roi),
      breakdown: [
        { label: 'Labor Efficiency', value: laborSavings, color: 'bg-green-400' },
        { label: 'Project Savings', value: projectSavings, color: 'bg-blue-400' },
        { label: 'Admin Time Savings', value: adminSavings, color: 'bg-orange-400' },
      ],
    }
  }, [projectsPerYear, avgProjectValue, numEmployees, adminHoursPerWeek])

  const maxBreakdown = Math.max(...results.breakdown.map((b) => b.value), 1)

  const resultCards = [
    {
      label: 'Estimated Annual Savings',
      value: <AnimatedNumber value={results.costSaved} prefix="$" />,
      sublabel: 'Per year with SmartBuild',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20',
    },
    {
      label: 'Time Saved Per Week',
      value: <AnimatedNumber value={results.timeSaved} suffix=" hrs" />,
      sublabel: 'Reduced admin workload',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
    },
    {
      label: 'Productivity Increase',
      value: <AnimatedNumber value={results.productivity} suffix="%" />,
      sublabel: 'Average team productivity gain',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20',
    },
    {
      label: 'Return on Investment',
      value: <AnimatedNumber value={results.roi} suffix="%" />,
      sublabel: 'First year projected ROI',
      icon: Percent,
      color: 'text-white',
      bgColor: 'bg-white/10',
      borderColor: 'border-white/20',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 relative overflow-hidden" id="roi-calculator">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Calculator className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-blue-100 font-medium">Free ROI Analysis</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calculate Your ROI
          </h2>
          <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
            See how much SmartBuild can save your business
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Input Form */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Your Business Details</h3>
            <p className="text-blue-200/60 text-sm mb-8">
              Enter your numbers below to get a personalized estimate
            </p>

            <div className="space-y-6">
              <InputField
                id="projects"
                label="Projects Per Year"
                icon={Briefcase}
                value={projectsPerYear}
                onChange={setProjectsPerYear}
                min={1}
              />
              <InputField
                id="value"
                label="Average Project Value"
                icon={DollarSign}
                value={avgProjectValue}
                onChange={setAvgProjectValue}
                prefix="$"
                min={1000}
              />
              <InputField
                id="employees"
                label="Number of Employees"
                icon={Users}
                value={numEmployees}
                onChange={setNumEmployees}
                min={1}
              />
              <InputField
                id="admin-hours"
                label="Current Admin Hours/Week"
                icon={Timer}
                value={adminHoursPerWeek}
                onChange={setAdminHoursPerWeek}
                suffix="hrs"
                min={1}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/25 text-base cursor-pointer"
              >
                Calculate ROI
              </motion.button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Main savings highlight */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
              layout
            >
              <p className="text-blue-200/70 text-sm font-medium mb-2">Estimated Annual Savings</p>
              <div className="text-5xl md:text-6xl font-bold text-green-400 mb-1">
                <AnimatedNumber value={results.costSaved} prefix="$" />
              </div>
              <p className="text-blue-200/50 text-sm">Per year with SmartBuild</p>
            </motion.div>

            {/* Stat cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {resultCards.slice(1).map((card, index) => (
                <motion.div
                  key={card.label}
                  className={`bg-white/5 backdrop-blur-xl border ${card.borderColor} rounded-xl p-4 text-center`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <card.icon className={`w-5 h-5 ${card.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${card.color} mb-0.5`}>
                    {card.value}
                  </div>
                  <p className="text-blue-200/50 text-xs">{card.sublabel}</p>
                </motion.div>
              ))}
            </div>

            {/* Savings Breakdown */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-blue-100 mb-4">Savings Breakdown</h4>
              <div className="space-y-3">
                {results.breakdown.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-200/70">{item.label}</span>
                      <span className="text-white font-semibold">${formatNumber(item.value)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max((item.value / maxBreakdown) * 100, 5)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}