'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Ahmad Razali',
    role: 'Project Director, Gamuda Berhad',
    quote:
      'SmartBuild transformed how we manage our mega-projects. We reduced schedule overruns by 35% and improved cross-team communication dramatically. The AI risk predictions have been a game-changer.',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'VP of Operations, UEM Sunrise',
    quote:
      'After evaluating every major platform on the market, SmartBuild was the only one that understood construction at an enterprise level. The integration with our existing Primavera schedules was seamless.',
    rating: 5,
  },
  {
    name: 'Raj Kumar',
    role: 'Head of PMO, IJM Corporation',
    quote:
      'We consolidated 12 different tools into SmartBuild. The result? Our PMO now has real-time visibility across 47 active projects. Reporting that used to take weeks now takes minutes.',
    rating: 5,
  },
  {
    name: 'Nurul Aisyah',
    role: 'Digital Transformation Lead, Sunway Construction',
    quote:
      'The mobile-first approach means our site teams actually use it. Daily report submissions went from 40% compliance to 98% within the first month of deployment.',
    rating: 5,
  },
  {
    name: 'David Tan',
    role: 'CEO, Premier Builders Group',
    quote:
      'SmartBuild\'s AI-powered forecasting saved us from two potential budget overruns last quarter. The system flagged the risks weeks before they became critical issues.',
    rating: 5,
  },
  {
    name: 'Fatimah Zahra',
    role: 'Director of HSE, Malaysia Airports',
    quote:
      'Safety is non-negotiable in aviation construction. SmartBuild\'s HSE module with real-time incident tracking and automated compliance reporting has been invaluable for our operations.',
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section className="section-landing bg-background" aria-label="Testimonials">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What Our Clients Say
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Trusted by industry{' '}
            <span className="text-gradient">leaders.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col rounded-xl border border-border bg-card p-6 card-lift"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <Quote className="h-6 w-6 text-brand-orange/30 mb-3 shrink-0" aria-hidden="true" />
              <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 pt-4 border-t border-border">
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
