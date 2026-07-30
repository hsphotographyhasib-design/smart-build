'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles, BarChart3, FileSearch, AlertTriangle, Lightbulb } from 'lucide-react'

const AI_FEATURES = [
  {
    icon: BarChart3,
    title: 'Predictive Analytics',
    description: 'AI models analyze historical data to predict schedule delays, cost overruns, and resource bottlenecks before they happen.',
  },
  {
    icon: FileSearch,
    title: 'Intelligent Document Processing',
    description: 'Automatically extract, classify, and route information from drawings, specifications, and contracts using computer vision.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Early Warning',
    description: 'Continuous monitoring of project health indicators with ML-driven risk scoring and automated escalation protocols.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description: 'Context-aware suggestions for resource allocation, schedule optimization, and cost mitigation based on project patterns.',
  },
  {
    icon: Sparkles,
    title: 'Natural Language Queries',
    description: 'Ask questions in plain English: "Which projects are at risk of delay?" and get instant, data-driven answers.',
  },
  {
    icon: Brain,
    title: 'Automated Reporting',
    description: 'AI-generated daily, weekly, and monthly reports with narrative insights, trend analysis, and executive summaries.',
  },
]

export function LandingAI() {
  return (
    <section id="ai" className="section-landing bg-bg-grid-pattern" aria-label="AI Features">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Brain className="h-4 w-4" aria-hidden="true" />
            AI-Powered
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Construction intelligence.{' '}
            <span className="text-gradient">Built in.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Machine learning models trained on millions of construction data points
            deliver predictive insights that help you stay ahead of risks.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_FEATURES.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-xl border border-border bg-card p-6 card-lift"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 mb-4">
                <feature.icon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
