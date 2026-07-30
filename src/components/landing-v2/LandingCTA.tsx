'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const PERKS = [
  '14-day free trial, no credit card required',
  'Personalized onboarding & training',
  'Full access to all 17 modules',
  'Dedicated customer success manager',
]

export function LandingCTA() {
  return (
    <section id="contact" className="section-landing bg-hero-gradient text-white overflow-hidden" aria-label="Call to Action">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-orange/15 rounded-full blur-[100px]" aria-hidden="true" />

      <div className="container-landing relative z-10 text-center">
        <motion.h2
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to transform your{' '}
          <span className="text-gradient">project delivery?</span>
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-slate-300 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          Join 500+ construction leaders who have already made the switch.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Button
            size="lg"
            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold h-12 px-8 text-base"
            asChild
          >
            <a href="/register">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white font-medium h-12 px-8 text-base"
            asChild
          >
            <a href="#">Schedule Demo</a>
          </Button>
        </motion.div>

        <motion.ul
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-orange-light" aria-hidden="true" />
              {perk}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
