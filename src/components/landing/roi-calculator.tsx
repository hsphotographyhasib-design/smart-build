'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Calculator } from 'lucide-react'

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => {
    if (value >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M${suffix}`
    if (value >= 1_000) return `${prefix}${Math.round(v).toLocaleString()}${suffix}`
    return `${prefix}${Math.round(v)}${suffix}`
  })

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.2, ease: 'easeOut' })
    return controls.stop
  }, [value, motionVal])

  return <motion.span>{rounded}</motion.span>
}

interface SavingsBar {
  label: string
  percent: number
  color: string
}

export function ROICalculator() {
  const [projects, setProjects] = useState(12)
  const [avgValue, setAvgValue] = useState(500000)
  const [employees, setEmployees] = useState(25)
  const [adminHours, setAdminHours] = useState(40)
  const [calculated, setCalculated] = useState(false)

  const annualAdminCost = adminHours * 52 * 35 // $35/hr avg admin cost
  const adminSavings = annualAdminCost * 0.4 // 40% reduction
  const reworkSavings = projects * avgValue * 0.05 // 5% rework reduction
  const productivityGain = employees * 0.25 // 25% productivity improvement
  const totalSavings = adminSavings + reworkSavings
  const timeSaved = Math.round(adminHours * 0.4 * 52)
  const productivityPct = 25
  const roiPct = Math.round((totalSavings / (employees * 500)) * 100)

  const bars: SavingsBar[] = [
    { label: 'Admin Automation', percent: 40, color: 'bg-[#ff5201]' },
    { label: 'Rework Reduction', percent: Math.min(100, Math.round((reworkSavings / totalSavings) * 100)) || 30, color: 'bg-amber-400' },
    { label: 'Labour Productivity', percent: 25, color: 'bg-emerald-400' },
    { label: 'Material Savings', percent: 15, color: 'bg-sky-400' },
  ]

  const handleCalculate = useCallback(() => {
    setCalculated(false)
    requestAnimationFrame(() => setCalculated(true))
  }, [])

  return (
    <section className="bg-[#000000] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5201]/10 px-4 py-1.5 text-xs font-medium text-[#ff5201]">
            <Calculator className="h-3.5 w-3.5" />
            Free ROI Analysis
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Calculate Your ROI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            See how much SmartBuild can save
          </p>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
          >
            <h3 className="mb-6 text-lg font-semibold text-white">
              Enter Your Details
            </h3>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">
                  Projects Per Year
                </label>
                <input
                  type="number"
                  value={projects}
                  onChange={(e) => setProjects(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff5201]/60"
                  min={1}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">
                  Average Project Value ($)
                </label>
                <input
                  type="number"
                  value={avgValue}
                  onChange={(e) => setAvgValue(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff5201]/60"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">
                  Number of Employees
                </label>
                <input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff5201]/60"
                  min={1}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">
                  Admin Hours / Week
                </label>
                <input
                  type="number"
                  value={adminHours}
                  onChange={(e) => setAdminHours(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff5201]/60"
                  min={0}
                />
              </div>
              <button
                onClick={handleCalculate}
                className="mt-2 w-full rounded-lg bg-[#ff5201] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e64a00] active:scale-[0.98]"
              >
                Calculate ROI
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            {calculated ? (
              <div className="space-y-6">
                {/* Big savings number */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                  <p className="text-sm text-white/50">Estimated Annual Savings</p>
                  <p className="mt-2 text-4xl font-bold text-[#ff5201] sm:text-5xl">
                    <AnimatedNumber value={totalSavings} prefix="$" />
                  </p>
                  <p className="mt-1 text-xs text-white/40">per year with SmartBuild</p>
                </div>

                {/* 3 stat cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={timeSaved} suffix="hrs" />
                    </p>
                    <p className="mt-1 text-xs text-white/50">Time Saved</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={productivityPct} suffix="%" />
                    </p>
                    <p className="mt-1 text-xs text-white/50">Productivity ↑</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      <AnimatedNumber value={roiPct} suffix="%" />
                    </p>
                    <p className="mt-1 text-xs text-white/50">ROI</p>
                  </div>
                </div>

                {/* Breakdown bars */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="mb-4 text-sm font-semibold text-white">
                    Savings Breakdown
                  </p>
                  <div className="space-y-4">
                    {bars.map((bar, i) => (
                      <div key={i}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-white/60">{bar.label}</span>
                          <span className="text-xs font-medium text-white/80">
                            {bar.percent}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.percent}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                            className={`h-full rounded-full ${bar.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8">
                <div className="text-center">
                  <Calculator className="mx-auto h-12 w-12 text-white/20" />
                  <p className="mt-4 text-sm text-white/40">
                    Enter your details and click &ldquo;Calculate ROI&rdquo; to see
                    your estimated savings
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}