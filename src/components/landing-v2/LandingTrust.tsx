'use client'

import { motion } from 'framer-motion'

const LOGOS = [
  'Gamuda', 'UEM Sunrise', 'IJM Corporation', 'YTL Corporation',
  'Sunway Construction', 'Malaysia Airports', 'Petronas', 'Prasarana',
] as const

export function LandingTrust() {
  return (
    <section className="section-landing border-b border-border bg-background" aria-label="Trusted by leading organizations">
      <div className="container-landing">
        <motion.p
          className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by 500+ construction leaders worldwide
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:gap-x-14">
          {LOGOS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-center h-10 opacity-40 hover:opacity-70 transition-opacity"
            >
              <span className="font-display text-lg lg:text-xl font-semibold tracking-tight text-foreground">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
