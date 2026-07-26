'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MapPin, TrendingUp, Clock } from 'lucide-react'

const CASE_STUDIES = [
  {
    client: 'Gamuda Berhad',
    project: 'Jenjarom Township Development',
    location: 'Selangor, Malaysia',
    duration: '3.5 years',
    challenge: 'Managing a 1,200-unit mixed-development with 14 concurrent contractors and complex infrastructure dependencies.',
    results: [
      'Schedule acceleration by 4 months',
      '22% reduction in RFIs through proactive issue detection',
      'Zero lost-time injuries across 2.8M man-hours',
    ],
    metric: 'RM 1.2B',
    metricLabel: 'Project Value',
  },
  {
    client: 'UEM Sunrise',
    project: 'Aerospace Hub Malaysia',
    location: 'Selangor, Malaysia',
    duration: '2 years',
    challenge: 'Delivering a precision aerospace facility with stringent quality requirements and tight commissioning timelines.',
    results: [
      'Delivered 2 weeks ahead of schedule',
      '99.7% first-time quality pass rate',
      'Single platform for 8 specialist contractors',
    ],
    metric: 'RM 680M',
    metricLabel: 'Project Value',
  },
  {
    client: 'Malaysia Airports',
    project: 'KLIA Terminal Expansion',
    location: 'Sepang, Malaysia',
    duration: '4 years',
    challenge: 'Expanding an operational international airport with zero disruption to existing passenger flows and flight operations.',
    results: [
      'Zero flight disruptions during construction',
      '35% improvement in project coordination efficiency',
      'Automated compliance reporting saved 120 hours/month',
    ],
    metric: 'RM 3.5B',
    metricLabel: 'Project Value',
  },
]

export function LandingCaseStudies() {
  return (
    <section id="resources" className="section-landing bg-muted/30" aria-label="Case Studies">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Proven Results
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Real projects.{' '}
            <span className="text-gradient">Real impact.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <motion.article
              key={cs.project}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-xl border border-border bg-card overflow-hidden card-lift"
            >
              {/* Header */}
              <div className="bg-brand-navy p-5 lg:p-6">
                <p className="text-sm font-semibold text-brand-orange-light">{cs.client}</p>
                <h3 className="font-display text-lg font-bold text-white mt-1">{cs.project}</h3>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />{cs.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />{cs.duration}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 lg:p-6 flex flex-col flex-1">
                {/* Metric */}
                <div className="mb-4">
                  <p className="font-display text-2xl font-bold text-brand-orange">{cs.metric}</p>
                  <p className="text-xs text-muted-foreground">{cs.metricLabel}</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  <span className="font-medium text-foreground">Challenge:</span> {cs.challenge}
                </p>

                <div className="space-y-2 flex-1">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Key Results</p>
                  {cs.results.map((r) => (
                    <div key={r} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-dark transition-colors tap-target"
                  >
                    Read Full Case Study
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
