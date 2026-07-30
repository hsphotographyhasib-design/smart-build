'use client'

import { motion } from 'framer-motion'
import { Building, Factory, Hotel, Hospital, Landmark, Plane, School, Ship, Store, Zap, TrainFront } from 'lucide-react'

type Industry = {
  icon: React.ElementType
  title: string
  description: string
}

const INDUSTRIES: Industry[] = [
  { icon: Building, title: 'Commercial Construction', description: 'Office towers, mixed-use developments, and retail complexes' },
  { icon: Factory, title: 'Industrial & Manufacturing', description: 'Factories, warehouses, and production facilities' },
  { icon: Landmark, title: 'Infrastructure & Civil', description: 'Roads, bridges, tunnels, and public utilities' },
  { icon: Hotel, title: 'Hospitality & Residential', description: 'Hotels, condominiums, and housing developments' },
  { icon: Hospital, title: 'Healthcare Facilities', description: 'Hospitals, clinics, and medical research centers' },
  { icon: School, title: 'Education Institutions', description: 'Universities, schools, and research campuses' },
  { icon: Plane, title: 'Aviation & Transport', description: 'Airports, rail systems, and transport hubs' },
  { icon: Zap, title: 'Energy & Utilities', description: 'Power plants, renewables, and utility networks' },
  { icon: Store, title: 'Retail & Commercial', description: 'Shopping malls, supermarkets, and retail chains' },
  { icon: Ship, title: 'Marine & Offshore', description: 'Ports, offshore platforms, and marine structures' },
  { icon: TrainFront, title: 'Rail & Transit', description: 'Mass transit systems, LRT, MRT, and rail infrastructure' },
]

export function LandingIndustries() {
  return (
    <section id="industries" className="section-landing bg-muted/30" aria-label="Industries">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <motion.span
            className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Industries We Serve
          </motion.span>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Built for every sector.{' '}
            <span className="text-gradient">Proven across all.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            From highways to hospitals, SmartBuild adapts to the unique demands
            of your industry with configurable workflows and templates.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {INDUSTRIES.map((ind, i) => (
            <motion.article
              key={ind.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 card-lift"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 dark:bg-white/5">
                <ind.icon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-1">{ind.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ind.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
