'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const CAPABILITIES = [
  'Real-time Gantt charts with CPM analysis',
  'Integrated cost & earned value management',
  'AI-powered schedule risk detection',
  'Mobile-first field data collection',
  'Automated daily progress reports',
  'Multi-currency & multi-company support',
  'Role-based access & audit trails',
  'Seamless Primavera P6 import/export',
]

export function LandingPlatform() {
  return (
    <section id="platform" className="section-landing bg-hero-gradient text-white overflow-hidden" aria-label="Platform Preview">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div className="container-landing relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <motion.span
              className="inline-block text-sm font-semibold text-brand-orange-light uppercase tracking-widest mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Unified Platform
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              One platform.{' '}
              <span className="text-gradient">Total control.</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Replace disconnected spreadsheets and legacy tools with a single
              source of truth. SmartBuild connects every stakeholder, every
              document, and every decision in one intelligent workspace.
            </motion.p>
            <motion.ul
              className="mt-8 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              {CAPABILITIES.map((cap) => (
                <li key={cap} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-brand-orange-light mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-sm text-slate-300">{cap}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-xl lg:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 lg:p-6">
              {/* Mini dashboard mockup */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-brand-orange/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-brand-orange" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Project Alpha</p>
                  <p className="text-xs text-slate-400">On Track &middot; 68% Complete</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Schedule', value: 68, color: 'bg-brand-orange' },
                  { label: 'Budget', value: 72, color: 'bg-brand-blue-light' },
                  { label: 'Quality', value: 91, color: 'bg-emerald-500' },
                  { label: 'Safety', value: 100, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white/5 p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-slate-300 font-medium">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Recent Activity</p>
                {[
                  { text: 'MEP rough-in completed — Level 12', time: '2h ago', dot: 'bg-emerald-400' },
                  { text: 'RFI #342 responded by consultant', time: '4h ago', dot: 'bg-brand-blue-light' },
                  { text: 'Safety inspection passed — Zone C', time: '6h ago', dot: 'bg-emerald-400' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.dot} shrink-0`} />
                    <span className="text-slate-300 flex-1">{item.text}</span>
                    <span className="text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-brand-orange/15 rounded-full blur-2xl" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
