'use client'

import { motion } from 'framer-motion'
import { ClipboardList, Eye, Settings, Rocket, TrendingUp } from 'lucide-react'

const STEPS = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Plan & Baseline',
    description:
      'Define your WBS, load resources, set baselines, and establish your project controls framework with our guided setup wizard.',
  },
  {
    icon: Eye,
    step: '02',
    title: 'Monitor & Control',
    description:
      'Track progress in real-time with automated data capture, daily reports, and exception-based alerts that keep you focused on what matters.',
  },
  {
    icon: Settings,
    step: '03',
    title: 'Collaborate & Execute',
    description:
      'Connect teams across organizations with shared workflows, RFIs, submittals, and integrated communication channels.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Analyze & Optimize',
    description:
      'Leverage AI-powered analytics to identify risks early, forecast outcomes, and continuously improve project performance.',
  },
  {
    icon: Rocket,
    step: '05',
    title: 'Deliver & Closeout',
    description:
      'Streamline handover with automated closeout checklists, as-built documentation, and lessons-learned capture.',
  },
]

export function LandingWorkflow() {
  return (
    <section id="workflow" className="section-landing bg-background" aria-label="How it works">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            From blueprint to building.{' '}
            <span className="text-gradient">Simplified.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Five steps. One platform. Total project control.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div
            className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px"
            aria-hidden="true"
          />

          <div className="space-y-10 lg:space-y-16">
            {STEPS.map((step, i) => {
              const isEven = i % 2 === 0
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-start gap-6 lg:gap-12 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Node */}
                  <div
                    className={`absolute left-6 lg:left-1/2 -translate-x-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white font-display font-bold text-sm shadow-lg shadow-brand-orange/25`}
                    aria-hidden="true"
                  >
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className={`ml-20 lg:ml-0 lg:w-[calc(50%-3.5rem)] ${isEven ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                    <div className={`flex items-center gap-3 mb-3 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                      <step.icon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
                      <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden lg:block lg:w-[calc(50%-3.5rem)]" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
